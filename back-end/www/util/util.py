"""Utility functions"""

from flask import jsonify
import jwt


class InvalidUsage(Exception):
    """Handle errors, such as a bad request."""
    def __init__(self, message, status_code=400, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv["message"] = self.message
        return rv


def handle_invalid_usage(error):
    """Handle the error message of the InvalidUsage class"""
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


def encode_jwt(payload, private_key):
    """
    Encode JWT.

    Encrypt the message into a JSON Web Token (JWT) by using HMAC and SHA-256.
    (https://pyjwt.readthedocs.io/en/latest/)

    Parameters
    ----------
    payload : dict
        The payload (data) part of the JSON Web Token.
    private_key : str
        The private key to encode the JWT.

    Returns
    -------
    str
        Encoded JSON Web Token.
    """
    return jwt.encode(payload, private_key, algorithm="HS256")


def decode_jwt(token, private_key):
    """
    Decode JWT.

    Parameters
    ----------
    token : str
        JSON Web Token.
    private_key : str
        The private key to decode the JWT.

    Returns
    -------
    dict
        Decoded JSON Web Token.
    """
    return jwt.decode(token, private_key, algorithms=["HS256"])



def handle_admin_permission(request_json, private_key):
    # TODO: docstring of this function
    # Check if there is content and user_token
    if request_json is None:
        e = InvalidUsage("Missing POST request content", status_code=400)
        return handle_invalid_usage(e)
    if "user_token" not in request_json:
        e = InvalidUsage("Missing field: user_token", status_code=400)
        return handle_invalid_usage(e)
    # Decode user token
    try:
        user_json = decode_jwt(request_json["user_token"], private_key)
    except jwt.InvalidSignatureError as ex:
        e = InvalidUsage(ex.args[0], status_code=401)
        return handle_invalid_usage(e)
    except Exception as ex:
        e = InvalidUsage(ex.args[0], status_code=401)
        return handle_invalid_usage(e)
    # Check if the user has the admin permission
    is_admin = True if user_json["client_type"] == 0 else False
    if not is_admin:
        e = InvalidUsage("Permission denied", status_code=403)
        return handle_invalid_usage(e)
    # Return None when passing the admin permission check
    return None
