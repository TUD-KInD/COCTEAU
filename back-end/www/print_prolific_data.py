import pandas as pd
import sys

pid = None
if len(sys.argv)>1:
    pid = sys.argv[1]

def print_one(d, i):
    print(d.iloc[i].to_frame())
    print("")
    print("Data quality check 1:")
    print(d.iloc[i]["motivation_url_0"])
    print(d.iloc[i]["motivation_description_0"])
    print("")
    print("Data quality check 2 (reversed question):")
    print(d.iloc[i]["Before criticizing somebody, I try to imagine how I would feel if I were in their place."])
    print(d.iloc[i]["I do not try to imagine how I would feel if I were in somebody's place before criticizing them."])
    print("")
    print("Data quality check 3 (reversed question):")
    print(d.iloc[i]["Sometimes I don't feel sorry for other people when they are having problems."])
    print(d.iloc[i]["Sometimes I feel sorry for other people when they are having problems."])

d = pd.read_csv("prolific-data.csv")
for i in range(len(d)):
    if pid is None:
        print("")
        print("="*110)
        print("="*110)
        print_one(d, i)
    else:
        if d.iloc[i]["prolific_id"] == pid:
            print_one(d, i)
