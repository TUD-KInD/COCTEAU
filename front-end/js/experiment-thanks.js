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
      $("#prolific-redirect").show();
    }
  }
  $(init);
})();