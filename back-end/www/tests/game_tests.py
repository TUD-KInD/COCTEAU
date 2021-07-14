from basic_tests import BasicTest
from models.model_operations import scenario_operations
from models.model_operations import topic_operations
from models.model_operations import user_operations
from models.model_operations import vision_operations
from models.model_operations import game_operations
from models.model import db, GameStatusEnum
import datetime
import unittest


class GameTest(BasicTest):
    """Test case for games."""
    def setUp(self):
        db.create_all()

        self.topic = topic_operations.create_topic("test", "test")
        self.scenario_1 = scenario_operations.create_scenario(
            "t1", "d1", "i1", self.topic.id)
        self.scenario_2 = scenario_operations.create_scenario(
            "t2", "d2", "i2", self.topic.id)

        self.mood_1 = vision_operations.create_mood("happy")
        self.mood_2 = vision_operations.create_mood("happy")
        self.user_1 = user_operations.create_user("user1")
        self.user_2 = user_operations.create_user("user2")

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
                "type": "IMAGE",
                "unsplash_image_id": "a40akJxBhT8wP3X",
                "unsplash_creator_name": "Apple Banana",
                "unsplash_creator_url": "https://unsplash.com/@apple_banana"
            },
            {
                "description": "description",
                "type": "TEXT"
            }
        ]

        mood_id = self.mood_1.id
        user_id = self.user_1.id
        scenario_id = self.scenario_1.id

        self.vision = vision_operations.create_vision(
            mood_id=mood_id, medias=medias, user_id=user_id, scenario_id=scenario_id)

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def test_create_game(self):
        user_id = self.user_2.id
        vision_id = self.vision.id

        game = game_operations.create_game(
            user_id=user_id, vision_id=vision_id)

        assert game in db.session
        assert game.status == GameStatusEnum.IN_PROGRESS

        fake_time = datetime.datetime(2020, 5, 17)

        game = game_operations.create_game(
            user_id=user_id, vision_id=vision_id, start_time=fake_time)

        assert game in db.session
        assert game.status == GameStatusEnum.IN_PROGRESS
        assert game.start_time == fake_time

    def test_submit_game(self):
        user_id = self.user_2.id
        vision_id = self.vision.id

        feedback = "cool story bro"

        game = game_operations.create_game(
            user_id=user_id, vision_id=vision_id)

        game_operations.submit_game(game_id=game.id, user_id=user_id, moods=[
                                    self.mood_1.id, self.mood_2.id], feedback=feedback)

        assert game.status == GameStatusEnum.COMPLETED
        assert len(
            game.guesses) == 2 and game.guesses[0].mood_id == self.mood_1.id and game.guesses[1].mood_id == self.mood_2.id and game.feedback == feedback

        game = game_operations.create_game(
            user_id=user_id, vision_id=vision_id)
        fake_time = datetime.datetime.now()

        game_operations.submit_game(game_id=game.id, user_id=user_id, moods=[
                                    self.mood_1.id, self.mood_2.id], end_time=fake_time, feedback=feedback)

        assert game.status == GameStatusEnum.COMPLETED
        assert game.end_time == fake_time
        assert len(
            game.guesses) == 2 and game.guesses[0].mood_id == self.mood_1.id and game.guesses[1].mood_id == self.mood_2.id and game.feedback == feedback

        with self.assertRaises(Exception):
            game = game_operations.create_game(
                user_id=user_id, vision_id=vision_id)
            fake_id = 222
            game_operations.submit_game(game_id=game.id, user_id=fake_id, moods=[
                                        self.mood_1.id, self.mood_2.id])

        with self.assertRaises(Exception):
            game = game_operations.create_game(
                user_id=user_id, vision_id=vision_id)
            game_operations.submit_game(game_id=game.id, user_id=user_id, moods=[
                                        self.mood_1.id, self.mood_2.id])
            game_operations.submit_game(game_id=game.id, user_id=user_id, moods=[
                                        self.mood_1.id, self.mood_2.id])

        with self.assertRaises(Exception):
            game = game_operations.create_game(
                user_id=user_id, vision_id=vision_id)
            fake_time = datetime.datetime(2020, 5, 17)
            game_operations.submit_game(game_id=game.id, user_id=fake_id, moods=[
                                        self.mood_1.id, self.mood_2.id], end_time=fake_time)

    def test_set_error(self):
        user_id = self.user_2.id
        vision_id = self.vision.id

        game = game_operations.create_game(
            user_id=user_id, vision_id=vision_id)

        game_operations.set_as_error(game_id=game.id)

        assert game.status == GameStatusEnum.ERROR

    def test_get_game_by_id(self):
        user_id = self.user_2.id
        vision_id = self.vision.id

        feedback = "cool story bro"
        game = game_operations.create_game(
            user_id=user_id, vision_id=vision_id)
        game_operations.submit_game(game_id=game.id, user_id=user_id, moods=[
                                    self.mood_1.id, self.mood_2.id], feedback=feedback)

        retrieved_game = game_operations.get_game_by_id(game.id)

        assert retrieved_game == game

    def test_get_game_by_user(self):
        user_id = self.user_2.id
        vision_id = self.vision.id

        feedback = "cool story bro"

        game_1 = game_operations.create_game(
            user_id=user_id, vision_id=vision_id)
        game_operations.submit_game(game_id=game_1.id, user_id=user_id, moods=[
                                    self.mood_1.id, self.mood_2.id], feedback=feedback)

        game_2 = game_operations.create_game(
            user_id=user_id, vision_id=vision_id)

        retrieved_games = game_operations.get_game_by_user(user_id)

        assert len(retrieved_games) == 2
        assert retrieved_games[0] == game_1
        assert retrieved_games[1] == game_2

    def test_get_game_by_vision(self):
        user_id = self.user_2.id
        vision_id = self.vision.id

        feedback = "cool story bro"

        game_1 = game_operations.create_game(
            user_id=user_id, vision_id=vision_id)
        game_operations.submit_game(game_id=game_1.id, user_id=user_id, moods=[
                                    self.mood_1.id, self.mood_2.id], feedback=feedback)

        game_2 = game_operations.create_game(
            user_id=user_id, vision_id=vision_id)

        retrieved_games = game_operations.get_game_by_vision(vision_id)

        assert len(retrieved_games) == 2
        assert retrieved_games[0] == game_1
        assert retrieved_games[1] == game_2


if __name__ == "__main__":
    unittest.main()
