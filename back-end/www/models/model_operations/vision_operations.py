"""Functions to operate the mood, media, and vision tables."""

from sqlalchemy import desc
from sqlalchemy import func
from models.model import db
from models.model import Vision
from models.model import Media
from models.model import MediaTypeEnum
from models.model import Mood


def create_mood(name, image=None, order=None):
    """
    Create a Mood object.

    Parameters
    ----------
    name : str
        Label of the mood.
    image : str
        Image URL of the mood.
    order : int
        Order of the mood relative to others.

    Returns
    -------
    mood : Mood
        The newly created mood object.
    """
    order = 0 if order is None else order

    mood = Mood(name=name, image=image, order=order)

    db.session.add(mood)
    db.session.commit()

    return mood


def get_mood_by_id(mood_id):
    """
    Get a mood by its ID.

    Parameters
    ---------
    mood_id : int
        ID of the mood.
    """
    mood = Mood.query.filter_by(id=mood_id).first()

    return mood


def get_all_moods():
    """
    Get all the moods.

    Returns
    -------
    mood : list of Mood
        The list of all created moods.
    """
    moods = Mood.query.all()

    return moods


def remove_mood(mood_id):
    """
    Delete a mood.

    Parameters
    ----------
    mood_id : int
        ID of the mood.
    """
    # TODO: need a testing case
    mood = get_mood_by_id(mood_id)

    if mood is None:
        raise Exception("No mood found in the database to delete.")

    db.session.delete(mood)
    db.session.commit()


def update_mood(mood_id, name=None, image=None, order=None):
    """
    Modify a mood.

    Parameters
    ----------
    mood_id : int
        ID of the mood.
    name : str
        New name of the mood.
    image : str
        Image URL of the mood.
    order : int
        Order of the mood relative to others.

    Returns
    -------
    mood : Mood
        The retrieved mood object.

    Raises
    ------
    exception : Exception
        When no mood is found.
    """
    # TODO: need a testing case
    mood = get_mood_by_id(mood_id)

    if mood is None:
        raise Exception("No mood found in the database to update.")

    if name is not None:
        mood.name = name

    if image is not None:
        mood.image = image

    if order is not None:
        mood.order = order

    db.session.commit()

    return mood


def __create_media_array(vision_id, medias):
    """
    Create a list of Media objects and attach it to a Vision.

    Parameters
    ----------
    vision_id : int
        ID of the vision.
    medias : list
        Array of objects in the form:
            [{"description": "..",
             "type": "..",
             "url": "..",
             "unsplash_image_id": "..",
             "unsplash_creator_name": "..",
             "unsplash_creator_url": ".."}]
        Type should be either "GIF", "VIDEO" or "IMAGE".
        If you do not pass a url, the type is TEXT.
        The order attribute of a Media object is inferred by the position in the medias array.

    Returns
    -------
    vision_medias : list of Media
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


def create_vision(mood_id, medias, user_id, scenario_id):
    """
    Create a Vision object.

    Parameters
    ----------
    mood_id : int
        ID of the mood chosen by the user.
    medias : list
        Array of objects in the form:
            [{"description": "..",
             "type": "..",
             "url": "..",
             "unsplash_image_id": "..",
             "unsplash_creator_name": "..",
             "unsplash_creator_url": ".."}]
        Type should be either "GIF", "VIDEO" or "IMAGE".
        If you do not pass a url, the type is TEXT.
        The order attribute of a Media object is inferred by the position in the medias array.
    user_id : int
        ID of the user creating the vision.
    scenario_id : int
        ID of the scenario relevant to the vision.

    Returns
    -------
    vision : Vision
        The newly created vision object.
    """
    vision = Vision(mood_id=mood_id, user_id=user_id, scenario_id=scenario_id)

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
        ID of the vision.
    mood_id : int
        New ID of the mood assigned to the vision.
    medias : list
        Array of objects in the form:
            [{"description": "..",
             "type": "..",
             "url": "..",
             "unsplash_image_id": "..",
             "unsplash_creator_name": "..",
             "unsplash_creator_url": ".."}]
        If you do not pass a url, the type is TEXT.
        Type should be either "GIF", "VIDEO" or "IMAGE".
        New list of medias assigned to the vision.
        The new list overwrites the old ones.

    Returns
    -------
    vision : Vision
        The updated vision object.
    """
    vision = get_vision_by_id(vision_id)

    if vision is None:
        raise Exception("No vision found in the database to update.")

    if mood_id is not None:
        vision.mood_id = mood_id

    if medias is not None:
        for m in vision.medias:
            db.session.delete(m)
        vision.medias = __create_media_array(vision_id=vision_id, medias=medias)

    db.session.commit()

    return vision


