"""Functions to operate the question table."""

from models.model import db
from models.model import Question
from models.model import QuestionTypeEnum
from models.model import Choice


def create_description(text, topic_id=None, scenario_id=None, order=None, page=None):
    """
    Create only the description for either a topic *or* a scenario.

    The client will treat this as a text description rather than a question.

    Parameters
    ----------
    text : str
        Body of the question.
    topic_id : int
        ID of the topic the question is related to.
    scenario_id : int
        ID of the topic the question is related to.
    order : int
        Order of the question relative to others.
    page : int
        The page number that the question belongs to.
        (for creating questions on different pages on the front-end)

    Returns
    -------
    question : Question
        The created question as a Question object.

    Raises
    ------
    exception : Exception
        In case both topic ID and scenario ID are None.
    exception : Exception
        In case both topic ID and scenario ID are passed to the function.
    exception : Exception
        In case that the order parameter is not None and not an integer.
    exception : Exception
        In case that the page parameter is not None and not an integer.
    """
    # TODO: need a testing case
    # Raise an error if both scenario and topic are specified.
    # (or if neither of them are specified)
    if topic_id is None and scenario_id is None:
        raise Exception("Topic ID and Scenario ID cannot be both None.")

    if topic_id is not None and scenario_id is not None:
        raise Exception("Specify only the Topic ID or the Scenario ID (not both).")

    order = 0 if order is None else order
    if type(order) != int:
        raise Exception("Order needs to be an integer.")

    page = 0 if page is None else page
    if type(page) != int:
        raise Exception("Page needs to be an integer.")

    question = Question(text=text, topic_id=topic_id, scenario_id=scenario_id,
            order=order, page=page)

    db.session.add(question)
    db.session.commit()

    return question


def create_free_text_question(text, topic_id=None, scenario_id=None, order=None, page=None):
    """
    Create a free text question for either a topic *or* a scenario.

    Questions for a topic is used as demographic questions.
    Questions for a scenario is used as survey questions.

    Parameters
    ----------
    text : str
        Body of the question.
    topic_id : int
        ID of the topic the question is related to.
    scenario_id : int
        ID of the topic the question is related to.
    order : int
        Order of the question relative to others.
    page : int
        The page number that the question belongs to.
        (for creating questions on different pages on the front-end)

    Returns
    -------
    question : Question
        The created question as a Question object.

    Raises
    ------
    exception : Exception
        In case both topic ID and scenario ID are None.
    exception : Exception
        In case both topic ID and scenario ID are passed to the function.
    exception : Exception
        In case that the order parameter is not None and not an integer.
    exception : Exception
        In case that the page parameter is not None and not an integer.
    """
    # TODO: need to improve the testing case
    # Raise an error if both scenario and topic are specified.
    # (or if neither of them are specified)
    if topic_id is None and scenario_id is None:
        raise Exception("Topic ID and Scenario ID cannot be both None.")

    if topic_id is not None and scenario_id is not None:
        raise Exception("Specify only the Topic ID or the Scenario ID (not both).")

    order = 0 if order is None else order
    if type(order) != int:
        raise Exception("Order needs to be an integer.")

    page = 0 if page is None else page
    if type(page) != int:
        raise Exception("Page needs to be an integer.")

    question = Question(text=text, question_type=QuestionTypeEnum.FREE_TEXT,
            topic_id=topic_id, scenario_id=scenario_id, order=order, page=page)

    db.session.add(question)
    db.session.commit()

    return question


