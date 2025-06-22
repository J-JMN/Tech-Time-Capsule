import time
import click
import requests
from datetime import datetime, date, timedelta
from app import create_app, db
from app.models import User, Event, Category, EventCategory

app = create_app()

# --- HELPER FUNCTION FOR DATA FETCHING ---
def _fetch_and_save_day(month, day, archivist, keywords):
    """Helper function to fetch and save events for a single day."""
    try:
        print(f"Fetching events for {month}/{day}...")
        API_ENDPOINT = f"https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/{month}/{day}"
        headers = {'User-Agent': 'TechTimeCapsule/1.0 (dev project; contact@example.com)'}
        
        response = requests.get(API_ENDPOINT, headers=headers)
        response.raise_for_status()
        data = response.json()

        for event_data in data.get('events', []):
            text = event_data['text'].lower()
            if any(keyword in text for keyword in keywords):
                title = event_data['pages'][0]['title']
                event_year = event_data['year']
                existing_event = Event.query.filter_by(year=event_year, month=month, day=day, title=title).first()
                if not existing_event:
                    new_event = Event(
                        title=title, description=event_data['text'],
                        year=event_year, month=month, day=day,
                        source_link=event_data['pages'][0]['content_urls']['desktop']['page'],
                        user_id=archivist.id
                    )
                    db.session.add(new_event)
        db.session.commit()
    except Exception as e:
        print(f"An error occurred for {month}/{day}: {e}")
        db.session.rollback()

# --- CLI COMMANDS ---

@app.cli.command("seed_db")
def seed_db():
    # ... (seed_db command remains the same)
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
    event1 = Event(title="First iPhone Announced", description="Steve Jobs introduced the first iPhone.", year=2007, month=1, day=9, user_id=archivist.id, image_url="https://upload.wikimedia.org/wikipedia/commons/f/f3/IPhone_2G_PSD_Mock.png", source_link="https://en.wikipedia.org/wiki/IPhone_(1st_generation)")
    event2 = Event(title="Windows 95 Released", description="Microsoft's game-changing OS.", year=1995, month=8, day=24, user_id=archivist.id, image_url="https://upload.wikimedia.org/wikipedia/en/5/58/Windows_95_logo.svg", source_link="https://en.wikipedia.org/wiki/Windows_95")
    cat1 = Category(name="Product Launch", description="Debut of new technology products.", user_id=archivist.id)
    db.session.add_all([event1, event2, cat1])
    db.session.commit()
    assoc1 = EventCategory(event_id=event1.id, category_id=cat1.id, relationship_description="Revolutionized the mobile industry")
    assoc2 = EventCategory(event_id=event2.id, category_id=cat1.id, relationship_description="Dominated the OS market")
    db.session.add_all([assoc1, assoc2])
    db.session.commit()
    print("Database seeded!")


@app.cli.command("populate_db_year")
@click.argument("year", type=int)
@click.option("--fast", is_flag=True, help="Run without the 1-second delay between requests.")
def populate_db_year(year, fast):
    """Fetches Wikipedia 'On This Day' events for a single, full year."""
    # (This command now uses the helper function but its purpose is the same)
    delay = 0.1 if fast else 1.0
    if fast: print("--- RUNNING IN FAST MODE ---")
    print(f"Starting to populate database for the year {year}...")
    archivist = User.query.filter_by(username='Archivist').first()
    if not archivist: return print("Archivist user not found. Run 'flask seed_db' first.")
    
    tech_keywords = ['computer', 'internet', 'software', 'apple', 'microsoft', 'google', 'nasa', 'space', 'robot', 'web', 'semiconductor', 'chip']
    for month in range(1, 13):
        for day in range(1, 32):
            try:
                datetime(year=year, month=month, day=day)
                _fetch_and_save_day(month, day, archivist, tech_keywords)
                time.sleep(delay)
            except ValueError:
                continue
    print(f"Finished populating database for the year {year}!")


@app.cli.command("populate_db_to_today")
@click.option("--fast", is_flag=True, help="Run without the 1-second delay.")
def populate_db_to_today(fast):
    """
    Fetches Wikipedia events from Jan 1 of the current year up to today's date.
    """
    delay = 0.1 if fast else 1.0
    if fast: print("--- RUNNING IN FAST MODE ---")
    
    today = date.today()
    current_year = today.year
    print(f"Starting to populate database from Jan 1, {current_year} to {today}...")

    archivist = User.query.filter_by(username='Archivist').first()
    if not archivist: return print("Archivist user not found. Run 'flask seed_db' first.")

    tech_keywords = ['computer', 'internet', 'software', 'apple', 'microsoft', 'google', 'nasa', 'space', 'robot', 'web', 'semiconductor', 'chip']
    
    start_date = date(current_year, 1, 1)
    delta = today - start_date

    for i in range(delta.days + 1):
        current_day = start_date + timedelta(days=i)
        _fetch_and_save_day(current_day.month, current_day.day, archivist, tech_keywords)
        time.sleep(delay)

    print(f"Finished populating database for {current_year}!")


if __name__ == '__main__':
    app.run(port=5555, debug=True)