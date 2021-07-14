"""Functions to operate the mood, media, and vision tables."""

from models.model import db
from models.model import Vision
from models.model import Media
from models.model import MediaTypeEnum
from models.model import Mood


def create_mood(name):
    """
    Create a Mood object.

    Parameters
    ----------
    name : str
        Label of the mood.

    Returns
    -------
    mood : Mood
        The newly created mood object.
    """
    mood = Mood(name=name)

    db.session.add(mood)

    db.session.commit()

    return mood


def get_mood(mood_id):
    """
    Get a mood by its id.

    Parameters
    ---------
    id : int
        Id of the mood.
    """
    mood = Mood.query.filter_by(id=mood_id).first()

    return mood


def get_moods():
    """
    Get all the moods.

    Returns
    -------
    mood : list
        The list of all created moods.
    """
    moods = Mood.query.all()

    return list(moods)


def __create_media_array(vision_id, medias):
    """
    Create a list of Media objects and attach it to a Vision.

    Parameters
    ----------
    vision_id : int
        Id of the vision.
    medias : list
        Array of objects in the form:
        {"description":"..",
         "type":"..",
         "url":"..",
         "unsplash_image_id":"..",
         "unsplash_creator_name":"..",
         "unsplash_creator_url":".."}
        Type should be either "GIF", "VIDEO or "IMAGE".
        If you don't pass a url, the type is TEXT.
        The order attribute of a Media object is inferred by the position in the medias array.

    Returns
    -------
    vision_medias : list
        Array of Media objects.
    """
    vision_medias = []

    for index, media in enumerate(medias):
        if "url" not in media or media["url"] is None:
            m = Media(description=media["description"],
                    order=index,
                    media_type=MediaTypeEnum.TEXT,
                    url=None,
                    vision_id=vision_id)
            db.session.add(m)
            vision_medias.append(m)
        elif MediaTypeEnum[media["type"]] == MediaTypeEnum.IMAGE:
            m = Media(description=media["description"],
                    order=index,
                    media_type=MediaTypeEnum[media["type"]],
                    url=media["url"],
                    unsplash_image_id=media["unsplash_image_id"],
                    unsplash_creator_name=media["unsplash_creator_name"],
                    unsplash_creator_url=media["unsplash_creator_url"],
                    vision_id=vision_id)
            db.session.add(m)
            vision_medias.append(m)
        else:
            m = Media(description=media["description"],
                    order=index,
                    media_type=MediaTypeEnum[media["type"]],
                    url=media["url"],
                    vision_id=vision_id)
            db.session.add(m)
            vision_medias.append(m)

    return vision_medias


def create_vision(mood_id, medias, user_id, scenario_id, created_at=None):
    """
    Create a Vision object.

    Parameters
    ----------
    mood_id : int
        Id of the mood chosen by the user.
    medias : list
        Array of objects in the form:
        {"description":"..",
         "type":"..",
         "url":"..",
         "unsplash_image_id":"..",
         "unsplash_creator_name":"..",
         "unsplash_creator_url":".."}
        Type should be either "GIF", "VIDEO or "IMAGE".
        If you don't pass a url, the type is TEXT.
        The order attribute of a Media object is inferred by the position in the medias array.
    user_id : int
        Id of the user creating the vision.
    scenario_id : int
        Id of the scenario relevant to the vision.
    created_at (optional) : datetime
        Timestamp when the Vision is created.

    Returns
    -------
    vision : Vision
        The newly created vision object.
    """
    vision = Vision(mood_id=mood_id, user_id=user_id,
            scenario_id=scenario_id, created_at=created_at)
    db.session.add(vision)

    vision.medias = __create_media_array(vision.id, medias)

    db.session.commit()

    return vision


def update_vision(vision_id, mood_id=None, medias=None):
    """
    Modify a Vision.

    Parameters
    ----------
    vision_id : int
        Id of the vision.
    mood_id : int
        New id of the mood assigned to the vision.
    medias : list
        New list of medias assigned to the vision. It overwrite the old ones.
    """
    vision = get_vision_by_id(vision_id)

    if mood_id is not None:
        vision.mood_id = mood_id

    if medias is not None:

        for m in vision.medias:
            db.session.delete(m)

        vision.medias = __create_media_array(vision_id=vision_id, medias=medias)

    db.session.commit()


def remove_vision(vision_id):
    """
    Delete a vision.

    Parameters
    ----------
    vision_id : int
        Id of the vision.
    """
    vision = Vision.query.filter_by(id=vision_id).first()

    db.session.delete(vision)
    db.session.commit()


def get_vision_by_id(vision_id):
    """
    Get a vision by its id.

    Parameters
    ----------
    vision_id : int
        Id of the vision.

    Returns
    -------
    vision : Vision
        The retrieved vision object.
    """
    vision = Vision.query.filter_by(id=vision_id).first()

    return vision


def get_visions_by_scenario(scenario_id):
    """
    Get all the vision related to a scenario.

    Parameters
    ----------
    scenario_id : int
        Id of a scenario.

    Returns
    -------
    visions : list
        List of vision related to the scenario.
    """
    vision = Vision.query.filter_by(scenario_id=scenario_id)

    return list(vision)


def get_visions_by_user(user_id):
    """
    Get all the vision created by a user.

    Parameters
    ----------
    user_od : int
        Id of a user.

    Returns
    -------
    visions : list
        List of vision created by the user.
    """
    vision = Vision.query.filter_by(user_id=user_id)

    return list(vision)
