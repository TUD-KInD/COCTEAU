from flask_migrate import Migrate
from app.app import app
from models.model import db
from controllers import root
from controllers import template_controller
from controllers import photos_controller
from controllers import login_controller
from controllers import topic_controller
from controllers import scenario_controller


# Register all routes to the blueprint
app.register_blueprint(root.bp)
app.register_blueprint(template_controller.bp, url_prefix="/template")
app.register_blueprint(photos_controller.bp, url_prefix="/photos")
app.register_blueprint(login_controller.bp, url_prefix="/login")
app.register_blueprint(topic_controller.bp, url_prefix="/topic")
app.register_blueprint(scenario_controller.bp, url_prefix="/scenario")

# Set database migration
migrate = Migrate(app, db)
