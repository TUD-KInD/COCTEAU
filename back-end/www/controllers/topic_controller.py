"""The controller for https://[PATH]/topic/"""

from flask import Blueprint
from flask import request
from flask import jsonify
from flask import make_response
from util.util import InvalidUsage
from util.util import handle_invalid_usage
from util.util import decode_user_token
from util.util import try_wrap_response
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
    topic_id : int
        The ID of a topic.
        (required for PATCH and DELETE)
        (optinal in the URL query parameters for GET)
    title : str
        The title of a topic.
        (required for POST)
        (optional for PATCH)
    description : str
        The description of a topic.
        (required for POST)
        (optional for PATCH)

    Returns
    -------
    Topic or list of Topic
        The retrieved topic object.
        (for GET with topic_id in the URL query parameters)
        (for POST and PATCH)
        Or a list of retrieved topic objects.
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
        # Get all topics or get the topic by ID
        topic_id = request.args.get("topic_id")
        if topic_id is None:
            return try_get_all_topics()
        else:
            return try_get_topic_by_id(topic_id)
    elif request.method == "POST":
        # Create a topic (admin only)
        title = rj.get("title")
        description = rj.get("description")
        if title is None or description is None:
            e = InvalidUsage("Must have 'title' and 'description'.", status_code=400)
            return handle_invalid_usage(e)
        else:
            return try_create_topic(title, description)
    elif request.method == "PATCH":
        # Update a topic (admin only)
        topic_id = rj.get("topic_id")
        if topic_id is None:
            e = InvalidUsage("Must have 'topic_id'.", status_code=400)
            return handle_invalid_usage(e)
        else:
            t = rj.get("title")
            d = rj.get("description")
            if t is None and d is None:
                e = InvalidUsage("Must have at least one field to update.", status_code=400)
                return handle_invalid_usage(e)
            else:
                return try_update_topic(topic_id, title=t, description=d)
    elif request.method == "DELETE":
        # Delete a topic (admin only)
        topic_id = rj.get("topic_id")
        if topic_id is None:
            e = InvalidUsage("Must have 'topic_id'.", status_code=400)
            return handle_invalid_usage(e)
        else:
            return try_remove_topic(topic_id)
    else:
        # Wrong methods
        e = InvalidUsage("Method not allowed.", status_code=405)
        return handle_invalid_usage(e)


@try_wrap_response
def try_get_all_topics():
    data = get_all_topics()
    return jsonify({"data": topics_schema.dump(data)})


@try_wrap_response
def try_get_topic_by_id(topic_id):
    data = get_topic_by_id(topic_id)
    return jsonify({"data": topic_schema.dump(data)})


@try_wrap_response
def try_create_topic(title, description):
    data = create_topic(title, description)
    return jsonify({"data": topic_schema.dump(data)})


@try_wrap_response
def try_update_topic(topic_id, title=None, description=None):
    data = update_topic(topic_id, title=title, description=description)
    return jsonify({"data": topic_schema.dump(data)})

@try_wrap_response
def try_remove_topic(topic_id):
    remove_topic(topic_id)
    return make_response("", 204)
