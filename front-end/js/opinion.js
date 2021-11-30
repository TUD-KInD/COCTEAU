(function () {
  "use strict";

  /**
   * The object for the "Choice" database table.
   * @typedef {Object} Choice
   * @property {string} text - text of the choice.
   * @property {number} value - value of the choice.
   */

  /**
   * The object for the "Question" database table.
   * @typedef {Object} Question
   * @param {string} text - text of the question.
   * @param {Choice[]} choices - choices of the question.
   */

  /**
   * Create the html elements for a scenario question.
   * @private
   * @param {string} uniqueId - a unique ID for the scenario question.
   * @param {Question} question - the scenario question object.
   * @returns {Object} - a jQuery DOM object.
   */
  function createScenarioQuestionHTML(uniqueId, question) {
    var option = question["choices"];
    var html = '';
    html += '<div class="custom-survey add-top-margin add-bottom-margin" id="scenario-question-' + uniqueId + '">';
    html += '  <span class="text">' + question["text"] + '</span>';
    html += '  <div class="custom-radio-group-survey add-top-margin">';
    for (var i = 0; i < option.length; i++) {
      html += '  <div>';
      html += '    <input type="radio" name="scenario-question-' + uniqueId + '-scale" value="' + option[i]["id"] + '" id="scenario-question-' + uniqueId + '-item-' + i + '">'
      html += '    <label for="scenario-question-' + uniqueId + '-item-' + i + '">' + option[i]["text"] + '</label>'
      html += '  </div>';
    }
    html += '  </div>';
    if (option.length == 0) {
      html += '  <textarea class="custom-textbox-survey add-top-margin" placeholder="Your opinion (max 500 characters)" maxlength="500"></textarea>';
    }
    html += '</div>';
    return $(html);
  }

  /**
   * Create the html elements for a scenario question as a text description.
   * @public
   * @param {string} text - the text description.
   * @returns {Object} - a jQuery DOM object.
   */
  function createScenarioTextHTML(text) {
    var $html;
    try {
      $html = $(text);
    } catch (error) {
      $html = $('<p class="text">' + text + '</p>');
    }
    return $html;
  };

  /**
   * Submit the scenario answers to the back-end.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {function} [success] - callback function when the operation is successful.
   * @param {function} [error] - callback function when the operation is failing.
   */
  function submitScenarioAnswer(envObj, success, error) {
    var answers = [];
    var areAllQuestionsAnswered = true;
    $(".custom-survey").each(function () {
      var $this = $(this);
      var $allChoices = $this.find("input[type='radio'], input[type='checkbox']");
      var $checkedChoices = $this.find("input[type='radio']:checked, input[type='checkbox']:checked");
      var answer = {
        "questionId": $this.data("raw")["id"],
        "text": $this.find(".custom-textbox-survey").val()
      };
      if ($allChoices.length > 0) {
        // This condition means that this is a single or multiple choice question
        if ($checkedChoices.length > 0) {
          // This condition means that user provides the answer
          answer["choiceIdList"] = $checkedChoices.map(function () {
            return parseInt($(this).val());
          }).get();
          answers.push(answer);
        } else {
          // This condition means that there are no answers to this question
          areAllQuestionsAnswered = false;
        }
      } else {
        // This condition means that this is a free text question
        answers.push(answer);
      }
    });
    if (areAllQuestionsAnswered) {
      envObj.createAnswersInOrder(answers, [], success, error);
    } else {
      var errorMessage = "(Would you please select an answer for all questions that have choices?)";
      console.error(errorMessage);
      $("#submit-survey-error-message").text(errorMessage).stop(true).fadeIn(500).delay(5000).fadeOut(500);
      if (typeof error === "function") error();
    }
  }

  /**
   * Load the content of the page.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {number} scenarioId - the ID of the scenario.
   * @param {number} [page] - page of the scenario questions that we want to load.
   * @param {number} [mode] - the mode of the system configuration.
   */
  function loadPageContent(envObj, scenarioId, page, mode) {
    envObj.getScenarioById(scenarioId, function (data) {
      var scenario = data["data"];
      if ($.isEmptyObject(scenario)) {
        envObj.showErrorPage();
      } else {
        $("#scenario-title").text(scenario["title"]);
        $("#scenario-description").html(scenario["description"]);
        var scenarioQuestions = scenario["questions"];
        periscope.util.sortArrayOfDictByKeyInPlace(scenarioQuestions, "order");
        var $scenarioQuestions = $("#scenario-questions");
        for (var i = 0; i < scenarioQuestions.length; i++) {
          var q = scenarioQuestions[i];
          if (typeof page !== "undefined" && q["page"] != page) continue;
          if (q["question_type"] == null) {
            var $q = createScenarioTextHTML(q["text"]);
          } else {
            var $q = createScenarioQuestionHTML("sq" + i, q);
            $q.data("raw", q);
          }
          $scenarioQuestions.append($q);
        }
        $("#next-button").on("click", function () {
          submitScenarioAnswer(envObj, function () {
            if (mode == 0) {
              // Mode 0 means the deployment setting
              window.location.replace("vision.html" + window.location.search);
            } else {
              // Other modes mean the experiment settings
              window.location.replace("choice.html" + window.location.search);
            }
          });
        });
        envObj.showPage();
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
    var mode = "mode" in queryParas ? parseInt(queryParas["mode"]) : 0;
    if (typeof scenarioId !== "undefined" && topicId !== "undefined") {
      envObj.checkUserConsent(topicId, function () {
        // The user has provided consent
        loadPageContent(envObj, scenarioId, page, mode);
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