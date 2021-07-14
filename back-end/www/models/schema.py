"""Schema for object serialization and deserialization."""

from flask_marshmallow import Marshmallow
from models.model import Topic
from models.model import Scenario


# Use Marshmallow to simplify object–relational mapping
ma = Marshmallow()


class TopicSchema(ma.Schema):
    """
    The schema for the Topic table, used for jsonify.
    """
    class Meta:
        model = Topic # the class for the model
        fields = ("id", "title", "description") # fields to expose
topic_schema = TopicSchema()
topics_schema = TopicSchema(many=True)


class ScenarioSchema(ma.Schema):
    """
    The schema for the Scenario table, used for jsonify.
    """
    class Meta:
        model = Scenario # the class for the model
        fields = ("id", "title", "description", "image", "topic_id") # fields to expose
scenario_schema = ScenarioSchema()
scenarios_schema = ScenarioSchema(many=True)
