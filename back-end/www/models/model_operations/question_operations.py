"""Functions to operate the question table."""

from models.model import db
from models.model import Question
from models.model import QuestionTypeEnum
from models.model import Choice


def create_free_text_question(text, topic_id=None, scenario_id=None):
    """
    Create a free text question for either a topic *or* a scenario.

    Parameters
    ----------
    text : str
        Body of the question.
    topic_id : int
        Id of the topic the question is related to.
    scenario_id : int
        Id of the topic the question is related to.

    Returns
    -------
    question : Question
        The created question as ``Question`` object.

    Raises
    ------
    exception : Exception
        In case both topic id and scenario id are ``None``.
    exception : Exception
        In case both topic id and scenario id are passed to the function.
    """
    # Raise an error if both scenario and topic are specified.
    # (or if neither of them are specified)
    if topic_id is None and scenario_id is None:
        raise Exception("Topic id and Scenario id cannot be both None")

    if topic_id is not None and scenario_id is not None:
        raise Exception("Specify only the Topic OR the Scenario")


    question = Question(text=text, question_type=QuestionTypeEnum.FREE_TEXT,
            topic_id=topic_id, scenario_id=scenario_id)

    db.session.add(question)
    db.session.commit()

    return question


def create_single_choice_question(text, choices, topic_id=None, scenario_id=None):
    """
    Create a single choice question for either a topic *or* a scenario.

    Parameters
    ----------
    text : str
        Body of the question.
    choices : list
        List of question choices.
        It must be a list of objects with the structure {"text:"option label","value":option_value}.
    topic_id : int
        Id of the topic the question is related to.
    scenario_id : int
        Id of the topic the question is related to.

    Returns
    -------
    question : Question
        The created question as ``Question`` object.

    Raises
    ------
    exception : Exception
        In case both topic id and scenario id are ``None``.
    exception : Exception
        In case both topic id and scenario id are passed to the function.
    """
    # Raise an error if both scenario and topic are specified.
    # (or if neither of them are specified)
    if topic_id is None and scenario_id is None:
        raise Exception("Topic id and Scenario id cannot be both None")

    if topic_id is not None and scenario_id is not None:
        raise Exception("Specify only the Topic OR the Scenario")

    question = Question(text=text, question_type=QuestionTypeEnum.SINGLE_CHOICE,
            topic_id=topic_id, scenario_id=scenario_id)

    for c in choices:

        value = c["value"]
        text = c["text"]

        choice = Choice(text=text,value=value)
        question.choices.append(choice)

    db.session.add(question)
    db.session.commit()

    return question


def create_multi_choice_question(text, choices, topic_id=None, scenario_id=None):

    """
    Create a single choice question for either a topic *or* a scenario.

    Parameters
    ----------
    text : str
        Body of the question.
    choices : list
        List of question choices.
        It must be a list of objects with the structure {"text:"option label","value":option_value}.
    topic_id : int
        Id of the topic the question is related to.
    scenario_id : str
        Id of the topic the question is related to.

    Returns
    -------
    question : Question
        The created question as ``Question`` object.

    Raises
    ------
    exception : Exception
        In case both topic id and scenario id are ``None``.
    exception : Exception
        In case both topic id and scenario id are passed to the function.
    """
    if topic_id is None and scenario_id is None:
        raise Exception("Topic id and Scenario id cannot be both None")

    if topic_id is not None and scenario_id is not None:
        raise Exception("Specify only the Topic OR the Scenario")

    question = Question(text=text, question_type=QuestionTypeEnum.MULTI_CHOICE,
            topic_id=topic_id, scenario_id=scenario_id)

    for c in choices:

        value = c["value"]
        text = c["text"]

        choice = Choice(text=text,value=value)
        question.choices.append(choice)

    db.session.add(question)
    db.session.commit()

    return question


def get_question_by_id(question_id):
    """
    Get the details of a queston by its id.

    Parameters
    ----------
    quetion_id : int
        Id of the queston.

    Returns
    -------
    question : Question
        The retrieved question or ``None`` if nothing is found.
    """
    question = Question.query.filter_by(id=question_id).first()

    return question


def get_questions_by_topic(topic_id):
    """
    Get all the questions related to a topic.

    Parameters
    ----------
    topic_id : int
        Id of the topic.

    Returns
    -------
    questions : list
        The list of questions or an empty list.
    """
    questions = list(Question.query.filter_by(topic_id=topic_id))

    return questions


def get_questions_by_scenario(scenario_id):
    """
    Get all the question related to a scenario.

    Parameters
    ----------
    scenario_id : int
        Id of the scenario.

    Returns
    -------
    questions : list
        The list of questions or an empty list.
    """
    questions = list(Question.query.filter_by(scenario_id=scenario_id))

    return questions


def update_question(question_id, text=None, choices=None):
    """
    Modify a question text or choices.

    Parameters
    ----------
    text : str
        The new text of the question.
    choices : list
        A list of new choices. It overrides the old ones.

    Raises
    ------
    exception : Exception
       In case you attempt to add Choices to a ``FREE_TEXT`` question.
    """
    question = Question.query.filter_by(id=question_id).first()

    if text is not None:
        question.text = text

    if choices is not None:
        if question.question_type != QuestionTypeEnum.FREE_TEXT:

            # Delete existing choices
            for c in question.choices:
                db.session.delete(c)

            # Add the new choices
            for c in choices:
                value = c["value"]
                text = c["text"]

                choice = Choice(text=text,value=value)
                question.choices.append(choice)

        else:
            # You cannot add choices to a FREE_TEXT answer
            raise Exception(QuestionTypeEnum.FREE_TEXT,
                    " does not support choices")

    db.session.commit()


def remove_question(question_id):
    """
    Remove a question.

    Parameters
    ----------
    question_id : int
        Id of the question.
    """
    question = Question.query.filter_by(id=question_id).first()

    db.session.delete(question)
    db.session.commit()
