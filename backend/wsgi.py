import time
import click
import requests
from datetime import datetime
from app import create_app, db
from app.models import User, Event, Category, EventCategory

app = create_app()

# --- CLI COMMANDS ---
@app.cli.command("seed_db")
def seed_db():
    print("Deleting all records...")
    EventCategory.query.delete()
    Event.query.delete()
    Category.query.delete()
    User.query.delete()
    db.session.commit()

    print("Seeding database...")
    archivist = User(username='Archivist')
    archivist.password_hash = 'a_very_strong_password'
    db.session.add(archivist)
    db.session.commit()

    event1 = Event(title="First iPhone Announced", description="Steve Jobs introduced the first iPhone.", year=2007, month=1, day=9, user_id=archivist.id)
    cat1 = Category(name="Product Launch", description="Debut of new technology products.", user_id=archivist.id)
    db.session.add_all([event1, cat1])
    db.session.commit()

    assoc1 = EventCategory(event_id=event1.id, category_id=cat1.id, relationship_description="Revolutionized the mobile industry")
    db.session.add(assoc1)
    db.session.commit()
    print("Database seeded!")


@app.cli.command("populate_db_year")
@click.argument("year", type=int)
@click.option("--fast", is_flag=True, help="Run without the 1-second delay between requests.")
def populate_db_year(year, fast):
    """
    Fetches Wikipedia 'On This Day' events for an entire year.
    Example: flask populate_db_year 2007
    For presentation prep: flask populate_db_year 1995 --fast
    """
    delay = 0.1 if fast else 1.0 
    if fast:
        print("--- RUNNING IN FAST MODE: BE AWARE OF POTENTIAL RATE-LIMITING ---")
    
    print(f"Starting to populate database for the year {year}...")
    archivist = User.query.filter_by(username='Archivist').first()
    if not archivist:
        print("Archivist user not found. Please run 'flask seed_db' first.")
        return

    tech_keywords = ['computer', 'internet', 'software', 'apple', 'microsoft', 'google', 'nasa', 'space', 'robot', 'web', 'semiconductor', 'chip']

    for month in range(1, 13):
        for day in range(1, 32):
            try:
                datetime(year=year, month=month, day=day)
                print(f"Fetching events for {month}/{day}/{year}...")
                API_ENDPOINT = f"https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/{month}/{day}"
                headers = {'User-Agent': 'TechTimeCapsule/1.0 (dev project; contact@example.com)'}
                response = requests.get(API_ENDPOINT, headers=headers)
                response.raise_for_status()
                data = response.json()
                
                for event_data in data.get('events', []):
                    if event_data['year'] == year:
                        text = event_data['text'].lower()
                        if any(keyword in text for keyword in tech_keywords):
                            title = event_data['pages'][0]['title']
                            existing_event = Event.query.filter_by(year=event_data['year'], title=title).first()
                            if not existing_event:
                                new_event = Event(title=title, description=event_data['text'], year=event_data['year'], month=month, day=day, source_link=event_data['pages'][0]['content_urls']['desktop']['page'], user_id=archivist.id)
                                db.session.add(new_event)
                
                db.session.commit()
                time.sleep(delay)

            except ValueError:
                continue
            except Exception as e:
                print(f"An error occurred for {month}/{day}: {e}")
                db.session.rollback()

    print(f"Finished populating database for the year {year}!")


if __name__ == '__main__':
    app.run(port=5555, debug=True)