"""Functions to operate the topic table."""

from models.model import db
from models.model import Topic


def create_topic(title, description):
    """
    Create a topic.

    Parameters
    ----------
    title : str
        Title of the topic.
    description : str
        Description of the topic.

    Returns
    -------
    topic : Topic
        The newly created Topic.
    """
    topic = Topic(title=title, description=description)

    db.session.add(topic)
    db.session.commit()

    return topic


def get_topic_by_id(topic_id):
    """
    Get a topic by its ID.

    Parameters
    ----------
    topic_id : int
        ID of the topic.

    Returns
    -------
    topic : Topic
        The retrieved topic object.
    """
    topic = Topic.query.filter_by(id=topic_id).first()

    return topic


def get_all_topics():
    """
    Get all topics.

    Returns
    -------
    topics : list of Topic
        The list of retrieved topic objects.
    """
    # TODO: need a testing case
    topics = Topic.query.all()

    return topics


def update_topic(topic_id, title=None, description=None):
    """
    Modify a topic.

    Parameters
    ----------
    topic_id : int
        ID of the topic.
    title : str
        New title of the topic.
    description : str
        New description of the topic.

    Returns
    -------
    topic : Topic
        The retrieved topic object.

    Raises
    ------
    exception : Exception
        When no topic is found.
    """
    topic = get_topic_by_id(topic_id)

    if topic is None:
        raise Exception("No topic found in the database to update.")

    if title is not None:
        topic.title = title

    if description is not None:
        topic.description = description

    db.session.commit()

    return topic


def remove_topic(topic_id):
    """
    Remove a topic.

    Parameters
    ----------
    topic_id : int
        ID of the topic.

    Raises
    ------
    exception : Exception
        When no topic is found.
    """
    topic = get_topic_by_id(topic_id)

    if topic is None:
        raise Exception("No topic found in the database to delete.")

    db.session.delete(topic)
    db.session.commit()
