"""The controller for https://[PATH]/scenario/"""

from flask import Blueprint
from flask import request
from flask import jsonify
from flask import make_response
from util.util import InvalidUsage
from util.util import handle_invalid_usage
from util.util import handle_admin_permission
import jwt
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
    scenario_id : str
        The ID for getting, updating, or deleting a scenario.
        (required for PATCH and DELETE)
        (optinal in the URL query parameters for GET)
    image : str
        The URL to an image of the scenario.
        (required for POST)
        (optional for PATCH)
    title : str
        The title for creating or updating a scenario.
        (required for POST)
        (optional for PATCH)
    description : str
        The description for creating or updating a scenario.
        (required for POST)
        (optional for PATCH)

    Returns
    -------
    Scenario
        The retrieved scenario object.
        (for GET with id in the URL query parameters)
        (for POST and PATCH)
    list of Scenario
        A list of retrieved scenario objects.
        (for GET with no id in the URL query parameters)
    """
    rj = request.json

    # Sanity and permission check
    # (POST, PATCH, and DELETE methods are for administrators only)
    if request.method in ["POST", "PATCH", "DELETE"]:
        r = handle_admin_permission(rj, config.JWT_PRIVATE_KEY)
        if r is not None: # None means passing the admin permission check
            return r

    # Process the request
    if request.method == "GET":
        # Get all scenarios, or get scenarios by topic ID, or get a scenario by its ID
        scenario_id = request.args.get("scenario_id")
        topic_id = request.args.get("topic_id")
        if topic_id is None:
            if scenario_id is None:
                data = get_all_scenarios()
                data = scenarios_schema.dump(data)
            else:
                try:
                    data = get_scenario_by_id(scenario_id)
                    data = scenario_schema.dump(data)
                except Exception as ex:
                    e = InvalidUsage(ex.args[0], status_code=400)
                    return handle_invalid_usage(e)
        else:
            if scenario_id is None:
                try:
                    data = get_scenarios_by_topic(topic_id)
                    data = scenarios_schema.dump(data)
                except Exception as ex:
                    e = InvalidUsage(ex.args[0], status_code=400)
                    return handle_invalid_usage(e)
            else:
                e = InvalidUsage("Cannot have both topic_id and scenario_id.", status_code=400)
                return handle_invalid_usage(e)
        return jsonify({"data": data})
    elif request.method == "POST":
        # Create a scenario (admin only)
        if "title" in rj and "description" in rj and "topic_id" in rj and "image" in rj:
            try:
                data = create_scenario(rj["title"], rj["description"], rj["image"], rj["topic_id"])
                data = scenario_schema.dump(data)
            except Exception as ex:
                e = InvalidUsage(ex.args[0], status_code=400)
                return handle_invalid_usage(e)
        else:
            e = InvalidUsage("Missing field: title, description, topic_id, or image", status_code=400)
            return handle_invalid_usage(e)
        return jsonify({"data": data})
    elif request.method == "PATCH":
        # Update a scenario (admin only)
        if "scenario_id" in rj:
            t = rj["title"] if "title" in rj else None
            d = rj["description"] if "description" in rj else None
            i = rj["image"] if "image" in rj else None
            ti = rj["topic_id"] if "topic_id" in rj else None
            if t is None and d is None and i is None and ti is None:
                e = InvalidUsage("Need to have either title, description, image, or topic_id", status_code=400)
                return handle_invalid_usage(e)
            try:
                data = update_scenario(rj["scenario_id"], title=t, description=d, image=i, topic_id=ti)
                data = scenario_schema.dump(data)
            except Exception as ex:
                e = InvalidUsage(ex.args[0], status_code=400)
                return handle_invalid_usage(e)
        else:
            e = InvalidUsage("Missing field: scenario_id", status_code=400)
            return handle_invalid_usage(e)
        return jsonify({"data": data})
    elif request.method == "DELETE":
        # Delete a scenario (admin only)
        if "scenario_id" in rj:
            try:
                remove_scenario(rj["scenario_id"])
            except Exception as ex:
                e = InvalidUsage(ex.args[0], status_code=400)
                return handle_invalid_usage(e)
        else:
            e = InvalidUsage("Missing field: scenario_id", status_code=400)
            return handle_invalid_usage(e)
        return make_response("", 204)
    else:
        # Wrong methods
        e = InvalidUsage("Method not allowed", status_code=405)
        return handle_invalid_usage(e)
