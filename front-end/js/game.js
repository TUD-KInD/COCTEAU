(function () {
  "use strict";

  /**
   * Load the scenario title and description.
   * @private
   * @param {number} scenarioId - the ID of the scenario.
   */
  function loadScenario(scenarioId) {
    $.getJSON("file/scenario.json", function (data) {
      var scenarioData = data[scenarioId];
      $("#scenario-title").text(scenarioData["title"]);
      $("#scenario-description").html(scenarioData["description"]);
    });
  }

  /**
   * Set the checkbox for the emotions.
   * @private
   */
  function setCheckbox() {
    // Set the limit of the number of checkbox selections
    var limit = 2;
    var $emotionCheckboxGroup = $("#express-emotion .custom-radio-group-survey");
    $("#express-emotion input[type='checkbox']").on("change", function () {
      if ($emotionCheckboxGroup.find("input[type='checkbox']:checked").length > limit) {
        this.checked = false;
      }
    });
  }

  /**
   * Load the game.
   * @private
   */
  function loadGame() {
    $.getJSON("file/game.json", function (data) {
      var gameVisionMedia = data["vision"]["media"];
      for (var i = 0; i < gameVisionMedia.length; i++) {
        var g = gameVisionMedia[i];
        if (g["media_type"] == "image") {
          $("#vision-image").attr("src", g["url"]);
          $("#vision-caption").text(g["description"]);
          $("#vision-credit").html('Credit: <a href="' + g["unsplash_creator_url"] + '" target="_blank">' + g["unsplash_creator_name"] + '</a>');
        }
      }
    });
  }

  /**
   * Load the result of the game and show it.
   * @private
   * @todo The front-end must POST the vision_id and the game_token (obtained from the server) to get the result.
   */
  function loadAndShowGameResult() {
    $.getJSON("file/vision.json", function (data) {
      var valuesOfCorrectAnswers = [];
      for (var i = 0; i < data["mood"].length; i++) {
        valuesOfCorrectAnswers.push(data["mood"][i]["id"].toString());
      }
      showQuizResult($("#express-emotion"), valuesOfCorrectAnswers);
      $("#play-another-round").show();
      $("#show-game-result").hide();
      $("#provide-feedback").addClass("answer-mode").find("textarea").attr("placeholder", "").attr("disabled", "disabled");
    });
  }

  /**
   * Show the result of the survery quiz.
   * @private
   * @param {Object} $quizContainer - the jQuery object of the quiz container.
   * @param {string[]} valuesOfCorrectAnswers - the values (in the <input> tags) of the correct answers.
   */
  function showQuizResult($quizContainer, valuesOfCorrectAnswers) {
    // Disable the UI
    $quizContainer.find("input").attr("disabled", "disabled");
    // Set the css of the UI
    $quizContainer.addClass("answer-mode");
    // Highlight the correct answers and wrong choices
    $quizContainer.find("input").each(function () {
      var $this = $(this);
      var $label = $this.siblings("label");
      if (valuesOfCorrectAnswers.indexOf($this.val()) !== -1) {
        // Correct answer
        $this.addClass("highlight");
        var img_html = $label.find("img")[0].outerHTML;
        $label.html($label.text() + "&nbsp;(&#10003;)" + img_html);
      } else {
        if (this.checked) {
          // Wrong answer but selected
          var img_html = $label.find("img")[0].outerHTML;
          $label.html($label.text() + "&nbsp;(&#10007;)" + img_html);
        }
      }
    });
    // Scroll to the quiz element
    var p = $quizContainer.offset();
    if (typeof p !== "undefined") {
      window.scrollTo(0, Math.max(p.top - 30, 0));
    }
  }

  /**
   * Initialize the page.
   * @private
   * @todo Only enable the "view result" button when all the questions are filled.
   * @todo If scenario_id is not defined, show a blank page with error messages.
   */
  function init() {
    var queryParas = periscope.util.parseVars(window.location.search);
    var scenarioId = "scenario_id" in queryParas ? queryParas["scenario_id"] : undefined;
    if (typeof scenarioId !== "undefined") {
      loadScenario(scenarioId);
      loadGame();
      setCheckbox();
      $("#show-result-button").on("click", loadAndShowGameResult);
      $("#vision-button").on("click", function () {
        window.location.replace("vision.html" + window.location.search);
      });
      $("#game-button").on("click", function () {
        window.location.replace("game.html" + window.location.search);
      });
      $("#browse-button").on("click", function () {
        window.location.replace("browse.html" + window.location.search);
      });
    }
  }
  $(init);
})();