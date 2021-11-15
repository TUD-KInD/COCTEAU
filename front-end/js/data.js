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
  function createScenarioHTML(scenarioId, title, imageSrc, $dataDialog) {
    var html = '<a href="javascript:void(0)" class="flex-column"><img src="' + imageSrc + '"><div>' + title + '</div></a>';
    var $html = $(html).on("click", function () {
      $("#vision-button").attr("href", "browse.html?scenario_id=" + scenarioId);
      $("#opinion-button").attr("href", "answer.html?scenario_id=" + scenarioId);
      $dataDialog.dialog("open");
    });
    return $html;
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
        var widgets = new edaplotjs.Widgets();
        var $dataDialog = widgets.createCustomDialog({
          "selector": "#dialog-data",
          "width": 290,
          "show_cancel_btn": false
        });
        var $scenario = $("#scenario");
        for (var i = 0; i < scenarios.length; i++) {
          var d = scenarios[i];
          var $t = createScenarioHTML(d["id"], d["title"], "img/" + d["image"], $dataDialog);
          $scenario.append($t);
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