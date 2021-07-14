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
    });
  }

  /**
   * Load and display memes.
   * @private
   * @param {number} scenarioId - the ID of the scenario.
   */
  function loadMemes(scenarioId) {
    $.getJSON("file/browse.json", function (data) {
      if (scenarioId in data) {
        var $browse = $("#browse");
        for (var i = 0; i < data[scenarioId].length; i++) {
          var t = data[scenarioId][i];
          var caption;
          var imageSrc;
          var credit;
          for (var j = 0; j < t["media"].length; j++) {
            var s = t["media"][j];
            if (s["media_type"] == "image") {
              imageSrc = s["url"];
              caption = s["description"];
              credit = 'Credit: <a href="' + s["unsplash_creator_url"] + '" target="_blank">' + s["unsplash_creator_name"] + '</a>';
            }
          }
          var $t = createMemeHTML(caption, imageSrc, credit);
          $browse.append($t);
        }
      }
    });
  }

  /**
   * Create the html elements for a meme.
   * @private
   * @param {string} caption - the caption of the meme.
   * @param {string} imageSrc - the source URL of an image for the meme.
   * @param {string} credit - the credit of the photo.
   * @returns {Object} - a jQuery DOM object.
   */
  function createMemeHTML(caption, imageSrc, credit) {
    // This is a hack for Firefox, since Firefox does not respect the CSS "break-inside" and "page-break-inside"
    // We have to set the CSS display to "inline-flex" to prevent Firefox from breaking the figure in the middle
    // But, setting display to inline-flex will cause another problem in Chrome, where the columns will not be balanced
    // So we want Chrome to use "display: flex", and we want Firefox to use "display: inline-flex"
    var html = '<figure>';
    if (periscope.util.isFirefox()) {
      html = '<figure style="display: inline-flex">';
    }
    html += '<img src="' + imageSrc + '"><div>' + credit + '</div><figcaption>' + caption + '</figcaption></figure>';
    return $(html);
  }

  /**
   * Initialize the page.
   * @private
   */
  function init() {
    var queryParas = periscope.util.parseVars(window.location.search);
    var scenarioId = "scenario_id" in queryParas ? queryParas["scenario_id"] : undefined;
    if (typeof scenarioId !== "undefined") {
      loadScenario(scenarioId);
      loadMemes(scenarioId);
    }
  }
  $(init);
})();