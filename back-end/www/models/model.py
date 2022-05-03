"""Database model for the application."""

import enum
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from sqlalchemy import MetaData
from sqlalchemy.sql import expression


# Set the naming convention for database columns
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

# Initalize app with database
db = SQLAlchemy(metadata=MetaData(naming_convention=convention))


class User(db.Model):
    """
    Class representing a User.

    Attributes
    ----------
    id : int
        Unique identifier.
    created_at : datetime
        A timestamp indicating when the user is created.
    client_id : str
        A unique identifier provided by a third-party authentication platform.
        The Google Analytics (GA) will provide a client ID.
        If GA fails to give the id, a random string is generated instead.
        If the user signed in with a Google account, the ID will be the Google ID.
    client_type : int
        The user type (0 is the admin, 1 is the normal user, -1 is the banned user)
    answers : relationship
        List of answers provided by scenario and topic related questions.
    """
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, server_default=func.now())
    client_id = db.Column(db.String(255), unique=True, nullable=False)
    client_type = db.Column(db.Integer, nullable=False, server_default="1")
    answers = db.relationship("Answer", backref=db.backref("user", lazy=True), lazy=True)

    def __repr__(self):
        return "<User id=%r created_at=%r client_id=%r client_type=%r>" % (
                self.id, self.created_at, self.client_id, self.client_type)


class Topic(db.Model):
    """
    Class representing the concept of Topic.

    Attributes
    ----------
    id : int
        Unique identifier.
    title : str
        Title of the topic.
    description : str
        Short description of the topic.
    scenarios : relationship
        List of scenarios related to the topic.
    questios : relationship
        List of questions related to the Topic (e.g., demographic).
    """
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)
    scenarios = db.relationship("Scenario", backref=db.backref("topic", lazy=True), lazy=True)
    questions = db.relationship("Question", backref=db.backref("topic", lazy=True), lazy=True)

    def __repr__(self):
        return "<Topic id=%r title='%r'>" % (
                self.id, self.title)


class Scenario(db.Model):
    """
    Class representing the concept of Scenario.

    Attributes
    ----------
    id : int
        Unique identifier.
    title : str
        Title of the scenario.
    description : str
        Short description of the scenario.
    image : str
        A URL to an image describing the scenario.
    mode : int
        The system mode configuration (which affects the interaction type).
        (0 means the normal deployment mode)
        (other numbers mean different experiment modes)
    view : int
        The system view configuration (which affects the roles).
        (0 means the normal deployment view)
        (other numbers mean different experiment views)
    topic_id : int
        The ID of the parent Topic.
    questions : relationship
        List of Questions related to the Topic (e.g., demographic).
    """
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)
    image = db.Column(db.String, nullable=False)
    mode = db.Column(db.Integer, nullable=False, server_default="0")
    view = db.Column(db.Integer, nullable=False, server_default="0")
    topic_id = db.Column(db.Integer, db.ForeignKey("topic.id"))
    questions = db.relationship("Question", backref=db.backref("scenario", lazy=True), lazy=True)

    def __repr__(self):
        return "<Scenario id=%r title='%r' image=%r topic_id=%r>" % (
                self.id, self.title, self.image, self.topic_id)


class QuestionTypeEnum(enum.Enum):
    """Enumeration for the question_type column in the Question table."""
    SINGLE_CHOICE = "Single Choice"
    MULTI_CHOICE = "Multi Choice"
    FREE_TEXT = "Free Text"
    CREATE_VISION = "Create Vision"
    CREATE_MOOD = "Create Mood"


