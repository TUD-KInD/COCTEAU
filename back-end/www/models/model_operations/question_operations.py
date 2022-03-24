"""Functions to operate the question table."""

from models.model import db
from models.model import Question
from models.model import QuestionTypeEnum
from models.model import Choice


def create_question_list(questions):
    """
    Create a list of questions.

    Parameters
    ----------
    questions : list of dict
        A list of dictionaries.
        Each dictionary has the fields specified in the _create_question function.

    Returns
    -------
    question_list : list of Question
        The list of created questions as Question objects.

    Raises
    ------
    exception : Exception
        When the input is not a list.
    """
    if type(questions) is not list:
        raise Exception("The input must be a list of questions.")

    question_list = []
    for q in questions:
        question_list.append(_create_question(**q))

    db.session.add_all(question_list)
    db.session.commit()

    return question_list


def _create_question(text=None, choices=None, topic_id=None, scenario_id=None, order=0, page=-1,
        shuffle_choices=False, is_just_description=False, is_mulitple_choice=False):
    """
    Create a question object for either a topic or a scenario.

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
    shuffle_choices : bool
        Whether we want to randomly shuffle the choices or not.
        (for the front-end to decide how to handle this parameter)
    is_just_description : bool
        Indicate if the question is just a description (but not a question).
    is_mulitple_choice : bool
        Indicate if the question allows multiple choices.

    Returns
    -------
    question : Question
        The created question as a Question object.

    Raises
    ------
    exception : Exception
        In case the text is None.
    exception : Exception
        In case both topic ID and scenario ID are None.
    exception : Exception
        In case both topic ID and scenario ID are passed to the function.
    exception : Exception
        In case that the choices parameter is not None and not a list.
    """
    if text is None:
        raise Exception("Question body text cannot be None.")

    if topic_id is None and scenario_id is None:
        raise Exception("Topic ID and Scenario ID cannot be both None.")

    if topic_id is not None and scenario_id is not None:
        raise Exception("Specify only the Topic ID or the Scenario ID (not both).")

    if is_just_description:
        # Create only the description (but not a question)
        question = Question(text=text, topic_id=topic_id,
                scenario_id=scenario_id, order=order, page=page)
    else:
        if choices is None:
            # Create a free text question
            # Questions for a topic is used as user consent
            # Questions for a scenario is used as survey questions
            question = Question(text=text, question_type=QuestionTypeEnum.FREE_TEXT,
                    topic_id=topic_id, scenario_id=scenario_id, order=order, page=page)
        else:
            if type(choices) != list:
                raise Exception("Choices need to be a list.")
            if is_mulitple_choice:
                # Create a multiple choice question
                question = Question(text=text, question_type=QuestionTypeEnum.MULTI_CHOICE,
                        topic_id=topic_id, scenario_id=scenario_id,
                        order=order, page=page, shuffle_choices=shuffle_choices)
            else:
                # Create a single choice question
                question = Question(text=text, question_type=QuestionTypeEnum.SINGLE_CHOICE,
                        topic_id=topic_id, scenario_id=scenario_id,
                        order=order, page=page, shuffle_choices=shuffle_choices)
            # Add choices
            for c in choices:
                question.choices.append(create_choice(c))

    return question


def create_description(text, topic_id=None, scenario_id=None, order=0, page=-1):
    """
    Create only the description.

    This function is for backward compatibility.
    """
    q = {"text": text, "topic_id": topic_id, "scenario_id": scenario_id, "order": order, "page": page}
    q["is_just_description"] = True
    return create_question_list([q])[0]


def create_free_text_question(text, topic_id=None, scenario_id=None, order=0, page=-1):
    """
    Create a free text question.

    This function is for backward compatibility.
    """
    q = {"text": text, "topic_id": topic_id, "scenario_id": scenario_id, "order": order, "page": page}
    return create_question_list([q])[0]


def create_single_choice_question(text, choices, topic_id=None, scenario_id=None,
        order=0, page=-1, shuffle_choices=False):
    """
    Create a single choice question.

    This function is for backward compatibility.
    """
    q = {"text": text, "topic_id": topic_id, "scenario_id": scenario_id, "order": order, "page": page}
    q["choices"] = choices
    q["shuffle_choices"] = shuffle_choices
    return create_question_list([q])[0]


def create_multi_choice_question(text, choices, topic_id=None, scenario_id=None,
        order=0, page=-1, shuffle_choices=False):
    """
    Create a multiple choice question.

    This function is for backward compatibility.
    """
    q = {"text": text, "topic_id": topic_id, "scenario_id": scenario_id, "order": order, "page": page}
    q["choices"] = choices
    q["shuffle_choices"] = shuffle_choices
    q["is_mulitple_choice"] = True
    return create_question_list([q])[0]


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

    Returns
    -------
    questions : list of Question
        The list of questions or an empty list.
    """
    # TODO: need a testing case
    if page is None:
        questions = Question.query.all()
    else:
        questions = Question.query.filter_by(page=page).all()

    return questions


def update_question(question_id, text=None, choices=None, topic_id=None, scenario_id=None,
        order=None, page=None, shuffle_choices=None):
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
    shuffle_choices : bool
        Whether we want to randomly shuffle the choices or not.
        (for the front-end to decide how to handle this parameter)

    Returns
    -------
    questions : Question
        The updated question object.

    Raises
    ------
    exception : Exception
        When question ID is None.
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
    """
    # TODO: need to improve the testing case
    if question_id is None:
        raise Exception("Question ID cannot be None.")

    question = get_question_by_id(question_id)

    if question is None:
        raise Exception("No question found in the database to update.")

    if text is not None:
        question.text = text

    if order is not None:
        question.order = order

    if page is not None:
        question.page = page

    if shuffle_choices is not None:
        question.shuffle_choices = shuffle_choices

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


def remove_question_list(question_id_list):
    """
    Remove a list of questions.

    Parameters
    ----------
    question_id : int
        ID of the question.

    Raises
    ------
    exception : Exception
        When the input is not a list.
    """
    if type(question_id_list) is not list:
        raise Exception("The input must be a list of question IDs.")

    questions = []
    for qid in question_id_list:
        q = get_question_by_id(qid)
        if q is None: continue
        # Delete existing choices
        for c in q.choices:
            db.session.delete(c)
        # Delete the question
        db.session.delete(q)

    db.session.commit()


def remove_question(question_id):
    """
    Remove a question.

    This function is for backward compatibility.

    Parameters
    ----------
    question_id : int
        ID of the question.
    """
    remove_question_list([question_id])


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
