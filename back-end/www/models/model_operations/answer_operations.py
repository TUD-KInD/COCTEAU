"""Functions to operate the answer table."""

import itertools
from sqlalchemy.orm import lazyload
from sqlalchemy.orm import load_only
from models.model import db
from models.model import Answer
from models.model import QuestionTypeEnum
from models.model import Scenario
from models.model import Question
from models.model_operations import question_operations
from models.model_operations import scenario_operations
from models.model_operations import topic_operations


def create_free_text_answer(text, user_id, question_id, secret=None):
    """
    Create an answer for a FREE_TEXT question.

    Parameters
    ----------
    text : str
        String containing the aswer.
    user_id : int
        ID of the user providing the answer.
    question_id : int
        ID of the question the user wants to answer.
    secret : str
        Any secret information related to the answer for admin users.

    Returns
    -------
    answer : Answer
        The created answer as Answer object.

    Raises
    ------
    exception : Exception
        In case that no question is found.
    exception : Exception
        In case the questions is not of type FREE_TEXT.
    """
    question = question_operations.get_question_by_id(question_id)

    if question is None:
        raise Exception("No question found in the database to create a free text answer.")

    # The free text answer is supported only by FREE_TEXT question
    if question.question_type != QuestionTypeEnum.FREE_TEXT:
        raise Exception(question.question_type, " question does not support textual answer.")

    answer = Answer(text=text, user_id=user_id, question_id=question_id, secret=secret)

    db.session.add(answer)
    db.session.commit()

    return answer


def create_choice_answer(choices, user_id, question_id, text=None, secret=None):
    """
    Create an answer for a FREE_TEXT question.

    Parameters
    ----------
    choices : list of int
        List of choices *id* selected by the user.
    user_id : int
        ID of the user providing the answer.
    question_id : int
        ID of the question the user wants to answer.
    text : str
        String containing the free text answer with the choice answer.
        (for example, an optional textbox for user feedback)
    secret : str
        Any secret information related to the answer for admin users.

    Returns
    -------
    answer : Answer
        The created answer as Answer object.

    Raises
    ------
    exception : Exception
        In case that no question is found.
    exception : Exception
        In case the number of choice is more than one and the question type is SINGLE_CHOICE.
    """
    # trick to easily handle single and multi-choice answers
    if not isinstance(choices, list):
        choices = [choices]

    question = question_operations.get_question_by_id(question_id)

    if question is None:
        raise Exception("No question found in the database to create a choice answer.")

    # If the question is SINGLE_CHOICE you can only have one selected choice
    if question.question_type == QuestionTypeEnum.SINGLE_CHOICE and len(choices) > 1:
        raise Exception(question.question_type, " question supports only one choice.")

    selected_choices = list(filter(lambda x: x.id in choices, question.choices))

    answer = Answer(user_id=user_id, choices=selected_choices, question_id=question_id, text=text, secret=secret)

    db.session.add(answer)
    db.session.commit()

    return answer


def get_answers_by_user(user_id):
    """
    Get all the answers provided by one user.

    Parameters
    ----------
    user_id : int
        Id of the user.

    Returns
    -------
    answers : Answer
        The retrieved answer as Answer object.
    """
    answers = Answer.query.filter_by(user_id=user_id).all()

    return answers


def get_answers_by_question(question_id):
    """
    Get all the answers submitted to a question.

    Parameters
    ----------
    question_id : int
        ID of the question.

    Returns
    -------
    answers : list of Answer
        The list retrieved answers as Answer objects (or an empty list).
    """
    answers = Answer.query.filter_by(question_id=question_id).all()

    return answers


def get_answers_by_scenario(scenario_id, user_id=None):
    """
    Get all the answers submitted to questions related to a scenario.

    Parameters
    ----------
    scenario_id : int
        ID of the scenario.
    user_id : int
        Desired user ID of the answers.

    Returns
    -------
    answers : list of Answer
        The list retrieved answers as Answer objects (or an empty list).

    Raises
    ------
    exception : Exception
        In case that no scenario is found.
    """
    scenario = scenario_operations.get_scenario_by_id(scenario_id)

    if scenario is None:
        raise Exception("No scenario found in the database to get answers.")

    questions = scenario.questions

    answers = [q.answers for q in questions]
    answers = list(itertools.chain(*answers))

    if user_id is not None:
        user_id = int(user_id)
        answers = [a for a in answers if a.user_id==user_id]

    return answers


def get_answers_by_topic(topic_id, user_id=None):
    """
    Get all the answers submitted to questions related to a topic.

    Parameters
    ----------
    topic_id : int
        ID of the topic.
    user_id : int
        Desired user ID of the answers.

    Returns
    -------
    answers : list of Answer
        The list retrieved answers as Answer objects (or an empty list).

    Raises
    ------
    exception : Exception
        In case that no topic is found.
    """
    topic = topic_operations.get_topic_by_id(topic_id)

    if topic is None:
        raise Exception("No topic found in the database to get answers.")

    questions = topic.questions

    answers = [q.answers for q in questions]
    answers = list(itertools.chain(*answers))

    if user_id is not None:
        user_id = int(user_id)
        answers = [a for a in answers if a.user_id==user_id]

    return answers


def get_all_answers():
    """
    Get all answers.

    Returns
    -------
    answers : list of Answer
        The list retrieved answers as Answer objects (or an empty list).
    """
    # TODO: need a testing case
    answers = Answer.query.all()

    return answers


def get_answer_by_id(answer_id):
    """
    Get an answer by its ID.

    Parameters
    ----------
    answer_id : int
        ID of the answer.

    Returns
    -------
    answer : Answer
        The retrieved answer object.
    """
    # TODO: need a testing case
    answer = Answer.query.filter_by(id=answer_id).first()

    return answer


def remove_answer(answer_id):
    """
    Remove an answer.

    Parameters
    ----------
    answer_id : int
        ID of the answer.

    Raises
    ------
    exception : Exception
        In case that no answer is found.
    """
    answer = get_answer_by_id(answer_id)

    if answer is None:
        raise Exception("No answer found in the database to delete.")

    db.session.delete(answer)
    db.session.commit()
