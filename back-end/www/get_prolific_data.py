"""
This script gets data from Prolific users and outputs them into a csv file.
"""

import sys
from app.app import app
from models.model_operations.topic_operations import get_all_topics
from models.model_operations.question_operations import get_questions_by_scenario
from models.model_operations.answer_operations import get_answers_by_topic
from models.model_operations.answer_operations import get_answers_by_scenario
from models.model_operations.scenario_operations import get_scenarios_by_topic
import json
import pandas as pd
from collections import defaultdict


def main(argv):
    print("Get experiment data...")
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
            df = pd.DataFrame(columns=[sq.text for sq in sq_list])
            df.name = "mode_%d_view_%d" % (s.mode, s.view)
            print("Create dataframe:", df.name)
            # Get all answers for this topic and collect the user IDs
            for ta in get_answers_by_topic(t.id):
                # We only wants to get the scenario answers from prolific users
                if ta.secret is None: continue
                secret = json.loads(ta.secret)
                prolific_id = secret["user_platform_id"]
                scenario_id = secret["scenario_id"]
                user_id = ta.user_id
                print(ta)


if __name__ == "__main__":
    main(sys.argv)
