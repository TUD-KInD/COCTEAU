(function () {
  "use strict";

  /**
   * Create the html elements for a scenario.
   * @private
   * @param {number} scenarioId - a unique ID for the scenario.
   * @param {string} title - the title of the scenario.
   * @param {string} imageSrc - the source URL of an image for the scenario.
   * @returns {Object} - a jQuery DOM object.
   */
  function createScenarioHTML(scenarioId, title, imageSrc) {
    var html = '<a href="browse.html?scenario_id=' + scenarioId + '" class="flex-column"><img src="' + imageSrc + '"><div>' + title + '</div></a>';
    return $(html);
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
          var $t = createScenarioHTML(d["id"], d["title"], "img/" + d["image"]);
          $scenario.append($t);
        }
        envObj.showPage();
      }
    });
  }

  /**
   * Initialize the page.
   * @private
   * @todo Check if user logged in, if not, show the login dialog.
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