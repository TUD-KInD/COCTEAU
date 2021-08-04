"""
The controller for https://[PATH]/photos/
"""

from flask import Blueprint
from flask import jsonify
from flask import request
import json
import urllib
from urllib.request import urlopen
from urllib.error import URLError
from urllib.error import HTTPError
import traceback
from util.util import InvalidUsage
from util.util import handle_invalid_usage
from config.config import config


bp = Blueprint("photos_controller", __name__)


@bp.route("/random")
def get_random_photos():
    """The wrapper of the Unsplash API (for hiding the private keys)."""
    url = "https://api.unsplash.com//photos/random/?client_id=" + config.UNSPLASH_ACCESS_KEY
    query_str = request.query_string.decode("utf-8")
    if len(query_str) != 0:
        url = url + "&" + query_str
    try:
        with urlopen(url) as response:
            return jsonify(json.load(response))
    except URLError as ex:
        traceback.print_exc()
        e = InvalidUsage(ex.reason, status_code=400)
        return handle_invalid_usage(e)
    except HTTPError as ex:
        traceback.print_exc()
        e = InvalidUsage(ex.read(), status_code=e.code)
        return handle_invalid_usage(e)
    except:
        traceback.print_exc()
        e = InvalidUsage(traceback.format_exc(), status_code=400)
        return handle_invalid_usage(e)
