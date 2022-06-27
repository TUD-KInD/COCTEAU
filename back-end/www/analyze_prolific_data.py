"""
Notes:

If the data follows the normal distribution, we can use t-test:

For t-test with paired samples (e.g., within-subject design):
https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ttest_rel.html

For t-test with unpaired samples (e.g., between-subject design):
https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ttest_ind.html

If your data does not follow normal distribution, we need to use rank test:

For rank-test with paired samples:
https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.wilcoxon.html

For rank-test with unpaired samples:
https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.mannwhitneyu.html
"""

import sys
import pandas as pd
from scipy import stats
from scipy.stats import wilcoxon


def main(argv):
    df = pd.read_csv("prolific-data.csv")
    print(df.columns)
    print("")

    #TODO: filter responses that failed the data quality and attention checks

    # Check the opinion changes in each mode
    c_before = "What is your opinion on the scenario, based on your assigned role?"
    c_after = "Based on your assigned role, what is your opinion on the scenario?"
    df_opinion = df[["mode", c_before, c_after]]
    df_opinion = df_opinion.rename({c_before: "opinion_before", c_after: "opinion_after"}, axis=1)
    df_opinion = df_opinion.dropna(how="any")
    df_opinion = df_opinion.groupby("mode")
    for name, g in df_opinion:
        print("")
        print("="*60)
        print("mode", name)
        print(g[["opinion_before", "opinion_after"]].describe())
        opinion_before = g["opinion_before"]
        opinion_after = g["opinion_after"]
        #TODO: need to check if the data follows normal distribution
        print(stats.ttest_rel(opinion_before, opinion_after))
        print(wilcoxon(opinion_before, opinion_after))


if __name__ == "__main__":
    main(sys.argv)
