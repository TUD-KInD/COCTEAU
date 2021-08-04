from basic_tests import BasicTest
from models.model_operations import scenario_operations
from models.model_operations import topic_operations
from models.model import db
import unittest


class ScenarioTest(BasicTest):
    """Test case for scenatios."""
    def setUp(self):
        db.create_all()
        self.topic = topic_operations.create_topic("test", "test")

    def test_create_scenario(self):
        title = "this is a scenario title"
        description = "this is a scenario description"
        image = "this is a scenario image"
        topic_id = self.topic.id
        scenario = scenario_operations.create_scenario(
            title=title, description=description, image=image, topic_id=topic_id)

        assert scenario in db.session

    def test_get_scenario_by_id(self):
        title = "this is a scenario title"
        description = "this is a scenario description"
        image = "this is a scenario image"
        topic_id = self.topic.id

        scenario = scenario_operations.create_scenario(
            title=title, description=description, image=image, topic_id=topic_id)

        scenario_id = scenario.id

        retrieved_scenario = scenario_operations.get_scenario_by_id(
            scenario_id)

        assert retrieved_scenario.title == title and retrieved_scenario.description == description and retrieved_scenario.image == image

    def test_get_scenarios_by_topic(self):
        title = "t1"
        description = "d1"
        image = "i1"
        topic_id = self.topic.id

        scenario_1 = scenario_operations.create_scenario(
            title=title, description=description, image=image, topic_id=topic_id)

        title = "t2"
        description = "d2"
        image = "i2"

        scenario_2 = scenario_operations.create_scenario(
            title=title, description=description, image=image, topic_id=topic_id)

        retrieved_scenarios = scenario_operations.get_scenarios_by_topic(topic_id)

        assert len(retrieved_scenarios) == 2
        assert retrieved_scenarios[0].title == scenario_1.title and retrieved_scenarios[
            0].description == scenario_1.description and retrieved_scenarios[0].image == scenario_1.image
        assert retrieved_scenarios[1].title == scenario_2.title and retrieved_scenarios[
            1].description == scenario_2.description and retrieved_scenarios[1].image == scenario_2.image

    def test_update_scenario(self):
        title = "this is a scenario title"
        description = "this is a scenario description"
        image = "this is an image"

        topic_id = self.topic.id

        scenario = scenario_operations.create_scenario(
            title=title, description=description, image=image, topic_id=topic_id)

        scenario_id = scenario.id

        new_title = "new title"
        new_description = "new description"
        new_image = "new_image"

        scenario_operations.update_scenario(
            title=new_title, scenario_id=scenario_id)
        retrieved_scenario = scenario_operations.get_scenario_by_id(
            scenario_id)

        assert retrieved_scenario.title == new_title

        scenario_operations.update_scenario(
            description=new_description, scenario_id=scenario_id)
        retrieved_scenario = scenario_operations.get_scenario_by_id(
            scenario_id)

        assert retrieved_scenario.description == new_description

        scenario_operations.update_scenario(
            image=new_image, scenario_id=scenario_id)
        retrieved_scenario = scenario_operations.get_scenario_by_id(
            scenario_id)

        assert retrieved_scenario.image == new_image

    def test_remove_scenario(self):
        title = "this is a scenario title"
        description = "this is a scenario description"
        image = "this is an image"

        topic_id = self.topic.id

        scenario = scenario_operations.create_scenario(
            title=title, description=description, image=image, topic_id=topic_id)

        assert scenario in db.session

        scenario_id = scenario.id

        scenario_operations.remove_scenario(scenario_id)

        assert scenario not in db.session

    def test_topic_deletion_cascade(self):
        title = "t1"
        description = "d1"
        image = "i1"
        topic_id = self.topic.id

        scenario_1 = scenario_operations.create_scenario(
            title=title, description=description, image=image, topic_id=topic_id)

        title = "t2"
        description = "d2"
        image = "i2"

        scenario_2 = scenario_operations.create_scenario(
            title=title, description=description, image=image, topic_id=topic_id)

        topic_operations.remove_topic(topic_id)

        assert self.topic not in db.session


if __name__ == "__main__":
    unittest.main()
