(function () {
  "use strict";

  var wantToReportScrollBottom = true;
  var previousScroll = 0;

  /**
   * Add the event to detect if the user scrolls the page to the end.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   */
  function addScrollEndEvent(envObj) {
    var $window = $(window);
    $window.on("scroll", function () {
      if (wantToReportScrollBottom && $window.scrollTop() + $window.height() == $(document).height()) {
        var currentScroll = $window.scrollTop();
        if (currentScroll > previousScroll) {
          envObj.sendTrackerEvent("scroll", {
            "value": 100
          });
          // Send a GA event with vision items
          wantToReportScrollBottom = false;
        }
        previousScroll = currentScroll;
      }
    });
  }

  /**
   * Load answers.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {number} scenarioId - the scenario ID of the questions.
   */
  function loadAnswers(envObj, scenarioId) {
    envObj.getQuestionByScenarioId(scenarioId, undefined, undefined, undefined, function (returnData) {
      var questions = returnData["data"];
      var filteredQuestions = [];
      for (var j = 0; j < questions.length; j++) {
        var q = questions[j];
        if (q["question_type"] != null) {
          filteredQuestions.push(q);
        }
      }
      periscope.util.sortArrayOfDictByKeyInPlace(filteredQuestions, "order");
      getAnswersInOrder(envObj, filteredQuestions, [], function (answerList) {
        var $answer = $("#answer");
        for (var i = 0; i < filteredQuestions.length; i++) {
          var filteredAnswers = [];
          for (var k = 0; k < answerList[i].length; k++) {
            var answer = answerList[i][k];
            if (answer["text"] != null) {
              filteredAnswers.push(answer);
            }
          }
          var $a = createScenarioQuestionAnswerHTML("sqa" + i, filteredQuestions[i], filteredAnswers);
          $answer.append($a);
        }
      });
    });
  }

  // TODO: document this function
  function getAnswersInOrder(envObj, questions, answerList, success, error) {
    if (questions.length == 0) {
      if (typeof success === "function") success(answerList);
      return true;
    } else {
      envObj.getAnswerByQuestionId(questions[0]["id"], function (answerData) {
        answerList.push(answerData["data"]);
        getAnswersInOrder(envObj, questions.slice(1), answerList, success, error);
      }, function () {
        if (typeof error === "function") error();
        return false;
      });
    }
  }

  // TODO: document this function
  function createScenarioQuestionAnswerHTML(uniqueId, question, answers) {
    var html = '';
    html += '<div class="custom-survey add-top-margin add-bottom-margin" id="scenario-question-' + uniqueId + '">';
    html += '  <span class="text">' + question["text"] + '</span>';
    for (var i = 0; i < answers.length; i++) {
      html += '  <p class="custom-answer-survey">' + answers[i]["text"] + '</p>';
    }
    html += '</div>';
    return $(html);
  }

  /**
   * Initialize the user interface.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   */
  function initUI(envObj) {
    var queryParas = periscope.util.parseVars(window.location.search);
    var scenarioId = "scenario_id" in queryParas ? queryParas["scenario_id"] : undefined;
    if (typeof scenarioId !== "undefined") {
      envObj.getScenarioById(scenarioId, function (data) {
        var scenario = data["data"];
        if ($.isEmptyObject(scenario)) {
          envObj.showErrorPage();
        } else {
          $("#scenario-title").text(scenario["title"]);
          $("#scenario-description").html(scenario["description"]);
          loadAnswers(envObj, scenarioId);
          addScrollEndEvent(envObj);
          envObj.showPage();
        }
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