def create_single_choice_question(text, choices, topic_id=None, scenario_id=None, order=None, page=None):
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
        ID of the topic the question is related to.
    scenario_id : int
        ID of the topic the question is related to.
    order : int
        Order of the question relative to others.
    page : int
        The page number that the question belongs to.
        (for creating questions on different pages on the front-end)

    Returns
    -------
    question : Question
        The created question as a Question object.

    Raises
    ------
    exception : Exception
        In case both topic ID and scenario ID are None.
    exception : Exception
        In case both topic ID and scenario ID are passed to the function.
    exception : Exception
        In case that the choices parameter is not a list.
    exception : Exception
        In case that the order parameter is not None and not an integer.
    exception : Exception
        In case that the page parameter is not None and not an integer.
    """
    # TODO: need to improve the testing case
    # Raise an error if both scenario and topic are specified.
    # (or if neither of them are specified)
    if topic_id is None and scenario_id is None:
        raise Exception("Topic ID and Scenario ID cannot be both None.")

    if topic_id is not None and scenario_id is not None:
        raise Exception("Specify only the Topic ID or the Scenario ID.")

    order = 0 if order is None else order
    if type(order) != int:
        raise Exception("Order needs to be an integer.")

    page = 0 if page is None else page
    if type(page) != int:
        raise Exception("Page needs to be an integer.")

    if type(choices) != list:
        raise Exception("Choices need to be a list.")

    question = Question(text=text, question_type=QuestionTypeEnum.SINGLE_CHOICE,
            topic_id=topic_id, scenario_id=scenario_id, order=order, page=page)

    for c in choices:
        question.choices.append(create_choice(c))

    db.session.add(question)
    db.session.commit()

    return question


def create_multi_choice_question(text, choices, topic_id=None, scenario_id=None, order=None, page=None):
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
        ID of the topic the question is related to.
    scenario_id : str
        ID of the topic the question is related to.
    order : int
        Order of the question relative to others.
    page : int
        The page number that the question belongs to.
        (for creating questions on different pages on the front-end)

    Returns
    -------
    question : Question
        The created question as a Question object.

    Raises
    ------
    exception : Exception
        In case both topic ID and scenario ID are None.
    exception : Exception
        In case both topic ID and scenario ID are passed to the function.
    exception : Exception
        In case that the choices parameter is not a list.
    exception : Exception
        In case that the order parameter is not None and not an integer.
    exception : Exception
        In case that the page parameter is not None and not an integer.
    """
    # TODO: need to improve the testing case
    if topic_id is None and scenario_id is None:
        raise Exception("Topic ID and Scenario ID cannot be both None.")

    if topic_id is not None and scenario_id is not None:
        raise Exception("Specify only the Topic ID or the Scenario ID.")

    order = 0 if order is None else order
    if type(order) != int:
        raise Exception("Order needs to be an integer.")

    page = 0 if page is None else page
    if type(page) != int:
        raise Exception("Page needs to be an integer.")

    if type(choices) != list:
        raise Exception("Choices need to be a list.")

    question = Question(text=text, question_type=QuestionTypeEnum.MULTI_CHOICE,
            topic_id=topic_id, scenario_id=scenario_id, order=order, page=page)

    for c in choices:
        question.choices.append(create_choice(c))

    db.session.add(question)
    db.session.commit()

    return question


def get_question_by_id(question_id, page=None):
    """
    Get the details of a queston by its ID.

    Parameters
    ----------
    quetion_id : int
        ID of the queston.
    page : int
        The page number that the question belongs to.
        (for creating questions on different pages on the front-end)

    Returns
    -------
    question : Question
        The retrieved question or None if nothing is found.
    """
    # TODO: need to improve the testing case
    if page is None:
        question = Question.query.filter_by(id=question_id).first()
    else:
        question = Question.query.filter_by(id=question_id, page=page).first()

    return question


def get_questions_by_topic(topic_id, page=None):
    """
    Get all the questions related to a topic.

    Parameters
    ----------
    topic_id : int
        ID of the topic.
    page : int
        The page number that the question belongs to.
        (for creating questions on different pages on the front-end)

    Returns
    -------
    questions : list of Question
        The list of questions or an empty list.
    """
    # TODO: need to improve the testing case
    if page is None:
        questions = Question.query.filter_by(topic_id=topic_id).all()
    else:
        questions = Question.query.filter_by(topic_id=topic_id, page=page).all()

    return questions


def get_questions_by_scenario(scenario_id, page=None):
    """
    Get all the question related to a scenario.

    Parameters
    ----------
    scenario_id : int
        ID of the scenario.
    page : int
        The page number that the question belongs to.
        (for creating questions on different pages on the front-end)

    Returns
    -------
    questions : list of Question
        The list of questions or an empty list.
    """
    # TODO: need to improve the testing case
    if page is None:
        questions = Question.query.filter_by(scenario_id=scenario_id).all()
    else:
        questions = Question.query.filter_by(scenario_id=scenario_id, page=page).all()

    return questions


