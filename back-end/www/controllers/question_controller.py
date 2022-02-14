"""The controller for https://[PATH]/question/"""

from flask import Blueprint
from flask import request
from flask import jsonify
from flask import make_response
from util.util import InvalidUsage
from util.util import handle_invalid_usage
from util.util import decode_user_token
from util.util import try_wrap_response
from config.config import config
from models.model_operations.question_operations import create_free_text_question
from models.model_operations.question_operations import create_description
from models.model_operations.question_operations import create_single_choice_question
from models.model_operations.question_operations import create_multi_choice_question
from models.model_operations.question_operations import get_question_by_id
from models.model_operations.question_operations import get_questions_by_topic
from models.model_operations.question_operations import get_questions_by_scenario
from models.model_operations.question_operations import get_all_questions
from models.model_operations.question_operations import update_question
from models.model_operations.question_operations import remove_question
from models.schema import question_schema
from models.schema import questions_schema


bp = Blueprint("question_controller", __name__)


@bp.route("/", methods=["GET", "POST", "PATCH", "DELETE"])
def question():
    """
    The function for operating the question table.

    Parameters
    ----------
    user_token : str
        The encoded user JWT, issued by the back-end.
        (required for POST, PATCH, and DELETE)
    question_id : int
        The ID of a question.
        (required for PATCH and DELETE)
        (optional in the URL query parameters for GET)
    topic_id : int
        The topic ID of a question.
        (optional in the URL query parameters for GET)
        (optional for POST and PATCH)
    scenario_id : int
        The scenario ID of a question.
        (optional in the URL query parameters for GET)
        (optional for POST and PATCH)
    text : str
        The text of a question.
        (required for POST)
        (optional for PATCH)
    order : int
        The order of a question relative to others.
        (optional for POST and PATCH)
    page : int
        The page number that the question belongs to.
        (for creating questions on different pages on the front-end)
        (optional for POST and PATCH)
    choices : list of dict
        The choices of a question, in the format [{"text:"option label","value":option_value}].
        (optional for POST and PATCH)
    is_mulitple_choice : bool
        Indicate if the question allows multiple choices.
        (optional for POST)
    is_just_description : bool
        Indicate if the question is just a description (but not a question).
        (optional for POST)

    Returns
    -------
    Question or list of Question
        The retrieved question object.
        (for GET with question_id in the URL query parameters)
        (for POST and PATCH)
        Or a list of retrieved question objects.
        (for GET with topic_id or scenario_id in the URL query parameters)
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
        # Get all questions, or get questions by topic/scenario ID, or get a question by its ID
        question_id = request.args.get("question_id")
        scenario_id = request.args.get("scenario_id")
        topic_id = request.args.get("topic_id")
        page = request.args.get("page")
        qn = question_id is None
        sn = scenario_id is None
        tn = topic_id is None
        if qn and sn and tn:
            return try_get_all_questions(page=page)
        elif not qn and sn and tn:
            return try_get_question_by_id(question_id, page=page)
        elif qn and not sn and tn:
            return try_get_questions_by_scenario(scenario_id, page=page)
        elif qn and sn and not tn:
            return try_get_questions_by_topic(topic_id, page=page)
        else:
            e = InvalidUsage("Too many query parameters.", status_code=400)
            return handle_invalid_usage(e)
    elif request.method == "POST":
        # Create a question (admin only)
        text = rj.get("text")
        if text is None:
            e = InvalidUsage("Must have 'text'.", status_code=400)
            return handle_invalid_usage(e)
        choices = rj.get("choices")
        is_just_description = rj.get("is_just_description")
        if is_just_description is True:
            f = try_create_description
        else:
            f = try_create_free_text_question
        if choices is not None:
            is_mulitple_choice = rj.get("is_mulitple_choice")
            if is_mulitple_choice is True:
                f = try_create_multi_choice_question
            else:
                f = try_create_single_choice_question
        topic_id = rj.get("topic_id")
        scenario_id = rj.get("scenario_id")
        order = rj.get("order")
        page = rj.get("page")
        if topic_id is None:
            if scenario_id is None:
                e = InvalidUsage("Must have either 'topic_id' or 'scenario_id'.", status_code=400)
                return handle_invalid_usage(e)
            else:
                # This means that it is a scenario question
                return f(text, choices, scenario_id=scenario_id, order=order, page=page)
        else:
            if scenario_id is None:
                # This means that it is a demographic question
                return f(text, choices, topic_id=topic_id, order=order, page=page)
            else:
                e = InvalidUsage("Cannot have both 'topic_id' and 'scenario_id'.", status_code=400)
                return handle_invalid_usage(e)
    elif request.method == "PATCH":
        # Update a question (admin only)
        question_id = rj.get("question_id")
        if question_id is None:
            e = InvalidUsage("Must have 'question_id'.", status_code=400)
            return handle_invalid_usage(e)
        t = rj.get("text")
        c = rj.get("choices")
        si = rj.get("scenario_id")
        ti = rj.get("topic_id")
        o = rj.get("order")
        p = rj.get("page")
        if t is None and c is None and si is None and ti is None and o is None and p is None:
            e = InvalidUsage("Must have at least one field to update.", status_code=400)
            return handle_invalid_usage(e)
        else:
            return try_update_question(question_id, text=t, choices=c,
                    topic_id=ti, scenario_id=si, order=o, page=p)
    elif request.method == "DELETE":
        # Delete a question (admin only)
        question_id = rj.get("question_id")
        if question_id is None:
            e = InvalidUsage("Must have 'question_id'.", status_code=400)
            return handle_invalid_usage(e)
        else:
            return try_remove_question(question_id)
    else:
        # Wrong methods
        e = InvalidUsage("Method not allowed.", status_code=405)
        return handle_invalid_usage(e)


@try_wrap_response
def try_get_all_questions(page=None):
    data = get_all_questions(page=page)
    return jsonify({"data": questions_schema.dump(data)})


@try_wrap_response
def try_get_question_by_id(question_id, page=None):
    data = get_question_by_id(question_id, page=page)
    return jsonify({"data": question_schema.dump(data)})


@try_wrap_response
def try_get_questions_by_scenario(scenario_id, page=None):
    data = get_questions_by_scenario(scenario_id, page=page)
    return jsonify({"data": questions_schema.dump(data)})


@try_wrap_response
def try_get_questions_by_topic(topic_id, page=None):
    data = get_questions_by_topic(topic_id, page=page)
    return jsonify({"data": questions_schema.dump(data)})


@try_wrap_response
def try_create_multi_choice_question(text, choices,
        topic_id=None, scenario_id=None, order=None, page=None):
    data = create_multi_choice_question(text, choices,
            topic_id=topic_id, scenario_id=scenario_id, order=order, page=page)
    return jsonify({"data": question_schema.dump(data)})


@try_wrap_response
def try_create_single_choice_question(text, choices,
        topic_id=None, scenario_id=None, order=None, page=None):
    data = create_single_choice_question(text, choices,
            topic_id=topic_id, scenario_id=scenario_id, order=order, page=page)
    return jsonify({"data": question_schema.dump(data)})


@try_wrap_response
def try_create_free_text_question(text, choices,
        topic_id=None, scenario_id=None, order=None, page=None):
    # IMPORTANT: choices is a dummy parameter for formatting, do not remove it
    data = create_free_text_question(text,
            topic_id=topic_id, scenario_id=scenario_id, order=order, page=page)
    return jsonify({"data": question_schema.dump(data)})


@try_wrap_response
def try_create_description(text, choices,
        topic_id=None, scenario_id=None, order=None, page=None):
    # IMPORTANT: choices is a dummy parameter for formatting, do not remove it
    data = create_description(text,
            topic_id=topic_id, scenario_id=scenario_id, order=order, page=page)
    return jsonify({"data": question_schema.dump(data)})


@try_wrap_response
def try_remove_question(question_id):
    remove_question(question_id)
    return make_response("", 204)


@try_wrap_response
def try_update_question(question_id, text=None, choices=None,
        topic_id=None, scenario_id=None, order=None, page=None):
    data = update_question(question_id, text=text, choices=choices,
            topic_id=topic_id, scenario_id=scenario_id, order=order, page=page)
    return jsonify({"data": question_schema.dump(data)})
