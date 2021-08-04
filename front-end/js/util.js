(function () {
  "use strict";

  /**
   * Class for utility functions.
   * (credit -- https://github.com/CMU-CREATE-Lab/timemachine-viewer/blob/master/js/org/gigapan/util.js)
   * This class is used for functions that can be used across multiple applications.
   * @public
   * @class
   */
  var Util = function () {
    var navigatorUserAgent = navigator.userAgent;
    var isMSIEUserAgent = navigatorUserAgent.match(/MSIE|Trident|Edge/) != null;
    var isOperaUserAgent = navigatorUserAgent.match(/OPR/) != null;
    // The string "Chrome" is found in many user agents of browsers that are not truly Chrome
    var isChromeUserAgent = navigatorUserAgent.match(/Chrome/) != null && !isMSIEUserAgent && !isOperaUserAgent;
    var isSafariUserAgent = navigatorUserAgent.match(/Safari/) != null && !isChromeUserAgent && !isMSIEUserAgent;
    var isFirefoxUserAgent = navigatorUserAgent.match(/Firefox/) != null;

    /**
     * Parse and return variables in the format of a hash URL string.
     * @public
     * @returns {Object.<string, string>} - the query or hash parameters.
     */
    this.parseVars = function (str, keepNullOrUndefinedVars) {
      var vars = {};
      if (str) {
        var keyvals = str.split(/[#?&]/);
        for (var i = 0; i < keyvals.length; i++) {
          var keyval = keyvals[i].split('=');
          vars[keyval[0]] = keyval[1];
        }
      }
      // Delete keys with null/undefined values
      if (!keepNullOrUndefinedVars) {
        Object.keys(vars).forEach(function (key) {
          return (vars[key] == null || key == "") && delete vars[key];
        });
      }
      return vars;
    };

    /**
     * Resize a jQuery dialog to fit the screen.
     * @public
     * @param {Object} $dialog - a jQuery dialog object.
     */
    this.fitDialogToScreen = function ($dialog) {
      var $window = $(window);
      $dialog.parent().css({
        "width": $window.width(),
        "height": $window.height(),
        "left": 0,
        "top": 0
      });
      $dialog.dialog("option", "height", $window.height());
      $dialog.dialog("option", "width", $window.width());
    };

    /**
     * A helper for getting data safely with a default value.
     * @public
     * @param {*} v - the original value.
     * @param {*} defaultVal - the default value to return when the original one is undefined.
     * @returns {*} - the original value (if not undefined) or the default value.
     */
    var safeGet = function (v, defaultVal) {
      if (typeof defaultVal === "undefined") defaultVal = "";
      return (typeof v === "undefined") ? defaultVal : v;
    };
    this.safeGet = safeGet;

    /**
     * Scroll to an element's top position.
     * @public
     * @param {object} $element - a jQuery object to scroll to.
     * @param {number} [topMargin] - the top margin to reserve for scrolling.
     * @param {object} [$window] - a jQuery object that we want to scroll.
     */
    this.scrollTop = function ($element, topMargin, $window) {
      topMargin = safeGet(topMargin, 0);
      $window = safeGet($window, $(window));
      var p = $element.offset();
      if (typeof p !== "undefined") {
        $window.scrollTop(Math.max(p.top - topMargin, 0));
      }
    };

    /**
     * Check if the browser is Firefox.
     * @public
     * @returns {boolean} - is Firefox or not.
     */
    this.isFirefox = function () {
      return isFirefoxUserAgent;
    };

    /**
     * Check if the browser is Safari.
     * @public
     * @returns {boolean} - is Safari or not.
     */
    this.isSafari = function () {
      return isSafariUserAgent;
    };

    /**
     * Check if the browser is Chrome.
     * @public
     * @returns {boolean} - is Chrome or not.
     */
    this.isChrome = function () {
      return isChromeUserAgent;
    };
  };

  // Create the object and register it to window
  if (window.periscope) {
    window.periscope.util = new Util();
  } else {
    window.periscope = {};
    window.periscope.util = new Util();
  }
})();