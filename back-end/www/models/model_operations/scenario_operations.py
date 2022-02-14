"""Functions to operate the scenario table."""

from models.model import db
from models.model import Scenario


def create_scenario(title, description, image, topic_id, mode=0):
    """
    Create a scenario object.

    Parameters
    ----------
    title : str
        Title of the scenario.
    description : str
        A description of the scenario.
    image : str
        An URL to an image relevant to the scenario.
    topic_id : int
        ID of the topic the scenario is related to.
    mode : int
        The system configuration.
        (0 means the normal deployment mode)
        (other numbers mean different experiment modes)

    Returns
    ------
    scenario : Scenario
        The created scenario.
    """
    scenario = Scenario(title=title, description=description,
            image=image, topic_id=topic_id, mode=mode)

    db.session.add(scenario)
    db.session.commit()

    return scenario


def get_scenario_by_id(scenario_id):
    """
    Get a scenario by its ID.

    Parameters
    ----------
    scenario_id : int
        ID of the scenario.

    Returns
    -------
    scenario : Scenario
        The retrieved scenario object.
    """
    scenario = Scenario.query.filter_by(id=scenario_id).first()

    return scenario


def get_scenarios_by_topic(topic_id):
    """
    Get all the scenarios related to a topic.

    Parameters
    ----------
    topic_id : int
        ID of the topic.

    Returns
    -------
    scenarios : list of Scenario
        List of scenarios belonging to the topic.
    """
    scenarios = Scenario.query.filter_by(topic_id=topic_id).all()

    return scenarios


def get_all_scenarios():
    """
    Get all scenarios.

    Returns
    -------
    scenarios : list of Scenario
        The list of retrieved scenario objects.
    """
    # TODO: need a testing case
    scenarios = Scenario.query.all()

    return scenarios


def update_scenario(scenario_id, title=None, description=None, image=None, topic_id=None, mode=None):
    """
    Modify scenario's title, description or image.

    Parameters
    ----------
    scenario_id : int
        ID of the scenario.
    title : str
        New scenario title.
    description : str
        New scenario description.
    image : str
        New image URL for the scenario.
    mode : int
        The system configuration.
        (0 means the normal deployment mode)
        (other numbers mean different experiment modes)

    Returns
    -------
    scenario : Scenario
        The retrieved scenario object.

    Raises
    ------
    exception : Exception
        When no scenario is found.
    """
    scenario = get_scenario_by_id(scenario_id)

    if scenario is None:
        raise Exception("No scenario found in the database to update.")

    if title is not None:
        scenario.title = title

    if description is not None:
        scenario.description = description

    if image is not None:
        scenario.image = image

    if topic_id is not None:
        scenario.topic_id = topic_id

    if mode is not None:
        scenario.mode = mode

    db.session.commit()

    return scenario


def remove_scenario(scenario_id):
    """
    Remove a scenario.

    Parameters
    ----------
    scenario_id : int
        ID of the scenario.

    Raises
    ------
    exception : Exception
        When no scenario is found.
    """
    scenario = get_scenario_by_id(scenario_id)

    if scenario is None:
        raise Exception("No scenario found in the database to delete.")

    db.session.delete(scenario)
    db.session.commit()
