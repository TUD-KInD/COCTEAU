(function () {
  "use strict";

  /**
   * Load and display all scenarioa.
   * @private
   */
  function loadAllScenarios() {
    $.getJSON("file/scenario.json", function (data) {
      var $scenario = $("#scenario");
      Object.keys(data).forEach(function (scenarioId) {
        var t = data[scenarioId];
        var $t = createScenarioHTML(t["id"], t["topic_id"], t["title"], t["image"]);
        $scenario.append($t);
      });
    });
  }

  /**
   * Create the html elements for a scenario.
   * @private
   * @param {string} scenarioId - a unique ID for the scenario.
   * @param {string} topicId - a unique ID for the topic.
   * @param {string} title - the title of the scenario.
   * @param {string} imageSrc - the source URL of an image for the scenario.
   * @returns {Object} - a jQuery DOM object.
   */
  function createScenarioHTML(scenarioId, topicId, title, imageSrc) {
    var html = '<a href="opinion.html?topic_id=' + topicId + '&scenario_id=' + scenarioId + '" class="flex-column"><img src="' + imageSrc + '"><div>' + title + '</div></a>';
    return $(html);
  }

  /**
   * Initialize the page.
   * @private
   * @todo Display an error page when there is an error in creating the environment.
   * @todo Check if user logged in, if not, show the login dialog.
   */
  function init() {
    loadAllScenarios();
    var env = new periscope.Environment({
      "ready": function (envObj) {
        console.log("ready");
      },
      "fail": function (message) {
        console.error(message);
      }
    });
  }
  $(init);
})();