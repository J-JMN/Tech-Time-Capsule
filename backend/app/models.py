from sqlalchemy_serializer import SerializerMixin  #type: ignore
from sqlalchemy.ext.hybrid import hybrid_property
from . import db, bcrypt

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    _password_hash = db.Column(db.String(128), nullable=False)
    events = db.relationship('Event', back_populates='user', cascade='all, delete-orphan')
    categories = db.relationship('Category', back_populates='user', cascade='all, delete-orphan')
    serialize_rules = ('-events.user', '-categories.user', '-_password_hash',)

    @hybrid_property
    def password_hash(self):
        raise AttributeError('Password hashes may not be viewed.')

    @password_hash.setter
    def password_hash(self, password):
        self._password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password)

class Event(db.Model, SerializerMixin):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    month = db.Column(db.Integer, nullable=False)
    day = db.Column(db.Integer, nullable=False)
    image_url = db.Column(db.String(500))
    source_link = db.Column(db.String(500))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    user = db.relationship('User', back_populates='events')
    event_categories = db.relationship('EventCategory', back_populates='event', cascade='all, delete-orphan')
    serialize_rules = ('-user.events', '-user.categories', '-event_categories.event', 'event_categories.category', 'user.username')

class Category(db.Model, SerializerMixin):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', back_populates='categories')
    event_categories = db.relationship('EventCategory', back_populates='category', cascade='all, delete-orphan')
    serialize_rules = ('-user.categories', '-user.events', '-event_categories.category', 'user.username')

class EventCategory(db.Model, SerializerMixin):
    __tablename__ = 'event_categories'
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    relationship_description = db.Column(db.String(255), nullable=False)
    event = db.relationship('Event', back_populates='event_categories')
    category = db.relationship('Category', back_populates='event_categories')
    serialize_rules = ('-event.event_categories', '-category.event_categories', 'category.name')