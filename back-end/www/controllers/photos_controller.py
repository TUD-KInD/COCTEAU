"""
The controller for https://[PATH]/photos/
"""

from flask import Blueprint
from flask import jsonify
from flask import request
import json
from urllib.request import urlopen
from config.config import config


bp = Blueprint("photos_controller", __name__)


@bp.route("/random")
def get_random_photos():
    """The wrapper of the Unsplash API (for hiding the private keys)."""
    url = "https://api.unsplash.com//photos/random/?client_id=" + config.UNSPLASH_ACCESS_KEY
    print(config.UNSPLASH_ACCESS_KEY)
    query_str = request.query_string.decode("utf-8")
    if len(query_str) != 0:
        url = url + "&" + query_str
    with urlopen(url) as response:
        return jsonify(json.load(response))
