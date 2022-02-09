"""The controller for https://[PATH]/login/"""

from flask import Blueprint
from flask import request
from flask import jsonify
from util.util import InvalidUsage
from util.util import handle_invalid_usage
from util.util import encode_jwt
from util.util import decode_jwt
from google.oauth2 import id_token
from google.auth.transport import requests
from config.config import config
from models.model_operations.user_operations import get_user_by_client_id
from models.model_operations.user_operations import create_user
import jwt
import time
import uuid
import traceback


bp = Blueprint("login_controller", __name__)


@bp.route("/", methods=["POST"])
def login():
    """
    The function for the front-end client to log in.

    Use the following command to test:
    $ curl -d '{"custom_id":"id"}' -H "Content-Type: application/json" -X POST http://0.0.0.0:5000/login/

    Parameters
    ----------
    google_id_token : str
        The token obtained from the Google Sign-In API.
    client_id : str
        The client ID string returned by the Google Analytics tracker or created by the front-end client.

    Returns
    -------
    user_token : str
        The encoded JWT that stores user information.
    """
    client_id = None
    request_json = request.get_json()
    if request_json is not None:
        if "google_id_token" in request_json:
            # google_id_token is obtained from the Google Sign-In API
            google_id_token = request_json["google_id_token"]
            # Verify the google_id_token using Google Sign-In API
            try:
                id_info = id_token.verify_oauth2_token(google_id_token,
                        requests.Request(), config.GOOGLE_SIGNIN_CLIENT_ID)
                # Token is valid
                client_id = "google.%s" % id_info["sub"]
            except ValueError:
                traceback.print_exc()
                e = InvalidUsage("Invalid Google ID token.", status_code=401)
                return handle_invalid_usage(e)
            except:
                traceback.print_exc()
                e = InvalidUsage(traceback.format_exc(), status_code=401)
                return handle_invalid_usage(e)
        else:
            if "client_id" in request_json:
                # obtained from the Google Analytics tracker or created by the front-end client
                client_id = request_json["client_id"]

    # Get user id by client id, and issued an user jwt
    if client_id is None:
        e = InvalidUsage("Must have either 'google_id_token' or 'client_id'.", status_code=400)
        return handle_invalid_usage(e)
    else:
        user_token = get_user_token_by_client_id(client_id)
        if user_token is None:
            e = InvalidUsage("Permission denied.", status_code=403)
            return handle_invalid_usage(e)
        else:
            return_json = {"user_token": user_token}
            return jsonify(return_json)


def get_user_token_by_client_id(client_id):
    """
    Get the encoded user token by using client id.

    Parameters
    ----------
    client_id : str
        The ID returned by Google Sign-In API (e.g., "google.xxxxx"),
        or returned by Google Analytics tracker (e.g., "ga.xxxxx"),
        or customized ID created by the front-end client.

    Returns
    -------
    user_token : str
        The JWT (JSON Web Token) of the corresponding user.
    """
    user = get_user_by_client_id(client_id)
    if user is None:
        user = create_user(client_id) # create a new user if not found
    user_id = user.id
    client_type = user.client_type
    if client_type == -1:
        return None # a banned user does not get the token
    else:
        user_token = encode_user_jwt(user_id=user_id, client_type=client_type)
        return user_token


def encode_user_jwt(**kwargs):
    """Encode user JWT (JSON Web Token)."""
    t = kwargs["iat"] if "iat" in kwargs else round(time.time())
    payload = {}
    payload["iat"] = t
    payload["jti"] = uuid.uuid4().hex
    payload["iss"] = "api.periscope.io.tudelft.nl"
    payload["exp"] = t + 2592000 # the token will expire after 30 days
    for k in kwargs:
        payload[k] = kwargs[k]
    return encode_jwt(payload, config.JWT_PRIVATE_KEY)
