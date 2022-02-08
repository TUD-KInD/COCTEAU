(function () {
  "use strict";

  /**
   * Initialize the page.
   * @private
   */
  function init() {
    var queryParas = periscope.util.parseVars(window.location.search);
    var userPlatformId = queryParas["PROLIFIC_PID"];
    if (typeof userPlatformId !== "undefined") {
      $("#prolific-redirect-text").show();
      $("#prolific-redirect").show();
    } else {
      $("#thank-text").show();
    }
  }
  $(init);
})();
