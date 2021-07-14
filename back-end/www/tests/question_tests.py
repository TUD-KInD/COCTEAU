from basic_tests import BasicTest
from models.model_operations import scenario_operations
from models.model_operations import topic_operations
from models.model_operations import question_operations
from models.model import db
import unittest


class QuestionTest(BasicTest):
    """Test case for questions."""
    def setUp(self):
        db.create_all()

        self.topic = topic_operations.create_topic("test", "test")
        self.scenario = scenario_operations.create_scenario(
            "test", "test", "test", self.topic.id)

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def test_create_free_text_question(self):
        text = "question"
        topic_id = self.topic.id
        scenario_id = self.scenario.id

        question = question_operations.create_free_text_question(
            text=text, scenario_id=scenario_id)

        assert question in db.session

        question_1 = question_operations.create_free_text_question(
            text=text, topic_id=topic_id)

        assert question_1 in db.session

        with self.assertRaises(Exception):
            question_operations.create_free_text_question(
                text=text, topic_id=topic_id, scenario_id=scenario_id)

    def test_create_single_choice_question(self):
        text = "question"
        choices = [{
            "text":"a",
            "value":1
        },{
            "text":"b",
            "value":2
        },{
            "text":"c",
            "value":3
        }]

        topic_id = self.topic.id
        scenario_id = self.scenario.id

        question = question_operations.create_single_choice_question(
            text=text, choices=choices, scenario_id=scenario_id)

        assert question in db.session

        question_1 = question_operations.create_single_choice_question(
            text=text, choices=choices, topic_id=topic_id)

        assert question_1 in db.session

        with self.assertRaises(Exception):
            question_operations.create_single_choice_question(
                text=text, choices=choices, topic_id=topic_id, scenario_id=scenario_id)

    def test_create_multi_choice_question(self):
        text = "question"
        choices = [{
            "text":"a",
            "value":1
        },{
            "text":"b",
            "value":2
        },{
            "text":"c",
            "value":3
        }]

        topic_id = self.topic.id
        scenario_id = self.scenario.id

        question = question_operations.create_multi_choice_question(
            text=text, choices=choices, scenario_id=scenario_id)

        assert question in db.session

        question_1 = question_operations.create_multi_choice_question(
            text=text, choices=choices, topic_id=topic_id)

        assert question_1 in db.session

        with self.assertRaises(Exception):
            question_operations.create_multi_choice_question(
                text=text, choices=choices, topic_id=topic_id, scenario_id=scenario_id)

    def test_get_question_by_id(self):
        text = "question"
        scenario_id = self.scenario.id

        question = question_operations.create_free_text_question(
            text=text, scenario_id=scenario_id)

        question_id = question.id

        retrieved_question = question_operations.get_question_by_id(
            question_id)

        assert retrieved_question.text == text and retrieved_question.topic_id is None and retrieved_question.scenario_id == scenario_id

        text = "choice question"
        choices = [{
            "text":"a",
            "value":1
        },{
            "text":"b",
            "value":2
        },{
            "text":"c",
            "value":3
        }]
        topic_id = self.topic.id
        scenario_id = self.scenario.id

        question = question_operations.create_single_choice_question(
            text=text, choices=choices, scenario_id=scenario_id)

        question_id = question.id

        retrieved_question = question_operations.get_question_by_id(
            question_id)

        assert retrieved_question.text == text and retrieved_question.topic_id is None and retrieved_question.scenario_id == scenario_id

        retrieved_choices = [{"text":c.text,"value":c.value} for c in retrieved_question.choices]

        assert choices == retrieved_choices

    def test_get_question_by_scenario(self):
        text_1 = "t1"
        text_2 = "t2"
        scenario_id = self.scenario.id

        question_1 = question_operations.create_free_text_question(
            text=text_1, scenario_id=scenario_id)
        question_2 = question_operations.create_free_text_question(
            text=text_2, scenario_id=scenario_id)

        retrieved_questions = question_operations.get_questions_by_scenario(
            scenario_id)

        assert len(retrieved_questions) == 2
        assert retrieved_questions[0].text == question_1.text
        assert retrieved_questions[1].text == question_2.text

    def test_get_question_by_topic(self):
        text_1 = "t1"
        text_2 = "t2"
        topic_id = self.topic.id

        question_1 = question_operations.create_free_text_question(
            text=text_1, topic_id=topic_id)
        question_2 = question_operations.create_free_text_question(
            text=text_2, topic_id=topic_id)

        retrieved_questions = question_operations.get_questions_by_topic(
            topic_id)

        assert len(retrieved_questions) == 2
        assert retrieved_questions[0].text == question_1.text
        assert retrieved_questions[1].text == question_2.text

    def test_remove_question(self):
        text = "text"
        scenario_id = self.scenario.id

        question = question_operations.create_free_text_question(
            text=text, scenario_id=scenario_id)

        assert question in db.session

        question_operations.remove_question(question.id)

        assert question not in db.session

    def test_update_question(self):
        text = "text"
        scenario_id = self.scenario.id

        question = question_operations.create_free_text_question(
            text=text, scenario_id=scenario_id)

        new_text = "new text"

        question_operations.update_question(
            question_id=question.id, text=new_text)

        updated_question = question_operations.get_question_by_id(
            question_id=question.id)

        assert updated_question.text == new_text

        text = "text"
        choices = [{
            "text":"a",
            "value":1
        },{
            "text":"b",
            "value":2
        },{
            "text":"c",
            "value":3
        }]
        scenario_id = self.scenario.id

        question = question_operations.create_single_choice_question(
            text=text, choices=choices, scenario_id=scenario_id)

        new_text = "new_text"
        new_choices = [{
            "text":"d",
            "value":1
        },{
            "text":"e",
            "value":2
        }]

        question_operations.update_question(
            question_id=question.id, text=new_text, choices=new_choices)

        updated_question = question_operations.get_question_by_id(
            question_id=question.id)

        assert updated_question.text == new_text

        retrieved_choices = [c.text for c in updated_question.choices]
        retrieved_choices == new_choices

        text = "text"

        free_question = question_operations.create_free_text_question(
            text=text, scenario_id=scenario_id)

        with self.assertRaises(Exception):
            question_operations.update_question(
                free_question.id, choices=new_choices)


if __name__ == "__main__":
    unittest.main()
