"""The controller for https://[PATH]/topic/"""

from flask import Blueprint
from flask import request
from flask import jsonify
from flask import make_response
from util.util import InvalidUsage
from util.util import handle_invalid_usage
from util.util import handle_admin_permission
import jwt
from config.config import config
from models.model_operations.topic_operations import create_topic
from models.model_operations.topic_operations import get_topic_by_id
from models.model_operations.topic_operations import get_all_topics
from models.model_operations.topic_operations import update_topic
from models.model_operations.topic_operations import remove_topic
from models.schema import topics_schema
from models.schema import topic_schema


bp = Blueprint("topic_controller", __name__)


@bp.route("/", methods=["GET", "POST", "PATCH", "DELETE"])
def topic():
    """
    The function for operating the topic table.

    Parameters
    ----------
    user_token : str
        The encoded user JWT, issued by the back-end.
        (required for POST, PATCH, and DELETE)
    topic_id : str
        The ID for getting, updating, or deleting a topic.
        (required for PATCH and DELETE)
        (optinal in the URL query parameters for GET)
    title : str
        The title for creating or updating a topic.
        (required for POST)
        (optional for PATCH)
    description : str
        The description for creating or updating a topic.
        (required for POST)
        (optional for PATCH)

    Returns
    -------
    Topic
        The retrieved topic object.
        (for GET with topic_id in the URL query parameters)
        (for POST and PATCH)
    list of Topic
        A list of retrieved topic objects.
        (for GET with no topic_id in the URL query parameters)
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
        # Get all topics or get the topic by ID
        topic_id = request.args.get("topic_id")
        if topic_id is None:
            data = get_all_topics()
            data = topics_schema.dump(data)
        else:
            try:
                data = get_topic_by_id(topic_id)
                data = topic_schema.dump(data)
            except Exception as ex:
                e = InvalidUsage(ex.args[0], status_code=400)
                return handle_invalid_usage(e)
        return jsonify({"data": data})
    elif request.method == "POST":
        # Create a topic (admin only)
        if "title" in rj and "description" in rj:
            data = create_topic(rj["title"], rj["description"])
            data = topic_schema.dump(data)
        else:
            e = InvalidUsage("Missing field: title or description", status_code=400)
            return handle_invalid_usage(e)
        return jsonify({"data": data})
    elif request.method == "PATCH":
        # Update a topic (admin only)
        if "topic_id" in rj:
            t = rj["title"] if "title" in rj else None
            d = rj["description"] if "description" in rj else None
            if t is None and d is None:
                e = InvalidUsage("Need to have either title or description", status_code=400)
                return handle_invalid_usage(e)
            try:
                data = update_topic(rj["topic_id"], title=t, description=d)
                data = topic_schema.dump(data)
            except Exception as ex:
                e = InvalidUsage(ex.args[0], status_code=400)
                return handle_invalid_usage(e)
        else:
            e = InvalidUsage("Missing field: topic_id", status_code=400)
            return handle_invalid_usage(e)
        return jsonify({"data": data})
    elif request.method == "DELETE":
        # Delete a topic (admin only)
        if "topic_id" in rj:
            try:
                remove_topic(rj["topic_id"])
            except Exception as ex:
                e = InvalidUsage(ex.args[0], status_code=400)
                return handle_invalid_usage(e)
        else:
            e = InvalidUsage("Missing field: topic_id", status_code=400)
            return handle_invalid_usage(e)
        return make_response("", 204)
    else:
        # Wrong methods
        e = InvalidUsage("Method not allowed", status_code=405)
        return handle_invalid_usage(e)
