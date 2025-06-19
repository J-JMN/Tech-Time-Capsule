import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'a_strong_default_secret_key_for_development')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///app.db').replace("postgres://", "postgresql://")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSONIFY_PRETTYPRINT_REGULAR = False