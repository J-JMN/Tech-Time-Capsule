import os

class Config:
    # --- Standard Configuration ---
    SECRET_KEY = os.environ.get('SECRET_KEY', 'a_strong_default_secret_key_for_development')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///app.db').replace("postgres://", "postgresql://")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSONIFY_PRETTYPRINT_REGULAR = False

    # --- PRODUCTION COOKIE CONFIGURATION ---
    # These settings are essential for session cookies to work across domains on Render.
    # We only apply these settings if the app is NOT running in debug mode (in production)
    if os.environ.get("FLASK_DEBUG") != '1':
        SESSION_COOKIE_SECURE = True
        SESSION_COOKIE_HTTPONLY = True
        SESSION_COOKIE_SAMESITE = 'None'