class Question(db.Model):
    """
    Class representing the concept of Question.

    We need both scenario_id and topic_id,
    because the questions with the scenario are the survey,
    and the questions with the topic are the demographics.

    Attributes
    ----------
    id : int
        Unique identifier.
    text : str
        Text of the question.
    question_type : enum.Enum
        Type of the question.
        It can be SINGLE_CHOICE, MULTI_CHOICE or FREE_TEXT.
        NULL means that the question is a description, not a question.
    order : int
        Position of the Question with respect to the others.
    page : int
        The page number for the question.
        (for creating questions on different pages on the front-end side)
        Page -1 means the question will appear on any page.
    shuffle_choices : bool
        Whether we want to randomly shuffle the choices or not.
        (for the front-end to decide how to handle this parameter)
    scenario_id : int
        ID of the Scenario the question belongs to.
        Either the scenario_id or topic_id must be set, not both.
    topic_id : int
        ID of the Scenario the question belongs to.
        Either the scenario_id or topic_id must be set, not both.
    choices : relationship
        List of possible choices (only of SINGLE_CHOICE and MULTI_CHOICE questions).
    answers : relationship
        List of answers to the question.
    """
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String, nullable=False)
    question_type = db.Column(db.Enum(QuestionTypeEnum))
    order = db.Column(db.Integer, nullable=False, server_default="0")
    page = db.Column(db.Integer, nullable=False, server_default="-1")
    shuffle_choices = db.Column(db.Boolean, server_default=expression.false())
    scenario_id = db.Column(db.Integer, db.ForeignKey("scenario.id"))
    topic_id = db.Column(db.Integer, db.ForeignKey("topic.id"))
    choices = db.relationship("Choice", backref=db.backref("question", lazy=True), lazy=True)
    answers = db.relationship("Answer", backref=db.backref("question", lazy=True), lazy=True)

    def __repr__(self):
        return "<Question id=%r text=%r question_type=%r scenario_id=%r topic_id=%r>" % (
                self.id, self.text, self.question_type, self.scenario_id, self.topic_id)


answer_choice_table = db.Table("answers_choice_table", db.Model.metadata,
        db.Column("choice_id", db.Integer, db.ForeignKey("choice.id")),
        db.Column("answer_id", db.Integer, db.ForeignKey("answer.id")))


class Choice(db.Model):
    """
    Class representing the concept of Choice of a Question.

    Attributes
    ----------
    id : int
        Unique identifier.
    text : str
        The label of a choice (e.g., "Strongly Agree" on a likert scale).
    value : int
        The value of a choice (e.g., 1 on a likert scale).
    question_id : int
        ID of the question.
    answers : relationship
        List of answers that chose that choice.
    """
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String, nullable=False)
    value = db.Column(db.Integer, nullable=True)
    question_id = db.Column(db.Integer, db.ForeignKey("question.id"))
    answers = db.relationship("Answer",
            secondary=answer_choice_table, lazy=True, back_populates="choices")

    def __repr__(self):
        return "<Choice id=%r text=%r value=%r question_id=%r>" % (
                self.id, self.text, self.value, self.question_id)


class Answer(db.Model):
    """
    Class representing the concept of Answer to a Question.

    Attributes
    ----------
    id : int
        Unique identifier.
    text : str
        The text of the Answer, only available for FREE_TEXT questions.
    secret : str
        Any secret information related to the answer for admin users.
    created_at : datetime
        Timestamp of when the answer was submitted.
    user_id : int
        ID of the user creating the answer.
    question_id : int
        ID of the question.
    choices : relationship
        The choices a user choose as Answer.
        Only available for SINGLE_CHOICE and MULTI_CHOICE answer.
    """
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String, nullable=True)
    created_at = db.Column(db.DateTime, server_default=func.now())
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    question_id = db.Column(db.Integer, db.ForeignKey("question.id"))
    secret = db.Column(db.String, nullable=True)
    choices = db.relationship("Choice",
            secondary=answer_choice_table, lazy="subquery", back_populates="answers")

    def __repr__(self):
        return "<Answer id=%r text=%r created_at=%r user_id=%r question_id=%r>" % (
                self.id, self.text, self.created_at, self.user_id, self.question_id)


