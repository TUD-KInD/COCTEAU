"""The controller for https://[PATH]/answer/"""

from flask import Blueprint
from flask import request
from flask import jsonify
from flask import make_response
from util.util import InvalidUsage
from util.util import handle_invalid_usage
from util.util import decode_user_token
from util.util import try_wrap_response
from config.config import config
from models.model_operations.answer_operations import get_all_answers
from models.model_operations.answer_operations import remove_answer
from models.model_operations.answer_operations import get_answer_by_id
from models.model_operations.answer_operations import get_answers_by_topic
from models.model_operations.answer_operations import get_answers_by_scenario
from models.model_operations.answer_operations import get_answers_by_question
from models.model_operations.answer_operations import get_answers_by_user
from models.model_operations.answer_operations import create_free_text_answer
from models.model_operations.answer_operations import create_choice_answer
from models.schema import answer_schema
from models.schema import answers_schema


bp = Blueprint("answer_controller", __name__)


@bp.route("/", methods=["GET", "POST", "DELETE"])
def answer():
    """
    The function for operating the answer table.

    Parameters
    ----------
    user_token : str
        The encoded user JWT, issued by the back-end.
        (required for POST and DELETE)
    question_id : int
        Question ID of the answer.
        (optional for GET)
        (required for POST)
    scenario_id : int
        Scenario ID of the question that links to the answer.
        (optional for GET)
    topic_id : int
        Topic ID of the question that links to the answer.
        (optional for GET)
    user_id : int
        ID of the user that provides the answer.
        (optional for GET and POST)
    answer_id : int
        ID of the answer.
        (optional for GET)
        (required for DELETE)
    text : str
        Free text answer to the question.
        (optional for POST)
    choices : list of int
        List of choice IDs to the SINGLE_CHOICE or MULTI_CHOICE question.
        (optional for POST)

    Returns
    -------
    Answer or list of Answer
        The retrieved answer object.
        Or a list of retrieved answer objects.
    """
    rj = request.json

    # Sanity and permission check
    # (POST, PATCH, and DELETE methods are for administrators only)
    if request.method in ["DELETE"]:
        error, _ = decode_user_token(rj, config.JWT_PRIVATE_KEY, check_if_admin=True)
        if error is not None: return error

    # Process the request
    if request.method == "GET":
        # Get all answers or get one answer by its ID
        # Also get answers by question, user, topic, or scenario ID
        question_id = request.args.get("question_id")
        scenario_id = request.args.get("scenario_id")
        topic_id = request.args.get("topic_id")
        user_id = request.args.get("user_id")
        answer_id = request.args.get("answer_id")
        qn = question_id is None
        sn = scenario_id is None
        tn = topic_id is None
        un = user_id is None
        an = answer_id is None
        if qn and sn and tn and un and an:
            return try_get_all_answers()
        elif not qn and sn and tn and un and an:
            return try_get_answers_by_question(question_id)
        elif qn and not sn and tn and un and an:
            return try_get_answers_by_scenario(scenario_id)
        elif qn and not sn and tn and not un and an:
            return try_get_answers_by_scenario(scenario_id, user_id=user_id)
        elif qn and sn and not tn and un and an:
            return try_get_answers_by_topic(topic_id)
        elif qn and sn and not tn and not un and an:
            return try_get_answers_by_topic(topic_id, user_id=user_id)
        elif qn and sn and tn and not un and an:
            return try_get_answers_by_user(user_id)
        elif qn and sn and tn and un and not an:
            return try_get_answer_by_id(answer_id)
        else:
            e = InvalidUsage("Wrong combination of query parameters.", status_code=400)
            return handle_invalid_usage(e)
    elif request.method == "POST":
        # Create an answer
        error, user_json = decode_user_token(rj, config.JWT_PRIVATE_KEY, check_if_admin=False)
        if error is not None: return error
        question_id = rj.get("question_id")
        if question_id is None:
            e = InvalidUsage("Must have 'question_id'.", status_code=400)
            return handle_invalid_usage(e)
        user_id = user_json["user_id"]
        choices = rj.get("choices")
        text = rj.get("text")
        if choices is None:
            if text is None:
                e = InvalidUsage("Must have 'text' and/or 'choices'.", status_code=400)
                return handle_invalid_usage(e)
            else:
                return try_create_free_text_answer(text, user_id, question_id)
        else:
            return try_create_choice_answer(choices, user_id, question_id, text=text)
    elif request.method == "DELETE":
        # Delete an answer (admin only)
        answer_id = rj.get("answer_id")
        if answer_id is None:
            e = InvalidUsage("Must have 'answer_id'.", status_code=400)
            return handle_invalid_usage(e)
        else:
            return try_remove_answer(answer_id)
    else:
        # Wrong methods
        e = InvalidUsage("Method not allowed.", status_code=405)
        return handle_invalid_usage(e)


@try_wrap_response
def try_create_choice_answer(choices, user_id, question_id, text=None):
    data = create_choice_answer(choices, user_id, question_id, text=text)
    return jsonify({"data": answer_schema.dump(data)})


@try_wrap_response
def try_create_free_text_answer(text, user_id, question_id):
    data = create_free_text_answer(text, user_id, question_id)
    return jsonify({"data": answer_schema.dump(data)})


@try_wrap_response
def try_get_answer_by_id(answer_id):
    data = get_answer_by_id(answer_id)
    return jsonify({"data": answer_schema.dump(data)})


@try_wrap_response
def try_get_all_answers():
    data = get_all_answers()
    return jsonify({"data": answers_schema.dump(data)})


@try_wrap_response
def try_get_answers_by_user(user_id):
    data = get_answers_by_user(user_id)
    return jsonify({"data": answers_schema.dump(data)})


@try_wrap_response
def try_get_answers_by_question(question_id):
    data = get_answers_by_question(question_id)
    return jsonify({"data": answers_schema.dump(data)})


@try_wrap_response
def try_get_answers_by_scenario(scenario_id, user_id=None):
    data = get_answers_by_scenario(scenario_id, user_id=user_id)
    return jsonify({"data": answers_schema.dump(data)})


@try_wrap_response
def try_get_answers_by_topic(topic_id, user_id=None):
    data = get_answers_by_topic(topic_id, user_id=user_id)
    return jsonify({"data": answers_schema.dump(data)})


@try_wrap_response
def try_remove_answer(answer_id):
    remove_answer(answer_id)
    return make_response("", 204)
