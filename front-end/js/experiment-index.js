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
      var queryString = "?scenario_id=" + d["id"] + "&topic_id=" + d["topic_id"] + "&page=0";
      window.location.href = "experiment-opinion.html" + queryString;
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
          if (d["mode"] >= 1) {
            // Only show the scenarios that are for experiments (mode 0 means the normal interaction mode)
            var $t = createScenarioHTML(d["title"] + " (mode " + d["mode"] + ", view " + d["view"] + ")", "img/" + d["image"]);
            $t.data("raw", d);
            addExperimentScenarioClickEvent($t);
            $scenario.append($t);
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