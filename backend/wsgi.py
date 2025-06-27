import time
import click
import requests # type: ignore
from datetime import datetime, date, timedelta
from app import create_app, db
from app.models import User, Event, Category, EventCategory

app = create_app()

def _fetch_and_save_day(month, day, archivist, keywords):
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
                    new_event = Event(title=title, description=event_data['text'],year=event_year, month=month, day=day,source_link=event_data['pages'][0]['content_urls']['desktop']['page'],user_id=archivist.id)
                    db.session.add(new_event)
        db.session.commit()
    except Exception as e:
        print(f"An error occurred for {month}/{day}: {e}")
        db.session.rollback()

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
    cat_pl = Category(name="Product Launch", description="Debut of new technology products.", user_id=archivist.id)
    cat_os = Category(name="Operating Systems", description="Software that manages computer hardware and software resources.", user_id=archivist.id)
    cat_web = Category(name="World Wide Web", description="Events related to the development of the internet and web technologies.", user_id=archivist.id)
    cat_company = Category(name="Company Milestones", description="Significant moments for major tech companies.", user_id=archivist.id)
    db.session.add_all([cat_pl, cat_os, cat_web, cat_company])
    db.session.commit()
    event1 = Event(title="First iPhone Announced", description="Steve Jobs unveiled the first iPhone, a device that combined a widescreen iPod with touch controls, a mobile phone, and an internet communicator.", year=2007, month=1, day=9, user_id=archivist.id, image_url="https://i.imgur.com/39g4g4G.png", source_link="https://en.wikipedia.org/wiki/IPhone_(1st_generation)")
    event2 = Event(title="Windows 95 Released", description="Microsoft's game-changing operating system introduced the Start Menu and taskbar, defining the PC user experience for years to come.", year=1995, month=8, day=24, user_id=archivist.id, image_url="https://i.imgur.com/g237s54.png", source_link="https://en.wikipedia.org/wiki/Windows_95")
    event3 = Event(title="First '.com' Domain Registered", description="The company Symbolics, Inc. registers Symbolics.com, the first-ever commercial internet domain, marking the start of the web as we know it.", year=1985, month=3, day=15, user_id=archivist.id, image_url="https://i.imgur.com/kH8cQ2n.jpeg", source_link="https://en.wikipedia.org/wiki/Symbolics")
    event4 = Event(title="Google Founded", description="Larry Page and Sergey Brin incorporated Google in a garage in Menlo Park, California, with a mission to organize the world's information.", year=1998, month=9, day=4, user_id=archivist.id, image_url="https://i.imgur.com/N2yO9hI.png", source_link="https://en.wikipedia.org/wiki/History_of_Google")
    db.session.add_all([event1, event2, event3, event4])
    db.session.commit()
    assoc1 = EventCategory(event_id=event1.id, category_id=cat_pl.id, relationship_description="Revolutionized the mobile industry")
    assoc2 = EventCategory(event_id=event2.id, category_id=cat_os.id, relationship_description="Dominated the desktop market in the 90s")
    assoc3 = EventCategory(event_id=event3.id, category_id=cat_web.id, relationship_description="Marked the beginning of the commercial internet era")
    assoc4 = EventCategory(event_id=event4.id, category_id=cat_company.id, relationship_description="Became the dominant force in web search")
    db.session.add_all([assoc1, assoc2, assoc3, assoc4])
    db.session.commit()
    print("Database seeded with high-quality sample data!")

@app.cli.command("populate_db_year")
@click.argument("year", type=int)
@click.option("--fast", is_flag=True, help="Run without the 1-second delay between requests.")
def populate_db_year(year, fast):
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