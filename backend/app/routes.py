from flask import Blueprint, request, make_response, jsonify, session
from sqlalchemy.sql.expression import func
from sqlalchemy.exc import IntegrityError
from . import db
from .models import User, Event, Category, EventCategory

bp = Blueprint('main', __name__)

@bp.route('/api/')
def index():
    # This welcome route for easier testing.
    return make_response(jsonify({"message": "Welcome to the Tech Time Capsule API!"}), 200)

# --- USER AUTHENTICATION ROUTES ---
@bp.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password: return make_response(jsonify({'error': 'Username and password are required'}), 400)
    try:
        user = User(username=username)
        user.password_hash = password
        db.session.add(user)
        db.session.commit()
        session['user_id'] = user.id
        return make_response(jsonify(user.to_dict()), 201)
    except IntegrityError:
        db.session.rollback()
        return make_response(jsonify({'error': 'Username already exists'}), 422)
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({'error': f'An unexpected error occurred: {e}'}), 400)

@bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password: return make_response(jsonify({'error': 'Username and password are required'}), 400)
    user = User.query.filter_by(username=username).first()
    if user and user.authenticate(password):
        session['user_id'] = user.id
        return make_response(jsonify(user.to_dict()), 200)
    return make_response(jsonify({'error': 'Invalid username or password'}), 401)

@bp.route('/api/events', methods=['GET'])
def handle_events():
    query = Event.query
    args = request.args

    years_str = args.get('years')
    # if the multi-year text filter is being used.
    if years_str:
        try:
            # If it is, this becomes our ONLY year filter.
            year_list = [int(y.strip()) for y in years_str.split(',') if y.strip().isdigit()]
            if year_list:
                query = query.filter(Event.year.in_(year_list))
        except ValueError:
            return make_response(jsonify({"error": "Invalid year format"}), 400)
    else:
        # If the text filter is NOT used, then we fall back to the year from the date/month picker.
        year = args.get('year', type=int)
        if year:
            query = query.filter(Event.year == year)

    # Month and day filters work independently.
    month = args.get('month', type=int)
    day = args.get('day', type=int)
    if month:
        query = query.filter(Event.month == month)
    if day:
        query = query.filter(Event.day == day)
                
    events = query.order_by(Event.year.asc(), Event.month.asc(), Event.day.asc()).all()
    return make_response(jsonify([e.to_dict() for e in events]), 200)


@bp.route('/api/logout', methods=['DELETE'])
def logout():
    session.pop('user_id', None)
    return make_response(jsonify({'message': 'Logged out successfully'}), 204)

@bp.route('/api/check_session')
def check_session():
    user_id = session.get('user_id')
    if user_id:
        user = User.query.get(user_id)
        if user:
            return make_response(jsonify(user.to_dict()), 200)
    return make_response(jsonify({}), 204)

@bp.route('/api/events/featured')
def featured_events():
    events = Event.query.order_by(func.random()).limit(20).all()
    return make_response(jsonify([e.to_dict() for e in events]), 200)

@bp.route('/api/events', methods=['POST'])
def post_event():
    user_id = session.get('user_id')
    if not user_id: return make_response(jsonify({'error': 'Unauthorized'}), 401)
    data = request.get_json()
    try:
        new_event = Event(title=data['title'], description=data['description'], year=data['year'], month=data['month'], day=data['day'], user_id=user_id, source_link=data.get('source_link'), image_url=data.get('image_url'))
        db.session.add(new_event)
        db.session.commit()
        return make_response(jsonify(new_event.to_dict()), 201)
    except Exception as e: return make_response(jsonify({'error': f'Could not create event: {e}'}), 400)

@bp.route('/api/events/<int:id>', methods=['GET', 'PATCH', 'DELETE'])
def handle_event_by_id(id):
    event = Event.query.get_or_404(id)
    if request.method == 'GET': return make_response(jsonify(event.to_dict()), 200)
    user_id = session.get('user_id')
    if not user_id or event.user_id != user_id: return make_response(jsonify({'error': 'Unauthorized'}), 401)
    if request.method == 'PATCH':
        data = request.get_json()
        for key, value in data.items(): setattr(event, key, value)
        db.session.commit()
        return make_response(jsonify(event.to_dict()), 200)
    elif request.method == 'DELETE':
        db.session.delete(event)
        db.session.commit()
        return make_response(jsonify({}), 204)

@bp.route('/api/trivia')
def get_trivia():
    event = Event.query.filter(Event.description.isnot(None)).order_by(func.random()).first()
    if not event: return make_response(jsonify({'error': 'No events available for trivia'}), 404)
    return make_response(jsonify({'description': event.description, 'correct_year': event.year}), 200)

@bp.route('/api/categories', methods=['GET', 'POST'])
def handle_categories():
    if request.method == 'GET':
        categories = Category.query.all()
        return make_response(jsonify([c.to_dict() for c in categories]), 200)
    elif request.method == 'POST':
        user_id = session.get('user_id')
        if not user_id: return make_response(jsonify({'error': 'Unauthorized'}), 401)
        data = request.get_json()
        try:
            new_category = Category(name=data['name'], description=data.get('description'), user_id=user_id)
            db.session.add(new_category)
            db.session.commit()
            return make_response(jsonify(new_category.to_dict()), 201)
        except Exception as e: return make_response(jsonify({'error': str(e)}), 400)
