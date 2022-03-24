(function () {
  "use strict";

  /**
   * Load the content of the page.
   * If no questions are found for the desired view on that page, show the default view for that page (which is view=0).
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {number} scenarioId - the ID of the scenario.
   * @param {number} page - page of the scenario questions that we want to load.
   */
  function loadPageContent(envObj, scenarioId, page) {
    envObj.getScenarioById(scenarioId, function (data) {
      var scenario = data["data"];
      var mode = scenario["mode"];
      if ($.isEmptyObject(scenario)) {
        envObj.showErrorPage();
      } else {
        var $questionContainer = $("#scenario-questions");
        var oneByOne = false;
        if ((mode == 1 && page == 3) || (mode == 2 && page == 3)) {
          // IMPORTANT: this if-else statement is hard-coded for our experiments and is not intended for general use.
          oneByOne = true;
        }
        envObj.addScenarioQuestionsToContainer($questionContainer, scenarioId, page, oneByOne, function () {
          $("#next-button").on("click", function () {
            envObj.submitScenarioAnswer($questionContainer, function () {
              if (mode == 0) {
                // Mode 0 means the deployment setting (normal user interactions)
                window.location.href = "vision.html" + window.location.search;
              } else {
                // Other modes mean the experiment settings
                var queryString = window.location.search;
                if (queryString.indexOf("page=" + page) !== -1) {
                  // Increase the page number
                  queryString = queryString.replace("page=" + page, "page=" + (page + 1));
                }
                if ((mode == 1 && page == 6) || (mode == 2 && page == 6) || (mode == 3 && page == 5)) {
                  // IMPORTANT: this if-else statement is hard-coded for our experiments and is not intended for general use.
                  // For the last page, we need to go to the thank you page
                  window.location.href = "experiment-thanks.html" + queryString;
                } else {
                  // IMPORTANT: this if-else statement is hard-coded for our experiments and is not intended for general use.
                  window.location.href = "experiment-opinion.html" + queryString;
                }
              }
            }, function (errorMessage) {
              $("#submit-survey-error-message").text(errorMessage).stop(true).fadeIn(500).delay(5000).fadeOut(500);
            });
          });
          envObj.showPage();
        });

      }
    });
  }

  /**
   * Initialize the user interface.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   */
  function initUI(envObj) {
    var queryParas = periscope.util.parseVars(window.location.search);
    var scenarioId = "scenario_id" in queryParas ? queryParas["scenario_id"] : undefined;
    var topicId = "topic_id" in queryParas ? queryParas["topic_id"] : undefined;
    var page = "page" in queryParas ? parseInt(queryParas["page"]) : 0;
    if (typeof scenarioId !== "undefined" && topicId !== "undefined") {
      envObj.checkUserConsent(topicId, function () {
        // The user has provided consent
        loadPageContent(envObj, scenarioId, page);
      });
    } else {
      envObj.showErrorPage();
    }
  }

  /**
   * Initialize the page.
   * @private
   */
  function init() {
    var env = new periscope.Environment({
      "ready": function (envObj) {
        initUI(envObj);
      },
      "fail": function (message) {
        console.error(message);
      }
    });
  }
  $(init);
})();