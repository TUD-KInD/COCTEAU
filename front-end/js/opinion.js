(function () {
  "use strict";

  /**
   * Create and display the topic question dialog.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {number} topicId - the ID of the topic.
   * @param {number} scenarioId - the ID of the scenario.
   * @param {function} [callback] - callback function after creating the dialog.
   */
  function createTopicQuestionDialog(envObj, topicId, scenarioId, callback) {
    envObj.getQuestionByTopicId(topicId, function (data) {
      // Add topic questions
      var topicQuestions = data["data"];
      periscope.util.sortArrayOfDictByKeyInPlace(topicQuestions, "order");
      var $topicQuestions = $("#topic-questions");
      for (var i = 0; i < topicQuestions.length; i++) {
        var q = topicQuestions[i];
        if (q["question_type"] == null) {
          var $q = createTextHTML(q["text"]);
        } else {
          var $q = createTopicQuestionHTML("dq" + i, q);
          $q.data("raw", q);
        }
        $topicQuestions.append($q);
      }
      var widgets = new edaplotjs.Widgets();
      // Set the topic question dialog
      // We need to give the parent element so that on small screens, the dialog can be scrollable
      var $topicQuestionDialog = widgets.createCustomDialog({
        "selector": "#dialog-topic-question",
        "action_text": "Submit",
        "width": 290,
        "class": "dialog-container-topic-question",
        "show_cancel_btn": false,
        "close_dialog_on_action": false,
        "show_close_button": false,
        "action_callback": function () {
          $topicQuestionDialog.dialog("widget").find("button.ui-action-button").prop("disabled", true);
          submitTopicQuestionAnswer(envObj, function () {
            // Success condition
            console.log("Topic answers submitted.");
            loadPageContent(envObj, scenarioId);
            $topicQuestionDialog.dialog("close");
          }, function () {
            // Error condition
            $topicQuestionDialog.dialog("widget").find("button.ui-action-button").prop("disabled", false);
          });
        }
      });
      $topicQuestionDialog.on("dialogopen", function (event, ui) {
        $topicQuestionDialog.scrollTop(0);
      });
      $(window).resize(function () {
        periscope.util.fitDialogToScreen($topicQuestionDialog);
      });
      periscope.util.fitDialogToScreen($topicQuestionDialog);
      if (typeof callback === "function") {
        callback($topicQuestionDialog);
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
   * Create the html elements for a topic question.
   * @private
   * @param {string} uniqueId - a unique ID for the topic question.
   * @param {Question} question - the topic question object.
   * @returns {Object} - a jQuery DOM object.
   */
  function createTopicQuestionHTML(uniqueId, question) {
    var option = question["choices"];
    var html = '';
    html += '<div class="topic-question-item">';
    html += '  <ul class="small-left-padding"><li><b>' + question["text"] + '</b></li></ul>';
    html += '  <select id="topic-question-select-' + uniqueId + '" data-role="none">';
    html += '    <option selected="" value="none">Select...</option>';
    for (var i = 0; i < option.length; i++) {
      html += '    <option value="' + option[i]["id"] + '">' + option[i]["text"] + '</option>';
    }
    html += '  </select>';
    html += '</div>';
    return $(html);
  }

  /**
   * Submit the answers to topic questions to the back-end.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   */
  function submitTopicQuestionAnswer(envObj, success, error) {
    var answers = [];
    var areAllQuestionsAnswered = true;
    $(".topic-question-item").each(function () {
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
      envObj.createAnswersInOrder(envObj, answers, [], function () {
        /**
         * @todo Check if answers to the YES/NO questions are all YES (for consent).
         * @todo If not, redirect the user to another page.
         * @todo If yes, call the success function.
         */
        if (typeof success === "function") {
          success();
        }
      }, error);
    } else {
      var errorMessage = "(Would you please select an answer for all questions?)";
      console.error(errorMessage);
      $("#submit-topic-question-error-message").text(errorMessage).stop(true).fadeIn(500).delay(5000).fadeOut(500);
      $("#dialog-topic-question").scrollTop($("#topic-questions").height() + 30);
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
   * Initialize the topic question dialog and the next steps buttons.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {number} topicId - the ID of the topic.
   * @param {number} scenarioId - the ID of the scenario.
   */
  function initTopicQuestionDialog(envObj, topicId, scenarioId) {
    // Get the answers to topic questions
    envObj.getAnswerOfCurrentUserByTopicId(topicId, function (data) {
      var answer = data["data"];
      if (typeof answer === "undefined" || answer.length == 0) {
        // Create the topic question dialog when there are no answers to topic questions
        createTopicQuestionDialog(envObj, topicId, scenarioId, function ($topicQuestionDialog) {
          $topicQuestionDialog.dialog("open");
        });
      } else {
        // Show the page when there are answers to topic questions
        loadPageContent(envObj, scenarioId);
      }
    });
  }

  /**
   * Load the content of the page.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {number} scenarioId - the ID of the scenario.
   */
  function loadPageContent(envObj, scenarioId) {
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
          if (q["question_type"] == null) {
            var $q = createTextHTML(q["text"]);
          } else {
            var $q = createScenarioQuestionHTML("sq" + i, q);
            $q.data("raw", q);
          }
          $scenarioQuestions.append($q);
        }
        $("#next-button").on("click", function () {
          submitScenarioAnswer(envObj, function () {
            window.location.replace("vision.html" + window.location.search);
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
    if (typeof scenarioId !== "undefined" && topicId !== "undefined") {
      initTopicQuestionDialog(envObj, topicId, scenarioId);
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