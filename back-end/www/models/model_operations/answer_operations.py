"""Functions to operate the answer table."""

import itertools
from models.model import db
from models.model import Answer
from models.model import QuestionTypeEnum
from models.model_operations import question_operations
from models.model_operations import scenario_operations
from models.model_operations import topic_operations


def create_free_text_answer(text, user_id, question_id):
    """
    Create an answer for a FREE_TEXT question.

    Parameters
    ----------
    text : str
        String containing the aswer.
    user_id : int
        Id of the user providing the answer.
    question_id : int
        Id of the question the user wants to answer.

    Returns
    -------
    answer : Answer
        The created answer as ``Answer`` object.

    Raises
    ------
    exception : Exception
        In case the questions is not of tyoe ``FREE_TEXT``.
    """
    question = question_operations.get_question_by_id(question_id)

    # The free text answer is supported only by FREE_TEXT question
    if question.question_type != QuestionTypeEnum.FREE_TEXT:
        raise Exception(question.question_type,
                " question does not support textual answer")

    answer = Answer(text=text, user_id=user_id, question_id=question_id)

    db.session.add(answer)
    db.session.commit()

    return answer


def create_choice_answer(choices, user_id, question_id):
    """
    Create an answer for a FREE_TEXT question.

    Parameters
    ----------
    choices : list
        List of choices *id* selected by the user.
    user_id : int
        Id of the user providing the answer.
    question_id : int
        Id of the question the user wants to answer.

    Returns
    -------
    answer : Answer
        The created answer as ``Answer`` object.

    Raises
    ------
    exception : Exception
        In case the questions is of tyoe ``FREE_TEXT``.
    exception : Exception
        In case the number of choice is more than one and the question type is ``SINGLE_CHOICE``.
    """
    # trick to easily handle single and multi-choice answers
    if not isinstance(choices, list):
        choices = [choices]

    question = question_operations.get_question_by_id(question_id)

    # Choice answer are supported only by SINGLE_CHOICE and MULTI_CHOICE question
    if question.question_type == QuestionTypeEnum.FREE_TEXT:
        raise Exception(question.question_type,
                " question does not support choices")

    # If the question is SINGLE_CHOICE you can only have one selected choice
    if question.question_type == QuestionTypeEnum.SINGLE_CHOICE and len(choices) > 1:
        raise Exception(question.question_type,
                " question supports only one choice")

    selected_choices = list(
        filter(lambda x: x.id in choices, question.choices))

    answer = Answer(user_id=user_id, choices=selected_choices,
            question_id=question_id)

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
    answer : Answer
        The retrieved answer as ``Answer`` object.
    """
    answers = list(Answer.query.filter_by(user_id=user_id))

    return answers


def get_answers_by_question(question_id):
    """
    Get all the answers submitted to a question.

    Parameters
    ----------
    question_id : int
        Id of the question.

    Returns
    -------
    answer : list
        The list retrieved answers as ``Answer`` objects, empty list.
    """
    answers = list(Answer.query.filter_by(question_id=question_id))

    return answers


def get_answers_by_scenario(scenario_id):
    """
    Get all the answers submitted to questions related to a scenario.

    Parameters
    ----------
    scenario_id : int
        Id of the scenario.

    Returns
    -------
    answer : list
        The list retrieved answers as ``Answer`` objects, empty list.
    """
    scenario = scenario_operations.get_scenario_by_id(scenario_id)

    questions = scenario.questions

    answers = [q.answers for q in questions]
    answers = list(itertools.chain(*answers))

    return answers


def get_answers_by_topic(topic_id):
    """
    Get all the answers submitted to questions related to a topic.

    Parameters
    ----------
    topic_id : int
        Id of the topic.

    Returns
    -------
    answer : list
        The list retrieved answers as ``Answer`` objects, empty list.
    """
    topic = topic_operations.get_topic_by_id(topic_id)

    questions = topic.questions

    answers = [q.answers for q in questions]
    answers = list(itertools.chain(*answers))

    return answers


def remove_answer(answer_id):
    """
    Remove a answer.

    Parameters
    ----------
    answer_id : int
        Id of the answer.
    """
    answer = Answer.query.filter_by(id=answer_id).first()

    db.session.delete(answer)
    db.session.commit()
