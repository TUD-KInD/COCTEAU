(function () {
  "use strict";

  /**
   * Create and display the demographics dialog.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {number} topicId - the ID of the topic.
   * @param {function} [callback] - callback function after creating the dialog.
   */
  function createDemographicsDialog(envObj, topicId, callback) {
    envObj.getQuestionByTopicId(topicId, function (data) {
      // Add demographic questions
      var demographicsQuestions = data["data"];
      var $demographicsQuestions = $("#demographics-questions");
      for (var i = 0; i < demographicsQuestions.length; i++) {
        var q = demographicsQuestions[i];
        var $q = createDemographicsQuestionHTML("dq" + i, q);
        $q.data("raw", q);
        $demographicsQuestions.append($q);
      }
      var widgets = new edaplotjs.Widgets();
      // Set the demographics dialog
      // We need to give the parent element so that on small screens, the dialog can be scrollable
      var $demographicsDialog = widgets.createCustomDialog({
        "selector": "#dialog-demographics",
        "action_text": "Submit",
        "width": 290,
        "class": "dialog-container-demographics",
        "show_cancel_btn": false,
        "close_dialog_on_action": false,
        "action_callback": function () {
          $demographicsDialog.dialog("widget").find("button.ui-action-button").prop("disabled", true);
          submitDemographicsAnswer(envObj, function () {
            // Success condition
            window.location.replace("vision.html" + window.location.search);
          }, function () {
            // Error condition
            $demographicsDialog.dialog("widget").find("button.ui-action-button").prop("disabled", false);
          });
        }
      });
      $demographicsDialog.on("dialogclose", function () {
        window.location.replace("vision.html" + window.location.search);
      });
      $(window).resize(function () {
        periscope.util.fitDialogToScreen($demographicsDialog);
      });
      periscope.util.fitDialogToScreen($demographicsDialog);
      if (typeof callback === "function") {
        callback($demographicsDialog);
      }
    });
  }

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
   * @todo Add checkbox (instead of radio) for a multiple-choice question.
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
   * Create the html elements for a text description.
   * @private
   * @param {string} text - the text description.
   * @returns {Object} - a jQuery DOM object.
   */
  function createTextHTML(text) {
    var $html;
    try {
      $html = $(text);
    } catch (error) {
      $html = $('<p class="text">' + text + '</p>');
    }
    return $html;
  }

  /**
   * Create the html elements for a demographic question.
   * @private
   * @param {string} uniqueId - a unique ID for the demographic question.
   * @param {Question} question - the demographic question object.
   * @returns {Object} - a jQuery DOM object.
   */
  function createDemographicsQuestionHTML(uniqueId, question) {
    var option = question["choices"];
    var html = '';
    html += '<div class="demographic-item">';
    html += '  <ul class="small-left-padding"><li><b>' + question["text"] + '</b></li></ul>';
    html += '  <select id="demographic-select-' + uniqueId + '" data-role="none">';
    html += '    <option selected="" value="none">Select...</option>';
    for (var i = 0; i < option.length; i++) {
      html += '    <option value="' + option[i]["id"] + '">' + option[i]["text"] + '</option>';
    }
    html += '  </select>';
    html += '</div>';
    return $(html);
  }

  /**
   * Submit the demographics answer to the back-end.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   */
  function submitDemographicsAnswer(envObj, success, error) {
    var answers = [];
    var areAllQuestionsAnswered = true;
    $(".demographic-item").each(function () {
      var $this = $(this);
      var $allChoices = $this.find("option");
      var $checkedChoices = $this.find("option:selected");
      var answer = {
        "questionId": $this.data("raw")["id"]
      };
      if ($allChoices.length > 0) {
        // This condition means that this is a single or multiple choice question
        if ($checkedChoices.length > 0 && $checkedChoices.val() != "none") {
          // This condition means that user provides the answer
          answer["choiceIdList"] = $checkedChoices.map(function () {
            return parseInt($(this).val());
          }).get();
          answers.push(answer);
        } else {
          // This condition means that there are no answers to this question
          areAllQuestionsAnswered = false;
        }
      }
    });
    if (areAllQuestionsAnswered) {
      envObj.createAnswersInOrder(envObj, answers, [], success, error);
    } else {
      var errorMessage = "(Would you please select an answer for all questions?)";
      console.error(errorMessage);
      $("#submit-demographics-error-message").text(errorMessage).stop(true).fadeIn(500).delay(5000).fadeOut(500);
      if (typeof error === "function") error();
    }
  }

  /**
   * Submit the scenario answers to the back-end.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
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
      envObj.createAnswersInOrder(envObj, answers, [], success, error);
    } else {
      var errorMessage = "(Would you please select an answer for all questions that have choices?)";
      console.error(errorMessage);
      $("#submit-survey-error-message").text(errorMessage).stop(true).fadeIn(500).delay(5000).fadeOut(500);
      if (typeof error === "function") error();
    }
  }

  /**
   * Initialize the demographic dialog and the next steps buttons.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {number} topicId - the ID of the topic.
   */
  function initDemographicsDialog(envObj, topicId) {
    // Get the demographic answers
    envObj.getAnswerOfCurrentUserByTopicId(topicId, function (data) {
      var answer = data["data"];
      if (typeof answer !== "undefined" && answer.length > 0) {
        // Go to the vision page when there are demographic answers
        $("#next-button").on("click", function () {
          submitScenarioAnswer(envObj, function () {
            window.location.replace("vision.html" + window.location.search);
          });
        });
      } else {
        // Create the demographic dialog when there are no demographic answers
        createDemographicsDialog(envObj, topicId, function ($demographicsDialog) {
          $("#next-button").on("click", function () {
            submitScenarioAnswer(envObj, function () {
              $demographicsDialog.dialog("open");
            });
          });
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
    if (typeof scenarioId !== "undefined") {
      envObj.getScenarioById(scenarioId, function (data) {
        var scenario = data["data"];
        if ($.isEmptyObject(scenario)) {
          envObj.showErrorPage();
        } else {
          $("#scenario-title").text(scenario["title"]);
          $("#scenario-description").html(scenario["description"]);
          var scenarioQuestions = scenario["questions"];
          var $scenarioQuestions = $("#scenario-questions");
          for (var i = 0; i < scenarioQuestions.length; i++) {
            var q = scenarioQuestions[i];
            console.log(q["question_type"]);
            if (q["question_type"] == null) {
              var $q = createTextHTML(q["text"]);
            } else {
              var $q = createScenarioQuestionHTML("sq" + i, q);
              $q.data("raw", q);
            }
            $scenarioQuestions.append($q);
          }
          initDemographicsDialog(envObj, scenario["topic_id"]);
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