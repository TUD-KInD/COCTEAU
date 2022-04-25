"""Functions to operate the game table."""

import datetime
from sqlalchemy import func
from sqlalchemy.orm import load_only
from models.model import db
from models.model import Game
from models.model import GameStatusEnum
from models.model import Guess
from models.model import Vision


def create_random_game(user_id, scenario_id=None):
    """
    Create a random game and return Game session.

    The vision in the returned game cannot be created by the same user.
    The vision in the returned game cannot be played by the user before.

    Parameters
    ----------
    user_id : int
        ID of the user playing the game.
    scenario_id : int
        ID of the scenario that we want to search the vision for the game.

    Returns
    -------
    game : Game
        The created game object or None.
    """
    # Get the list of vision IDs that the user played before
    excluded_g = Game.query.filter(Game.user_id==user_id).filter(Game.status==GameStatusEnum.COMPLETED)
    excluded_v = [g.vision_id for g in excluded_g.distinct(Game.vision_id).all()]

    # Exclude the visions that are created by the same user or played by the user
    q = Vision.query.filter(Vision.user_id!=user_id).filter(Vision.id.not_in(excluded_v))
    if scenario_id is not None:
        q = q.filter(Vision.scenario_id==scenario_id)

    # Randomly choose a vision
    vision = q.order_by(func.random()).first()

    if vision is None:
        game = None
    else:
        game = create_game(user_id, vision.id, start_time=datetime.datetime.now())

    return game


def create_game(user_id, vision_id, start_time=None):
    """
    Create and return Game session.

    Parameters
    ----------
    user_id : int
        ID of the user playing the game.
    vision_id : int
        ID of the vision being guessed.
    star_time : datetime
        When the game started.

    Returns
    -------
    game : Game
        The created game object.
    """
    game = Game(user_id=user_id, vision_id=vision_id,
            start_time=start_time, status=GameStatusEnum.IN_PROGRESS)

    db.session.add(game)
    db.session.commit()

    return game


def submit_game(game_id, user_id, feedback, moods, end_time=None):
    """
    Submit the answer to a Game, guess about the moods, and provide textual feedback.

    The status of the game passes from IN_PROGRESS to COMPLETED.

    Parameters
    ----------
    game_id : int
        ID of the game being submitted.
    user_id : int
        ID of the user playing (for double checking).
    feedback : str
        Textual feedback.
    moods : list of int
        A list of mood *id* choosen by the user.
    end_time : datetime
        Timestamp when the game ended.

    Returns
    -------
    game : Game
        The submitted game object.

    Raises
    ------
    exception : Exception
        In case no game is found.
    exception : Exception
        In case the status of the game is not IN_PROGRESS.
    exception : Exception
        In case the submitted end_time is before the game start_time.
    exception : Exception
        In case moods is not a list.
    """
    game = Game.query.filter_by(user_id=user_id, id=game_id).first()

    if game is None:
        raise Exception("No game (created by the user) found in the database to submit.")

    # If the Game is already completed or if it is in an error status, raise an exception
    if game.status != GameStatusEnum.IN_PROGRESS:
        raise Exception("Game session is already closed.")

    if type(moods) != list:
        raise Exception("Moods need to be a list.")

    guesses = []

    # Create Guess object from the mood id
    for m in moods:
        g = Guess(game_id=game_id, mood_id=m)
        db.session.add(g)
        guesses.append(g)

    game.guesses = guesses
    game.feedback = feedback
    game.status = GameStatusEnum.COMPLETED

    if end_time is None:
        game.end_time = datetime.datetime.now()
    else:
        # If the provided end time comes before the start time, raise an exception
        if end_time < game.start_time:
            db.session.rollback()
            raise Exception("The end time must come after the start time.")
        game.end_time = end_time

    db.session.commit()

    return game


def set_as_error(game_id):
    """
    Set a game in the Error state.

    Parameters
    ----------
    game_id : int
        ID of the game.

    Raises
    ------
    exception : Exception
        In case no Game is found.
    """
    game = get_game_by_id(game_id)

    if game is None:
        raise Exception("No game found in the database to set to error.")

    game.status = GameStatusEnum.ERROR

    db.session.commit()


def get_game_by_id(game_id):
    """
    Retrieve a Game from its ID.

    Parameters
    ----------
    game_id : int
        ID of the game.

    Returns
    -------
    game : Game
        The retireved game object.
    """
    game = Game.query.filter_by(id=game_id).first()

    return game


def get_games_by_user(user_id):
    """
    Retrieve all the games played by a user.

    Parameters
    ----------
    user_id : int
        ID of the user.

    Returns
    -------
    games : list of Game
        The retireved game objects.
    """
    games = Game.query.filter_by(user_id=user_id).all()

    return games


def get_games_by_vision(vision_id):
    """
    Retrieve all the games pertaining a specific Vision.

    Parameters
    ----------
    vision_id : int
        ID of the Vision.

    Returns
    -------
    games : list of Game
        The retireved game objects.
    """
    games = Game.query.filter_by(vision_id=vision_id).all()

    return games


def get_all_games():
    """
    Get all games.

    Returns
    -------
    games : list of Game
        The retrieved game objects.
    """
    # TODO: need a testing case
    games = Game.query.all()

    return games


def remove_game(game_id):
    """
    Remove a game.

    Parameters
    ----------
    game_id : int
        ID of the game.

    Raises
    ------
    exception : Exception
        In case that no game is found.
    """
    # TODO: need a testing case
    game = get_game_by_id(game_id)

    if game is None:
        raise Exception("No game found in the database to delete.")

    # Delete existing guesses
    for g in game.guesses:
        db.session.delete(g)

    db.session.delete(game)
    db.session.commit()
