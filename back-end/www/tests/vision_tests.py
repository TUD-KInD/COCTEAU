from basic_tests import BasicTest
from models.model_operations import scenario_operations
from models.model_operations import topic_operations
from models.model_operations import user_operations
from models.model_operations import vision_operations
from models.model import db
import unittest


class VisionTest(BasicTest):
    """Test case for visions."""
    def setUp(self):
        db.create_all()

        self.topic = topic_operations.create_topic("test", "test")
        self.scenario_1 = scenario_operations.create_scenario(
            "t1", "d1", "i1", self.topic.id)
        self.scenario_2 = scenario_operations.create_scenario(
            "t2", "d2", "i2", self.topic.id)

        self.mood = vision_operations.create_mood("happy")
        self.user_1 = user_operations.create_user("user1")
        self.user_2 = user_operations.create_user("user2")

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def test_get_moods(self):
        moods = vision_operations.get_moods()

        assert len(moods) == 1
        assert moods[0].name == "happy"

    def test_create_vision(self):
        medias = [
            {
                "url": "http://url_to_image.com",
                "description": "description",
                "type": "VIDEO"
            },
            {
                "url": "http://url_to_image.com",
                "description": "description",
                "type": "GIF"
            },
            {
                "url": "http://url_to_image.com",
                "description": "description",
                "unsplash_image_id":"uid",
                "unsplash_creator_name":"name",
                "unsplash_creator_url":"url",
                "type": "IMAGE"
            },
            {
                "description": "description",
                "type": "TEXT"
            }
        ]

        mood_id = self.mood.id
        user_id = self.user_1.id
        scenario_id = self.scenario_1.id

        vision = vision_operations.create_vision(
            mood_id=mood_id, medias=medias, user_id=user_id, scenario_id=scenario_id)

        assert vision in db.session

        for m in vision.medias:
            assert m in db.session

    def test_get_vision_by_id(self):
        medias = [
            {
                "url": "http://url_to_image.com",
                "description": "description",
                "type": "VIDEO"
            },
            {
                "url": "http://url_to_image.com",
                "description": "description",
                "type": "GIF"
            },
            {
                "url": "http://url_to_image.com",
                "description": "description",
                "unsplash_image_id":"uid",
                "unsplash_creator_name":"name",
                "unsplash_creator_url":"url",
                "type": "IMAGE"
            },
            {
                "description": "description",
                "type": "TEXT"
            }
        ]

        mood_id = self.mood.id
        user_id = self.user_1.id
        scenario_id = self.scenario_1.id

        vision = vision_operations.create_vision(
            mood_id=mood_id, medias=medias, user_id=user_id, scenario_id=scenario_id)

        retrieved_vision = vision_operations.get_vision_by_id(vision.id)

        assert retrieved_vision.mood_id == mood_id and retrieved_vision.user_id == user_id and retrieved_vision.scenario_id == scenario_id
        assert vision.medias == retrieved_vision.medias

    def test_get_vision_by_user_id(self):
        medias = [
            {
                "url": "http://url_to_image.com",
                "description": "description",
                "type": "VIDEO"
            },
            {
                "url": "http://url_to_image.com",
                "description": "description",
                "type": "GIF"
            },
            {
                "url": "http://url_to_image.com",
                "description": "description",
                "unsplash_image_id":"uid",
                "unsplash_creator_name":"name",
                "unsplash_creator_url":"url",
                "type": "IMAGE"
            },
            {
                "description": "description",
                "type": "TEXT"
            }
        ]

        mood_id = self.mood.id
        user_id = self.user_1.id
        scenario_id = self.scenario_1.id

        vision_1 = vision_operations.create_vision(
            mood_id=mood_id, medias=medias, user_id=user_id, scenario_id=scenario_id)
        vision_2 = vision_operations.create_vision(
            mood_id=mood_id, medias=medias[:-1], user_id=user_id, scenario_id=scenario_id)

        user_id_2 = self.user_2.id

        vision_3 = vision_operations.create_vision(
            mood_id=mood_id, medias=medias, user_id=user_id_2, scenario_id=scenario_id)

        retrieved_visions = vision_operations.get_visions_by_user(user_id)

        assert len(retrieved_visions) == 2
        assert retrieved_visions[0]. medias == vision_1.medias and retrieved_visions[
            0].mood_id == vision_1.mood_id and retrieved_visions[0].scenario_id == vision_1.scenario_id
        assert retrieved_visions[1]. medias == vision_2.medias and retrieved_visions[
            1].mood_id == vision_2.mood_id and retrieved_visions[1].scenario_id == vision_2.scenario_id

    def test_get_visions_by_scenario(self):
        medias = [
            {
                "url": "http://url_to_image.com",
                "description": "description",
                "type": "VIDEO"
            },
            {
                "url": "http://url_to_image.com",
                "description": "description",
                "type": "GIF"
            },
            {
                "url": "http://url_to_image.com",
                "description": "description",
                "unsplash_image_id":"uid",
                "unsplash_creator_name":"name",
                "unsplash_creator_url":"url",
                "type": "IMAGE"
            },
            {
                "description": "description",
                "type": "TEXT"
            }
        ]

        mood_id = self.mood.id
        user_id = self.user_1.id
        scenario_id = self.scenario_1.id

        vision_1 = vision_operations.create_vision(
            mood_id=mood_id, medias=medias, user_id=user_id, scenario_id=scenario_id)
        vision_2 = vision_operations.create_vision(
            mood_id=mood_id, medias=medias[:-1], user_id=user_id, scenario_id=scenario_id)

        scenario_id_2 = self.scenario_2.id

        vision_3 = vision_operations.create_vision(
            mood_id=mood_id, medias=medias, user_id=user_id, scenario_id=scenario_id_2)

        retrieved_visions = vision_operations.get_visions_by_scenario(user_id)

        assert len(retrieved_visions) == 2
        assert retrieved_visions[0]. medias == vision_1.medias and retrieved_visions[
            0].mood_id == vision_1.mood_id and retrieved_visions[0].scenario_id == vision_1.scenario_id
        assert retrieved_visions[1]. medias == vision_2.medias and retrieved_visions[
            1].mood_id == vision_2.mood_id and retrieved_visions[1].scenario_id == vision_2.scenario_id

    def test_update_vision(self):
        medias = [
            {
                "url": "http://url_to_image.com",
                "description": "description",
                "type": "VIDEO"
            },
            {
                "url": "http://url_to_image.com",
                "description": "description",
                "type": "GIF"
            },
            {
                "url": "http://url_to_image.com",
                "description": "description",
                "unsplash_image_id":"uid",
                "unsplash_creator_name":"name",
                "unsplash_creator_url":"url",
                "type": "IMAGE"
            },
            {
                "description": "description",
                "type": "TEXT"
            }
        ]

        mood_id = self.mood.id
        user_id = self.user_1.id
        scenario_id = self.scenario_1.id

        vision = vision_operations.create_vision(
            mood_id=mood_id, medias=medias, user_id=user_id, scenario_id=scenario_id)

        new_mood = vision_operations.create_mood("sad")

        vision_operations.update_vision(vision.id, mood_id=new_mood.id)
        retrieved_vision = vision_operations.get_vision_by_id(vision.id)

        assert retrieved_vision.mood_id == new_mood.id

        old_medias = vision.medias

        new_medias = [
            {
                "url": "http://url_to_image.com_q",
                "description": "description_q",
                "unsplash_image_id":"uid_q",
                "unsplash_creator_name":"name_q",
                "unsplash_creator_url":"url_q",
                "type": "IMAGE"
            }
        ]

        vision_operations.update_vision(vision.id, medias=new_medias)
        retrieved_vision = vision_operations.get_vision_by_id(vision.id)

        assert len(retrieved_vision.medias) == 1 and retrieved_vision.medias[0].url == new_medias[0]["url"]
        assert retrieved_vision.medias[0].description == new_medias[0]["description"]
        assert retrieved_vision.medias[0].media_type.name == new_medias[0]["type"]

        for m in old_medias:
            assert m not in db.session

    def test_remove_vision(self):
        medias = [
            {
                "url": "http://url_to_image.com",
                "description": "description",
                "type": "VIDEO"
            },
            {
                "url": "http://url_to_image.com",
                "description": "description",
                "type": "GIF"
            },
            {
                "url": "http://url_to_image.com",
                "description": "description",
                "unsplash_image_id":"uid",
                "unsplash_creator_name":"name",
                "unsplash_creator_url":"url",
                "type": "IMAGE"
            },
            {
                "description": "description",
                "type": "TEXT"
            }
        ]

        mood_id = self.mood.id
        user_id = self.user_1.id
        scenario_id = self.scenario_1.id

        vision = vision_operations.create_vision(
            mood_id=mood_id, medias=medias, user_id=user_id, scenario_id=scenario_id)

        assert vision in db.session

        vision_operations.remove_vision(vision.id)

        assert vision not in db.session


if __name__ == "__main__":
    unittest.main()
