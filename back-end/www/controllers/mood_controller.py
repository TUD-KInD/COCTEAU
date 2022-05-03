"""The controller for https://[PATH]/mood/"""

from flask import Blueprint
from flask import request
from flask import jsonify
from flask import make_response
from util.util import InvalidUsage
from util.util import handle_invalid_usage
from util.util import decode_user_token
from util.util import try_wrap_response
from config.config import config
from models.model_operations.vision_operations import get_mood_by_id
from models.model_operations.vision_operations import get_all_moods
from models.model_operations.vision_operations import create_mood
from models.model_operations.vision_operations import update_mood
from models.model_operations.vision_operations import remove_mood
from models.schema import moods_schema
from models.schema import mood_schema


bp = Blueprint("mood_controller", __name__)


@bp.route("/", methods=["GET", "POST", "PATCH", "DELETE"])
def mood():
    """
    The function for operating the mood table.

    Parameters
    ----------
    user_token : str
        The encoded user JWT, issued by the back-end.
        (required for POST, PATCH, and DELETE)
    mood_id : int
        ID of the mood.
        (optional in the URL query parameters for GET)
        (required for PATCH and DELETE)
    name : str
        Name of the mood.
        (required for POST)
        (optional for PATCH)
    image : str
        Image URL of the mood.
        (optional for POST and PATCH)
    order : int
        Order of the mood relative to others.
        (optional for POST and PATCH)

    Returns
    -------
    Mood or list of Mood
        The retrieved mood object.
        (for GET with mood_id in the URL query parameters)
        (for POST and PATCH)
        Or a list of retrieved mood objects.
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
        # Get all moods or get the mood by ID
        mood_id = request.args.get("mood_id")
        if mood_id is None:
            return try_get_all_moods()
        else:
            return try_get_mood_by_id(mood_id)
    elif request.method == "POST":
        # Create a mood (admin only)
        name = rj.get("name")
        image = rj.get("image")
        order = rj.get("order")
        if name is None:
            e = InvalidUsage("Must have 'name'.", status_code=400)
            return handle_invalid_usage(e)
        else:
            return try_create_mood(name, image=image, order=order)
    elif request.method == "PATCH":
        # Update a mood (admin only)
        mood_id = rj.get("mood_id")
        if mood_id is None:
            e = InvalidUsage("Must have 'mood_id'.", status_code=400)
            return handle_invalid_usage(e)
        else:
            name = rj.get("name")
            image = rj.get("image")
            order = rj.get("order")
            if name is None and image is None and order is None:
                e = InvalidUsage("Must have at least one field to update.", status_code=400)
                return handle_invalid_usage(e)
            else:
                return try_update_mood(mood_id, name=name, image=image, order=order)
    elif request.method == "DELETE":
        # Delete a topic (admin only)
        mood_id = rj.get("mood_id")
        if mood_id is None:
            e = InvalidUsage("Must have 'mood_id'.", status_code=400)
            return handle_invalid_usage(e)
        else:
            return try_remove_mood(mood_id)
    else:
        # Wrong methods
        e = InvalidUsage("Method not allowed.", status_code=405)
        return handle_invalid_usage(e)


@try_wrap_response
def try_get_mood_by_id(mood_id):
    data = get_mood_by_id(mood_id)
    return jsonify({"data": mood_schema.dump(data)})


@try_wrap_response
def try_get_all_moods():
    data = get_all_moods()
    return jsonify({"data": moods_schema.dump(data)})


@try_wrap_response
def try_create_mood(name, image=None, order=None):
    data = create_mood(name, image=image, order=order)
    return jsonify({"data": mood_schema.dump(data)})


@try_wrap_response
def try_update_mood(mood_id, name=None, image=None, order=None):
    data = update_mood(mood_id, name=name, image=image, order=order)
    return jsonify({"data": mood_schema.dump(data)})


@try_wrap_response
def try_remove_mood(mood_id):
    remove_mood(mood_id)
    return make_response("", 204)
