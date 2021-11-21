"""The controller for https://[PATH]/scenario/"""

from flask import Blueprint
from flask import request
from flask import jsonify
from flask import make_response
from util.util import InvalidUsage
from util.util import handle_invalid_usage
from util.util import decode_user_token
from util.util import try_wrap_response
from config.config import config
from models.model_operations.scenario_operations import create_scenario
from models.model_operations.scenario_operations import get_scenario_by_id
from models.model_operations.scenario_operations import get_scenarios_by_topic
from models.model_operations.scenario_operations import get_all_scenarios
from models.model_operations.scenario_operations import update_scenario
from models.model_operations.scenario_operations import remove_scenario
from models.schema import scenarios_schema
from models.schema import scenario_schema


bp = Blueprint("scenario_controller", __name__)


@bp.route("/", methods=["GET", "POST", "PATCH", "DELETE"])
def scenario():
    """
    The function for operating the scenario table.

    Parameters
    ----------
    user_token : str
        The encoded user JWT, issued by the back-end.
        (required for POST, PATCH, and DELETE)
    scenario_id : int
        The ID of a scenario.
        (required for PATCH and DELETE)
        (optional in the URL query parameters for GET)
    image : str
        The URL to an image of the scenario.
        (required for POST)
        (optional for PATCH)
    title : str
        The title of a scenario.
        (required for POST)
        (optional for PATCH)
    description : str
        The description of a scenario.
        (required for POST)
        (optional for PATCH)
    topic_id : int
        The topic ID of a scenario.
        (optional in the URL query parameters for GET)
        (required for POST)
        (optional for PATCH)
    mode : int
        The system configuration.
        (0 means the normal deployment mode)
        (other numbers mean different experiment modes)
        (optional for POST and PATCH)

    Returns
    -------
    Scenario or list of Scenario
        The retrieved scenario object.
        (for GET with scenario_id in the URL query parameters)
        (for POST and PATCH)
        Or a list of retrieved scenario objects.
        (for GET with topic_id in the URL query parameters)
        (for GET with no URL query parameters)
    """
    rj = request.json

    # Sanity and permission check
    # (POST, PATCH, and DELETE methods are for administrators only)
    if request.method in ["POST", "PATCH", "DELETE"]:
        error, _ = decode_user_token(rj, config.JWT_PRIVATE_KEY, check_if_admin=True)
        if error is not None: return error

    # Process the request
    if request.method == "GET":
        # Get all scenarios, or get scenarios by topic ID, or get a scenario by its ID
        scenario_id = request.args.get("scenario_id")
        topic_id = request.args.get("topic_id")
        if topic_id is None:
            if scenario_id is None:
                return try_get_all_scenarios()
            else:
                return try_get_scenario_by_id(scenario_id)
        else:
            if scenario_id is None:
                return try_get_scenarios_by_topic(topic_id)
            else:
                e = InvalidUsage("Cannot have both 'topic_id' and 'scenario_id'.", status_code=400)
                return handle_invalid_usage(e)
    elif request.method == "POST":
        # Create a scenario (admin only)
        title = rj.get("title")
        description = rj.get("description")
        topic_id = rj.get("topic_id")
        image = rj.get("image")
        mode = rj.get("mode")
        if title is None or description is None or topic_id is None or image is None:
            e = InvalidUsage("Must have 'title', 'description', 'topic_id', and 'image'.", status_code=400)
            return handle_invalid_usage(e)
        else:
            return try_create_scenario(title, description, image, topic_id, mode=mode)
    elif request.method == "PATCH":
        # Update a scenario (admin only)
        scenario_id = rj.get("scenario_id")
        if scenario_id is None:
            e = InvalidUsage("Must have 'scenario_id'.", status_code=400)
            return handle_invalid_usage(e)
        else:
            t = rj.get("title")
            d = rj.get("description")
            ti = rj.get("topic_id")
            i = rj.get("image")
            m = rj.get("mode")
            if t is None and d is None and i is None and ti is None and m is None:
                e = InvalidUsage("Must have at least one field to update.", status_code=400)
                return handle_invalid_usage(e)
            else:
                return try_update_scenario(scenario_id, title=t, description=d, image=i, topic_id=ti, mode=m)
    elif request.method == "DELETE":
        # Delete a scenario (admin only)
        scenario_id = rj.get("scenario_id")
        if scenario_id is None:
            e = InvalidUsage("Must have 'scenario_id'.", status_code=400)
            return handle_invalid_usage(e)
        else:
            return try_remove_scenario(scenario_id)
    else:
        # Wrong methods
        e = InvalidUsage("Method not allowed.", status_code=405)
        return handle_invalid_usage(e)


@try_wrap_response
def try_get_all_scenarios():
    data = get_all_scenarios()
    return jsonify({"data": scenarios_schema.dump(data)})


@try_wrap_response
def try_get_scenario_by_id(scenario_id):
    data = get_scenario_by_id(scenario_id)
    return jsonify({"data": scenario_schema.dump(data)})


@try_wrap_response
def try_get_scenarios_by_topic(topic_id):
    data = get_scenarios_by_topic(topic_id)
    return jsonify({"data": scenarios_schema.dump(data)})


@try_wrap_response
def try_create_scenario(title, description, image, topic_id, mode=None):
    data = create_scenario(title, description, image, topic_id, mode=mode)
    return jsonify({"data": scenario_schema.dump(data)})


@try_wrap_response
def try_update_scenario(scenario_id, title=None, description=None, image=None, topic_id=None, mode=None):
    data = update_scenario(scenario_id,
            title=title, description=description, image=image, topic_id=topic_id, mode=mode)
    return jsonify({"data": scenario_schema.dump(data)})


@try_wrap_response
def try_remove_scenario(scenario_id):
    remove_scenario(scenario_id)
    return make_response("", 204)