def get_all_questions(page=None):
    """
    Get all questions.

    Returns
    -------
    questions : list of Question
        The list of retrieved question objects.
    page : int
        The page number that the question belongs to.
        (for creating questions on different pages on the front-end)
    """
    # TODO: need a testing case
    if page is None:
        questions = Question.query.all()
    else:
        questions = Question.query.filter_by(page=page).all()

    return questions


def update_question(question_id, text=None, choices=None, topic_id=None, scenario_id=None, order=None, page=None):
    """
    Modify a question text or choices.

    Parameters
    ----------
    text : str
        The new text of the question.
    choices : list
        A list of new choices. It overrides the old ones.
    topic_id : int
        ID of the topic the question is related to.
    scenario_id : str
        ID of the topic the question is related to.
    order : int
        Order of the question relative to others.
    page : int
        The page number that the question belongs to.
        (for creating questions on different pages on the front-end)

    Returns
    -------
    questions : Question
        The updated question object.

    Raises
    ------
    exception : Exception
        When no question is found.
    exception : Exception
       In case you attempt to add Choices to a FREE_TEXT question.
    exception : Exception
       In case you attempt to add Choices to a question with question_type None.
    exception : Exception
        In case that the choices parameter is not a list.
    exception : Exception
        In case that the length of old and new choices are not the same.
    exception : Exception
        In case both topic ID and scenario ID are passed to the function.
    exception : Exception
        In case of updating the topic ID when the original one is None.
    exception : Exception
        In case of updating the scenario ID when the original one is None.
    exception : Exception
        In case that the order parameter is not None and not an integer.
    exception : Exception
        In case that the page parameter is not None and not an integer.
    """
    # TODO: need to improve the testing case
    question = get_question_by_id(question_id)

    if question is None:
        raise Exception("No question found in the database to update.")

    if text is not None:
        question.text = text

    order = 0 if order is None else order
    if type(order) is int:
        question.order = order
    else:
        raise Exception("Order needs to be an integer.")

    page = 0 if page is None else page
    if type(page) is int:
        question.page = page
    else:
        raise Exception("Page needs to be an integer.")

    if topic_id is not None:
        if scenario_id is not None:
            raise Exception("Specify only the Topic ID or the Scenario ID.")
        else:
            if question.topic_id is None:
                raise Exception("Cannot update topic ID since the original one is None.")
            else:
                question.topic_id = topic_id
    else:
        if scenario_id is not None:
            if question.scenario_id is None:
                raise Exception("Cannot update scenario ID since the original one is None.")
            else:
                question.scenario_id = scenario_id

    if choices is not None:
        if type(choices) != list:
            raise Exception("Choices need to be a list.")
        if question.question_type is None:
            raise Exception("Question with type None does not support choices.")
        else:
            if question.question_type != QuestionTypeEnum.FREE_TEXT:
                if len(question.choices) != len(choices):
                    raise Exception("The length of old and new choices must be the same.")
                else:
                    # Update existing choices
                    for i in range(len(choices)):
                        c = choices[i]
                        if "value" not in c or "text" not in c:
                            raise Exception("Each choice must have both the 'text' and 'value' fields.")
                        question.choices[i].value = c["value"]
                        question.choices[i].text = c["text"]
            else:
                # You cannot add choices to a FREE_TEXT answer
                raise Exception(QuestionTypeEnum.FREE_TEXT, " does not support choices")

    db.session.commit()

    return question


def remove_question(question_id):
    """
    Remove a question.

    Parameters
    ----------
    question_id : int
        ID of the question.

    Raises
    ------
    exception : Exception
        When no question is found.
    """
    question = get_question_by_id(question_id)

    if question is None:
        raise Exception("No question found in the database to delete.")

    # Delete existing choices
    for c in question.choices:
        db.session.delete(c)

    db.session.delete(question)
    db.session.commit()


def create_choice(c):
    """
    Create a choice and check errors.

    Parameters
    ----------
    c : dict
        The choice dictionary, in the format of {"text:"option label","value":option_value}.

    Returns
    -------
    choice : Choice
        The choice object.

    Raises
    ------
    exception : Exception
       In case the choice dictionary does not have both the "text" and "value" fields.
    """
    if "value" not in c or "text" not in c:
        raise Exception("Each choice must have both the 'text' and 'value' fields.")

    value = c["value"]
    text = c["text"]
    choice = Choice(text=text,value=value)

    return choice
