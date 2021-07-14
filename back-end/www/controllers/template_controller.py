"""The controller for https://[PATH]/template/"""

from flask import Blueprint
from flask import request
from flask import jsonify
from util.util import InvalidUsage
from util.util import handle_invalid_usage


bp = Blueprint("template_controller", __name__)


@bp.route("/", methods=["GET", "POST"])
def test():
    """This function is for https://[PATH]/template/"""
    if request.method == "GET":
        return_json = {"test": "GET"}
        return jsonify(return_json)
    elif request.method == "POST":
        e = InvalidUsage("Test bad request", status_code=400)
        return handle_invalid_usage(e)
