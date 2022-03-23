"""
This script gets data from Prolific users and outputs them into a csv file.
"""

import sys
from app.app import app
from models.model_operations.topic_operations import get_all_topics
from models.model_operations.question_operations import get_questions_by_scenario
from models.model_operations.question_operations import get_question_by_id
from models.model_operations.answer_operations import get_answers_by_topic
from models.model_operations.answer_operations import get_answers_by_scenario
from models.model_operations.scenario_operations import get_scenarios_by_topic
import json
import pandas as pd
from collections import defaultdict
from models.model import QuestionTypeEnum


def main(argv):
    print("Get experiment data...")
    df_list = []
    with app.app_context():
        # Build tables with index
        # The first level is mode, and the second level is view
        for t in get_all_topics():
            # We only want to get the experiment data
            if "Crowdsourcing Experiment" not in t.title: continue
            scenarios = get_scenarios_by_topic(t.id)
            assert len(scenarios) == 1, "Each experiment topic can have only one scenario."
            s = scenarios[0]
            sq_list = get_questions_by_scenario(s.id)
            sq_list = [q for q in sq_list if q.question_type is not None]
            sq_list = sorted(sq_list, key=lambda x: (x.page, x.order))
            columns = ["user_id", "prolific_id", "mode", "view"] + [sq.text for sq in sq_list]
            df = pd.Series(index=columns, dtype=object)
            df.name = "mode_%d_view_%d" % (s.mode, s.view)
            num_of_q = len(sq_list)
            has_data = False
            print("\n" + "="*70)
            print("Create dataframe:", df.name)
            print("Total number of questions:", num_of_q)
            print("Scenario ID:", s.id)
            # Get all answers for this topic and collect the user IDs
            for ta in get_answers_by_topic(t.id):
                # We only wants to get the scenario answers from prolific users
                if ta.secret is None: continue
                secret = json.loads(ta.secret)
                prolific_id = secret["user_platform_id"]
                scenario_id = int(secret["scenario_id"])
                print("-"*50)
                print("Prolific ID:", prolific_id)
                print("User ID:", ta.user_id)
                # Get all answers for the scenario from this user
                user_answers = get_answers_by_scenario(scenario_id, user_id=ta.user_id)
                assert scenario_id == s.id, "Scenario ID does not match."
                # Remove duplicated answers for the same question (use only the latest timestamp)
                df_user_answers = pd.DataFrame([[u.question_id, u.created_at, u] for u in user_answers], columns=["qid", "t", "a"])
                idx = df_user_answers.groupby(["qid"])["t"].transform(max) == df_user_answers["t"]
                df_user_answers = df_user_answers[idx]
                user_answers = list(df_user_answers["a"])
                assert len(user_answers) <= num_of_q, "# of answered questions should be smaller than # of questions."
                # Fill the data to the dataframe
                row = {"user_id": ta.user_id, "prolific_id": prolific_id, "mode":s.mode, "view": s.view}
                for a in user_answers:
                    q = get_question_by_id(a.question_id)
                    assert q.question_type is not None, "Question type cannot be None."
                    if q.question_type == QuestionTypeEnum.FREE_TEXT:
                        row[q.text] = a.text
                    elif q.question_type == QuestionTypeEnum.SINGLE_CHOICE:
                        row[q.text] = a.choices[0].value
                    elif q.question_type == QuestionTypeEnum.MULTI_CHOICE:
                        row[q.text] = [c.value for c in a.choices]
                    else:
                        print("ERROR! Wrong question type. Skip this answer.")
                df = pd.concat([df, pd.Series(row)], axis=1, ignore_index=True)
                has_data = True
            if has_data:
                # Remove the first empty data initially
                df = df.drop(columns=[0])
                print(df)
                df_list.append(df)
    # Merge all dataframes and save data
    df_all = pd.concat(df_list, axis=1, ignore_index=True)
    print(df_all)
    df_all.T.to_csv("prolific-data.csv", index=False)


if __name__ == "__main__":
    main(sys.argv)
