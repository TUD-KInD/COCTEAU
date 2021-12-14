(function () {
  "use strict";

  /**
   * Create the html elements for a scenario.
   * @private
   * @param {string} title - the title of the scenario.
   * @param {string} imageSrc - the source URL of an image for the scenario.
   * @returns {Object} - a jQuery DOM object.
   */
  function createScenarioHTML(title, imageSrc) {
    var html = '<a href="javascript:void(0)" class="flex-column"><img src="' + imageSrc + '"><div>' + title + '</div></a>';
    return $(html);
  }

  /**
   * Add the clicking event to a scenario image (for the experiment mode).
   * @private
   * @param {Object} $element - the jQuery object of the scenario image.
   */
  function addExperimentScenarioClickEvent($element) {
    $element.on("click", function () {
      var d = $(this).data("raw");
      var scenarioId = d["id"];
      var topicId = d["topic_id"];
      var mode = d["mode"]; // system configuration
      var view = d["view"]; // view of the questions to show (e.g., different character background stories)
      var queryString = "?scenario_id=" + scenarioId + "&topic_id=" + topicId + "&mode=" + mode + "&view=" + view + "&page=0";
      window.location.href = "opinion.html" + queryString;
    });
  }

  /**
   * Initialize the user interface.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   */
  function initUI(envObj) {
    envObj.getAllScenario(function (data) {
      var scenarios = data["data"];
      if ($.isEmptyObject(scenarios)) {
        envObj.showErrorPage("Oops, no data (please add scenarios)");
      } else {
        var $scenario = $("#scenario");
        for (var i = 0; i < scenarios.length; i++) {
          var d = scenarios[i];
          if (d["mode"] == 1) {
            // Only show mode 1 for the experiment page
            // Mode 1 means the experiment setting
            var numberOfViews = 5;
            var numberOfConfigs = 3;
            for (var i = 0; i < numberOfViews; i++) {
              for (var j = 0; j < numberOfConfigs; j++) {
                var view = i;
                var mode = j + 1; // override the mode parameter  with different system configurations
                var $t = createScenarioHTML(d["title"] + " (view " + view + ", mode " + mode + ")", "img/" + d["image"]);
                var dCopy = JSON.parse(JSON.stringify(d));
                dCopy["view"] = view
                dCopy["mode"] = mode;
                $t.data("raw", dCopy);
                addExperimentScenarioClickEvent($t);
                $scenario.append($t);
              }
            }
          }
        }
        envObj.showPage();
      }
    });
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