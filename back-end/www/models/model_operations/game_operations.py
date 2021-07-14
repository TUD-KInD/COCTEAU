"""Functions to operate the game table."""

import datetime
from models.model import db
from models.model import Game
from models.model import GameStatusEnum
from models.model import Guess


def create_game(user_id, vision_id, start_time=None):
    """
    Create and return Game session.

    Parameters
    ----------
    user_id : int
        Id of the user playing the game.
    vision_id : int
        Od of the vision being guessed.
    star_time (optional) : datetime
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
    Submit the answer to a Game, guess about the moods and textual feedback.

    The status of the game passes from IN_PROGRESS to COMPLETED.

    Parameters
    ----------
    game_id : int
        Id of the game being submitted.
    user_id : int
        Id of the user playing (for double checking).
    feedback : str
        Textual feedback.
    moods : list
        A list of mood *id* choosen by the user.
    end_time (optional) : datetime
        Timestamp when the game ended.

    Raises
    ------
    exception : Exception
        In case no game is found.
    exception : Exception
        In case the status of the game is not IN_PROGRESS.
    exception : Exception
        In case the submitted end_time is before the game start_time.
    """
    game = Game.query.filter_by(user_id=user_id, id=game_id).first()

    if game is None:
        raise Exception("Game not found")

    # If the Game is already completed or if it's in an error status, raise an exception
    if game.status != GameStatusEnum.IN_PROGRESS:
        raise Exception("Game session already closed")

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
            raise Exception("The end time must come after the start time")

        game.end_time = end_time

    db.session.commit()


def set_as_error(game_id):
    """
    Set a game in the Error state.

    Parameters
    ----------
    game_id : int
        Id of the game.

    Raises
    ------
    exception : Exception
        In case no Game is found.
    """
    game = Game.query.filter_by(id=game_id).first()

    if game is None:
        raise Exception("Game not found")

    game.status = GameStatusEnum.ERROR

    db.session.commit()


def get_game_by_id(game_id):
    """
    Retrieve a Game from its id.

    Parameters
    ----------
    game_id : int
        Id of the game.

    Returns
    -------
    game : Game
        The retireved game object.
    """
    game = Game.query.filter_by(id=game_id).first()

    return game


def get_game_by_user(user_id):
    """
    Retrieve all the games played by a user.

    Parameters
    ----------
    user_id : int
        Id of the user.
    """
    games = Game.query.filter_by(user_id=user_id)

    return list(games)


def get_game_by_vision(vision_id):
    """
    Retrieve all the games pertaining a specific Vision.

    Parameters
    ----------
    vision_id : int
        Id of the Vision.
    """
    games = Game.query.filter_by(vision_id=vision_id)

    return list(games)
