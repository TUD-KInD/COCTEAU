from basic_tests import BasicTest
from models.model_operations import topic_operations
from models.model import db
import unittest


class TopicTest(BasicTest):
    """Test case for topics."""
    def setUp(self):
        db.create_all()

    def test_create_topic(self):
        title = "this is a topic title"
        description = "this is a topic description"

        topic = topic_operations.create_topic(
            title=title, description=description)

        assert topic in db.session

    def test_get_topic(self):
        title = "this is a topic title"
        description = "this is a topic description"

        topic = topic_operations.create_topic(
            title=title, description=description)

        topic_id = topic.id

        retrieved_topic = topic_operations.get_topic_by_id(topic_id)

        assert retrieved_topic.title == title and retrieved_topic.description == description

    def test_update_topic(self):
        title = "this is a topic title"
        description = "this is a topic description"

        topic = topic_operations.create_topic(
            title=title, description=description)

        topic_id = topic.id

        new_title = "new title"
        new_description = "new description"

        topic_operations.update_topic(title=new_title, topic_id=topic_id)
        retrieved_topic = topic_operations.get_topic_by_id(topic_id)

        assert retrieved_topic.title == new_title

        topic_operations.update_topic(
            description=new_description, topic_id=topic_id)
        retrieved_topic = topic_operations.get_topic_by_id(topic_id)

        assert retrieved_topic.description == new_description

    def test_remove_topic(self):
        title = "this is a topic title"
        description = "this is a topic description"

        topic = topic_operations.create_topic(
            title=title, description=description)

        assert topic in db.session

        topic_id = topic.id

        topic_operations.remove_topic(topic_id)

        assert topic not in db.session


if __name__ == "__main__":
    unittest.main()
