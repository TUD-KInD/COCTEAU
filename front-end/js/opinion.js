(function () {
  "use strict";

  /**
   * Load the scenario title, description, and questions.
   * @private
   * @param {number} scenarioId - the ID of the scenario.
   */
  function loadScenario(scenarioId) {
    $.getJSON("file/scenario.json", function (data) {
      var scenarioData = data[scenarioId];
      $("#scenario-title").text(scenarioData["title"]);
      $("#scenario-description").html(scenarioData["description"]);
      var scenarioQuestions = scenarioData["question"];
      var $scenarioQuestions = $("#scenario-questions");
      for (var i = 0; i < scenarioQuestions.length; i++) {
        var $q = createScenarioQuestionHTML("sq" + i, scenarioQuestions[i]);
        $scenarioQuestions.append($q);
      }
    });
  }

  /**
   * Create and display the demographics dialog.
   * @private
   * @param {number} topicId - the ID of the topic.
   * @param {function} [callback] - callback function after creating the dialog.
   */
  function createDemographicsDialog(topicId, callback) {
    $.getJSON("file/topic.json", function (data) {
      // Add demographic questions
      var demographicsQuestions = data[topicId]["question"];
      var $demographicsQuestions = $("#demographics-questions");
      for (var i = 0; i < demographicsQuestions.length; i++) {
        var $q = createDemographicsQuestionHTML("dq" + i, demographicsQuestions[i]);
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
        "action_callback": function () {
          window.location.replace("vision.html" + window.location.search);
        },
        "close_callback": function () {
          window.location.replace("vision.html" + window.location.search);
        }
      });
      if (typeof callback === "function") {
        callback($demographicsDialog);
      }
      $(window).resize(function () {
        periscope.util.fitDialogToScreen($demographicsDialog);
      });
      periscope.util.fitDialogToScreen($demographicsDialog);
    });
  }

  /**
   * Create the html elements for a scenario question.
   * @private
   * @param {string} uniqueId - a unique ID for the scenario question.
   * @param {Object.<string, *>} question - the scenario question object.
   * @todo Document the question object.
   * @returns {Object} - a jQuery DOM object.
   */
  function createScenarioQuestionHTML(uniqueId, question) {
    var option = question["option"];
    var html = '';
    html += '<div class="custom-survey add-top-margin add-bottom-margin" id="scenario-question-' + uniqueId + '">';
    html += '  <span class="text">' + question["text"] + '</span>';
    html += '  <div class="custom-radio-group-survey add-top-margin">';
    for (var i = 0; i < option.length; i++) {
      html += '  <div>';
      html += '    <input type="radio" name="scenario-question-' + uniqueId + '-scale" value="' + option[i]["value"] + '" id="scenario-question-' + uniqueId + '-item-' + i + '">'
      html += '    <label for="scenario-question-' + uniqueId + '-item-' + i + '">' + option[i]["text"] + '</label>'
      html += '  </div>';
    }
    html += '  </div>';
    html += '  <textarea class="custom-textbox-survey add-top-margin" placeholder="Your opinion"></textarea>';
    html += '</div>';
    return $(html);
  }

  /**
   * Create the html elements for a demographic question.
   * @private
   * @param {string} uniqueId - a unique ID for the demographic question.
   * @param {Object.<string, *>} question - the demographic question object.
   * @todo Document the question object.
   * @returns {Object} - a jQuery DOM object.
   */
  function createDemographicsQuestionHTML(uniqueId, question) {
    var option = question["option"];
    var html = '';
    html += '<ul class="small-left-padding"><li><b>' + question["text"] + '</b></li></ul>';
    html += '<select id="demographic-select' + uniqueId + '" data-role="none">';
    html += '  <option selected="">Select...</option>';
    for (var i = 0; i < option.length; i++) {
      html += '  <option value="' + option[i]["value"] + '">' + option[i]["text"] + '</option>';
    }
    html += '</select>';
    return $(html);
  }

  /**
   * Initialize the page.
   * @private
   * @todo Only enable the next button when all the questions are filled.
   * @todo If topic_id or scenario_id is not defined, show a blank page with error messages.
   * @todo Only show the demographics dialog for the first-time user.
   * @todo Only enable the submit button when all the dropdown menu is filled.
   * @todo Only show this page for users who interact with this scenario for the first time.
   */
  function init() {
    var queryParas = periscope.util.parseVars(window.location.search);
    var scenarioId = "scenario_id" in queryParas ? queryParas["scenario_id"] : undefined;
    var topicId = "topic_id" in queryParas ? queryParas["topic_id"] : undefined;
    if (typeof topicId !== "undefined" && typeof scenarioId !== "undefined") {
      loadScenario(scenarioId);
      createDemographicsDialog(topicId, function ($demographicsDialog) {
        $("#next-button").data("clicked", "0").on("click", function () {
          var $this = $(this);
          if ($this.data("clicked") == "0") {
            $demographicsDialog.dialog("open");
            $this.data("clicked", "1");
          }
        });
      });
    }
  }
  $(init);
})();