import os
from flask import Flask
from flask_bcrypt import Bcrypt #type: ignore
from flask_cors import CORS     #type: ignore
from flask_migrate import Migrate   #type: ignore
from flask_sqlalchemy import SQLAlchemy   #type: ignore
from sqlalchemy import MetaData
from config import Config

metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})

db = SQLAlchemy(metadata=metadata)
migrate = Migrate()
bcrypt = Bcrypt()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(
        app,
        supports_credentials=True,
        origins=["http://localhost:3000", "https://tech-time-capsule-client.onrender.com"]
    )

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    
    from .routes import bp as main_bp
    app.register_blueprint(main_bp)

    return app