class Vision(db.Model):
    """
    Class representing the concept of Vision of a User about a Scenario.

    Attributes
    ----------
    id : int
        Unique identifier.
    created_at : datetime
        Timestamp of creation.
    scenario_id : int
        ID of the scenario the vision is about.
    user_id : int
        ID of the user creating the vision.
    mood_id : int
        ID of the mood selected by the user to describe the vision.
    medias : relationship
        List of media objects selected by the user to describe the vision.
    """
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, server_default=func.now())
    scenario_id = db.Column(db.Integer, db.ForeignKey("scenario.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    mood_id = db.Column(db.Integer, db.ForeignKey("mood.id"))
    medias = db.relationship("Media", backref=db.backref("vision", lazy=True), lazy=True)

    def __repr__(self):
        return "<Vision id=%r created_at=%r scenario_id=%r user_id=%r mood_id=%r>" % (
                self.id, self.created_at, self.scenario_id, self.user_id, self.mood_id)


class Mood(db.Model):
    """
    Class representing the concept of Mood.

    Attributes
    ----------
    id : int
        Unique identifier.
    name : str
        Name of the mood.
    image : str
        Image URL of the mood.
    order : int
        Position of the Mood with respect to the others.
    """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    image = db.Column(db.String, nullable=True)
    order = db.Column(db.Integer, nullable=False, server_default="0")

    def __repr__(self):
        return "<Mood id=%r name=%r image=%r>" % (
                self.id, self.name, self.image)


class MediaTypeEnum(enum.Enum):
    """Enumeration for the media_type column in the Media table."""
    IMAGE = "Image"
    GIF = "Animated GIF"
    VIDEO = "Video"
    TEXT = "Text"


class Media(db.Model):
    """
    Class representing the concept of Media used in a Vision.

    Attributes
    ----------
    id : int
        Unique identifier.
    url : str
        URL pointing to the Media.
        Will be None in case of TEXT media type.
    unsplash_image_id : str
        The photo ID on the unsplash website
    unsplash_creator_name : str
        Name of the user who uploaded the image on unsplash
    unsplash_creator_url : str
        Url to the profile of the user who uploaded the image to unsplash
    description : str
        Textual descritpion or caption related to the media.
    order : int
        Position of the Media with respect to the others.
    media_type : enum.Enum
        Type of Media, refer to the MediaTypeEnum enumeration.
    vision_id : int
        ID of the vision the media refers to.
    """
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String, nullable=True)
    unsplash_image_id = db.Column(db.String, nullable=True)
    unsplash_creator_name = db.Column(db.String, nullable=True)
    unsplash_creator_url = db.Column(db.String, nullable=True)
    description = db.Column(db.String, nullable=False)
    order = db.Column(db.Integer, nullable=False)
    media_type = db.Column(db.Enum(MediaTypeEnum))
    vision_id = db.Column(db.Integer, db.ForeignKey("vision.id"))

    def __repr__(self):
        return "<Media id=%r url=%r description=%r order=%r media_type=%r vision_id=%r>" % (
                self.id, self.url, self.description, self.order, self.media_type, self.vision_id)


class GameStatusEnum(enum.Enum):
    """Enumeration for the game_status column in the Game table."""
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    ERROR = "Error"


class Game(db.Model):
    """
    Class representing the concept of Game.

    A user try to guess the mood and provide feedback on the vision.

    Attributes
    ----------
    id : int
        Unique identifier.
    start_time : datetime
        Start time of the game session.
    end_time : datetime
        End time of the game session (i.e., when a user submit the guesses).
    status : enum.Enum
        Status of the game session (refer to GameStatusEnum enumeration).
    feedback : str
        Textual feedback submitted by the User, describing the perspective to the vision.
    vision_id : int
        ID of the Vision being looked by the user.
    user_id : int
        ID of the User playing the game.
    guesses : relationship
        List of guesses the user made on the vision.
    """
    id = db.Column(db.Integer, primary_key=True)
    start_time = db.Column(db.DateTime, server_default=func.now())
    end_time = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.Enum(GameStatusEnum))
    feedback = db.Column(db.String, nullable=True)
    vision_id = db.Column(db.Integer, db.ForeignKey("vision.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    guesses = db.relationship("Guess", backref=db.backref("game", lazy=True), lazy=True)

    def __repr__(self):
        return "<Game id=%r start_time=%r end_time=%r status=%r vision_id=%r user_id=%r>" % (
                self.id, self.start_time, self.end_time, self.status, self.vision_id, self.user_id)


class Guess(db.Model):
    """
    Class representing the concept of Guess done by a User in a Game.

    A game can have multiple guesses about the mood.
    In this case, multiple rows will be added for a game.

    Attributes
    ----------
    id : int
        Unique identifier.
    game_id : int
        ID of the game session.
    mood_id : int
        ID of the mood choosen by the user.
    """
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey("game.id"))
    mood_id = db.Column(db.Integer, db.ForeignKey("mood.id"))

    def __repr__(self):
        return "<Guess id=%r game_id=%r mood_id=%r>" % (
                self.id, self.game_id, self.mood_id)
