from basic_tests import BasicTest
from models.model_operations import scenario_operations
from models.model_operations import topic_operations
from models.model_operations import question_operations
from models.model_operations import answer_operations
from models.model_operations import user_operations
from models.model import db
import unittest


class AnswerTest(BasicTest):
    """Test case for answers."""
    def setUp(self):
        db.create_all()

        self.topic = topic_operations.create_topic("test", "test")
        self.scenario_1 = scenario_operations.create_scenario("t1", "d1", "i1", self.topic.id)
        self.scenario_2 = scenario_operations.create_scenario("t2", "d2", "i2", self.topic.id)

        self.free_question = question_operations.create_free_text_question(
            "text", self.topic.id)

        multi_choices = [{
            "text":"a",
            "value":1
        },{
            "text":"b",
            "value":2
        },{
            "text":"c",
            "value":3
        }]

        self.choice_question = question_operations.create_multi_choice_question(
            "text", choices=multi_choices, scenario_id=self.scenario_1.id)

        single_choices = [{
            "text":"d",
            "value":1
        },{
            "text":"e",
            "value":2
        }]

        self.single_choice_question = question_operations.create_single_choice_question(
            "test", choices=single_choices, scenario_id=self.scenario_2.id)

        self.user_1 = user_operations.create_user("user1")
        self.user_2 = user_operations.create_user("user2")

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def test_create_free_text_answer(self):
        question_id = self.free_question.id
        user_id = self.user_1.id

        text = "answer text"

        answer = answer_operations.create_free_text_answer(
            text, user_id=user_id, question_id=question_id)

        assert answer in db.session

        with self.assertRaises(Exception):
            answer_operations.create_free_text_answer(
                text, user_id=user_id, question_id=self.choice_question.id)

    def test_create_choice_answer(self):
        question_id = self.choice_question.id
        user_id = self.user_1.id

        choice = self.choice_question.choices[0].id

        answer = answer_operations.create_choice_answer(
            choices=choice, user_id=user_id, question_id=question_id)

        assert answer in db.session

        with self.assertRaises(Exception):
            answer_operations.create_choice_answer(
                choices=choice, user_id=user_id, question_id=self.free_question.id)

        choices = [x.id for x in self.single_choice_question.choices]

        with self.assertRaises(Exception):
            answer_operations.create_choice_answer(
                choices=choices, user_id=user_id, question_id=self.single_choice_question.id)

    def test_get_answer_by_user(self):
        question_id = self.choice_question.id
        user_id = self.user_1.id

        choice = self.choice_question.choices[0].id

        answer_1 = answer_operations.create_choice_answer(
            choices=choice, user_id=user_id, question_id=question_id)

        question_id = self.free_question.id
        text = "answer text"

        answer_2 = answer_operations.create_free_text_answer(
            text, user_id=user_id, question_id=question_id)

        answers = answer_operations.get_answers_by_user(user_id)

        user_id = self.user_2.id

        other_answer = answer_operations.create_free_text_answer(
            text, user_id=user_id, question_id=question_id)

        assert len(answers) == 2
        assert answers[0].choices == answer_1.choices and answers[0].question_id == answer_1.question_id
        assert answers[1].text == answer_2.text and answers[1].question_id == answer_2.question_id

    def test_get_answers_by_question(self):
        question_id = self.free_question.id
        user_id = self.user_1.id
        text = "answer text 1"

        answer_1 = answer_operations.create_free_text_answer(
            text=text, user_id=user_id, question_id=question_id)

        question_id = self.free_question.id
        text = "answer text 2"
        user_id = self.user_2.id

        answer_2 = answer_operations.create_free_text_answer(
            text, user_id=user_id, question_id=question_id)

        other_question_id = self.choice_question.id
        choice = self.choice_question.choices[0].id

        other_answer = answer_operations.create_choice_answer(
            choices=choice, user_id=user_id, question_id=other_question_id)

        answers = answer_operations.get_answers_by_question(question_id)

        assert len(answers) == 2
        assert answers[0].text == answer_1.text and answers[0].user_id == answer_1.user_id
        assert answers[1].text == answer_2.text and answers[1].user_id == answer_2.user_id

    def test_get_answers_by_scenario(self):
        question_id = self.choice_question.id
        user_id = self.user_1.id

        choice = self.choice_question.choices[0].id

        answer_1 = answer_operations.create_choice_answer(
            choices=choice, user_id=user_id, question_id=question_id)

        question_id = self.free_question.id
        text = "answer text"

        answer_2 = answer_operations.create_free_text_answer(
            text, user_id=user_id, question_id=question_id)

        scenario_id = self.scenario_1.id
        answers = answer_operations.get_answers_by_scenario(
            scenario_id=scenario_id)

        assert len(answers) == 1
        assert answers[0].choices == answer_1.choices and answers[0].user_id == answer_1.user_id

    def test_get_answers_by_topic(self):
        question_id = self.choice_question.id
        user_id = self.user_1.id

        choice = self.choice_question.choices[0].id

        answer_1 = answer_operations.create_choice_answer(
            choices=choice, user_id=user_id, question_id=question_id)

        question_id = self.free_question.id
        text = "answer text"

        answer_2 = answer_operations.create_free_text_answer(
            text, user_id=user_id, question_id=question_id)

        topic_id = self.topic.id
        answers = answer_operations.get_answers_by_topic(topic_id=topic_id)

        assert len(answers) == 1
        assert answers[0].text == answer_2.text and answers[0].user_id == answer_2.user_id

    def test_remove_answer(self):
        question_id = self.choice_question.id
        user_id = self.user_1.id

        choice = self.choice_question.choices[0].id

        answer_1 = answer_operations.create_choice_answer(
            choices=choice, user_id=user_id, question_id=question_id)

        assert answer_1 in db.session

        answer_operations.remove_answer(answer_1.id)

        assert answer_1 not in db.session


if __name__ == "__main__":
    unittest.main()
