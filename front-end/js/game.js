(function () {
  "use strict";

  /**
   * Set the limit of the number of checkbox selections.
   * @private
   * @param {Object} $container - jQuery object of the checkbox container.
   * @param {number} limit - limit of the number of checkbox selections.
   */
  function setCheckboxNumberLimit($container, limit) {
    $container.find("input[type='checkbox']").on("change", function () {
      if ($container.find("input[type='checkbox']:checked").length > limit) {
        this.checked = false;
      }
    });
  }

  /**
   * Load the moods.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {number} limit - limit of the number of checkbox selections.
   */
  function loadMood(envObj, limit) {
    envObj.getAllMood(function (data) {
      var moods = data["data"];
      var $moodOptionContainer = $("#mood-option-container");
      for (var i = 0; i < moods.length; i++) {
        var m = moods[i];
        $moodOptionContainer.append(createMoodHTML(m["id"], m["name"], "img/" + m["image"]));
      }
      setCheckboxNumberLimit($("#express-emotion .custom-radio-group-survey"), limit);
    });
  }

  /**
   * Create the html elements for a mood.
   * @private
   * @param {number} moodId - the ID of the mood.
   * @param {string} name - the name of the mood.
   * @param {string} imageUrl - the source URL of an image for the mood.
   * @returns {Object} - a jQuery DOM object.
   */
  function createMoodHTML(moodId, name, imageUrl) {
    var radioId = "express-emotion-item-" + moodId;
    var html = '<div><input type="checkbox" name="express-emotion-scale" value="' + moodId + '" id="' + radioId + '"><label for="' + radioId + '">' + name + '<img src="' + imageUrl + '" /></label></div>';
    return $(html);
  }

  /**
   * Load the game.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {number} limit - limit of the number of checkbox selections.
   * @param {number} scenarioId - the ID of the scenario.
   */
  function loadGame(envObj, limit, scenarioId) {
    envObj.createRandomGame(scenarioId, function (data) {
      if (typeof data === "undefined") {
        // This means no games are available for play
        $("#no-game-message").show();
      } else {
        // This means the server returns a game object
        $("#game-ui").show();
        var game = data["data"];
        var gameVisionMedia = game["vision"]["medias"];
        for (var i = 0; i < gameVisionMedia.length; i++) {
          var g = gameVisionMedia[i];
          if (g["media_type"] == "IMAGE") {
            $("#vision-image").attr("src", g["url"]);
            $("#vision-caption").text(g["description"]);
            $("#vision-credit").html('Credit: <a href="' + g["unsplash_creator_url"] + '" target="_blank">' + g["unsplash_creator_name"] + '</a>');
          }
        }
        $("#show-game-result").show();
        $("#show-result-button").on("click", function () {
          loadAndShowGameResult(envObj, limit);
        });
        $("#game").data("raw", game);
      }
    });
  }

  /**
   * Load the result of the game and show it.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {number} limit - limit of the number of checkbox selections.
   */
  function loadAndShowGameResult(envObj, limit, success, error) {
    var gameData = $("#game").data("raw");
    if (typeof gameData === "undefined") {
      console.error("Game is not loaded correctly.");
      if (typeof error === "function") error();
    } else {
      var moods = $("#mood-option-container").find("input[type='checkbox']:checked").map(function () {
        return parseInt($(this).val());
      }).get();
      var feedback = $("#game-feedback").val();
      if (feedback == "") feedback = undefined;
      if (moods.length != limit) {
        var errorMessage = "(Would you please guess TWO options about the mood of the meme?)";
        console.error(errorMessage);
        $("#submit-game-error-message").text(errorMessage).stop(true).fadeIn(500).delay(5000).fadeOut(500);
        if (typeof error === "function") error();
      } else {
        envObj.updateGame(gameData["id"], moods, feedback, function (data) {
          var valuesOfCorrectAnswers = [data["data"]["vision"]["mood_id"].toString()];
          showQuizResult($("#express-emotion"), valuesOfCorrectAnswers);
          $("#play-game").show();
          $("#show-game-result").hide();
          $("#provide-feedback").addClass("answer-mode");
          $("#game-feedback").attr("placeholder", "").attr("disabled", "disabled");
          if (typeof success === "function") success(data);
        }, error);
      }
    }
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
    periscope.util.scrollTop($quizContainer, 30);
  }

  /**
   * Load the content of the page.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {number} scenarioId - the ID of the scenario.
   */
  function loadPageContent(envObj, scenarioId) {
    envObj.getScenarioById(scenarioId, function (data) {
      var limit = 2;
      var scenario = data["data"];
      if ($.isEmptyObject(scenario)) {
        envObj.showErrorPage();
      } else {
        $("#scenario-title").text(scenario["title"]);
        $("#scenario-description").html(scenario["description"]);
        loadMood(envObj, limit);
        loadGame(envObj, limit, scenarioId);
        $("#vision-button").on("click", function () {
          window.location.replace("vision.html" + window.location.search);
        });
        $("#game-button").on("click", function () {
          window.location.replace("game.html" + window.location.search);
        });
        $("#browse-button").on("click", function () {
          window.location.replace("browse.html" + window.location.search);
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
    if (typeof scenarioId !== "undefined") {
      envObj.checkUserConsent(topicId, function () {
        // The user has provided consent
        loadPageContent(envObj, scenarioId);
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