def remove_vision(vision_id):
    """
    Delete a vision.

    Parameters
    ----------
    vision_id : int
        ID of the vision.
    """
    vision = get_vision_by_id(vision_id)

    if vision is None:
        raise Exception("No vision found in the database to delete.")

    # Delete existing medias
    for m in vision.medias:
        db.session.delete(m)

    db.session.delete(vision)
    db.session.commit()


def get_vision_by_id(vision_id):
    """
    Get a vision by its ID.

    Parameters
    ----------
    vision_id : int
        ID of the vision.

    Returns
    -------
    vision : Vision
        The retrieved vision object.
    """
    vision = Vision.query.filter_by(id=vision_id).first()

    return vision


def get_visions_by_scenario(scenario_id, paginate=True, order="desc", page_number=1, page_size=30):
    """
    Get all the vision related to a scenario.

    Parameters
    ----------
    scenario_id : int
        ID of a scenario.
    paginate : bool
        Paginate visions or not.
    order : str
        The method for sorting the visions.
        (method "desc" means sorting the visions by created time in the descending order)
        (method "rand" means sorting the visions randomly)
    page_number : int
        The page number (only works when paginate is True).
    page_size : int
        The page size (only works when paginate is True).

    Returns
    -------
    list of Vision or flask_sqlalchemy.Pagination
        List of vision related to the scenario.
        Or the flask_sqlalchemy.Pagination object.
    """
    # TODO: need to improve the testing case to check pagination
    q = Vision.query.filter_by(scenario_id=scenario_id)

    if order == "desc":
        q = q.order_by(desc(Vision.created_at))
    elif order == "rand":
        q = q.order_by(func.random())

    if paginate == True:
        visions = q.paginate(page_number, page_size, True)
    else:
        visions = q.all()

    return visions


def get_visions_by_user(user_id, paginate=True, order="desc", page_number=1, page_size=30):
    """
    Get all the vision created by a user.

    Parameters
    ----------
    user_id : int
        ID of a user.
    paginate : bool
        Paginate visions or not.
    order : str
        The method for sorting the visions.
        (method "desc" means sorting the visions by created time in the descending order)
        (method "rand" means sorting the visions randomly)
    page_number : int
        The page number (only works when paginate is True).
    page_size : int
        The page size (only works when paginate is True).

    Returns
    -------
    list of Vision or flask_sqlalchemy.Pagination
        List of vision created by the user.
        Or the flask_sqlalchemy.Pagination object.
    """
    # TODO: need to improve the testing case to check pagination
    q = Vision.query.filter_by(user_id=user_id)

    if order == "desc":
        q = q.order_by(desc(Vision.created_at))
    elif order == "rand":
        q = q.order_by(func.random())

    if paginate == True:
        visions = q.paginate(page_number, page_size, True)
    else:
        visions = q.all()

    return visions


def get_all_visions(paginate=True, order="desc", page_number=1, page_size=30):
    """
    Get all visions.

    Parameters
    ----------
    paginate : bool
        Paginate visions or not.
    order : str
        The method for sorting the visions.
        (method "desc" means sorting the visions by created time in the descending order)
        (method "rand" means sorting the visions randomly)
    page_number : int
        The page number (only works when paginate is True).
    page_size : int
        The page size (only works when paginate is True).

    Returns
    -------
    list of Vision or flask_sqlalchemy.Pagination
        The list of retrieved vision objects.
        Or the flask_sqlalchemy.Pagination object.
    """
    # TODO: need a testing case (with and without pagination)
    q = Vision.query

    if order == "desc":
        q = q.order_by(desc(Vision.created_at))
    elif order == "rand":
        q = q.order_by(func.random())

    if paginate == True:
        visions = q.paginate(page_number, page_size, True)
    else:
        visions = q.all()

    return visions
