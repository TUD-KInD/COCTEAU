(function () {
  "use strict";

  /**
   * Callback function for a successful Google sign-in.
   * @callback signInSuccess
   * @param {Object} accountObj - account object (in account.js).
   * @param {Object} response - response returned by the Google Sign-In API.
   */

  /**
   * Callback function for a successful Google sign-out.
   * @callback signOutSuccess
   * @param {Object} accountObj - account object (in account.js).
   */

  /**
   * Callback function when the object is ready.
   * @callback ready
   * @param {Object} accountObj - account object (in account.js).
   */

  /**
   * Class for signing in and out with Google's account.
   * @public
   * @class
   * @param {Object.<string, *>} [settings] - dialog settings.
   * @param {ready} [settings.ready] - callback function when the object is ready.
   * @param {signInSuccess} [settings.signInSuccess] - callback function for a successful sign-in.
   * @param {signOutSuccess} [settings.signOutSuccess] - callback function for a successful sign-out.
   */
  var Account = function (settings) {
    settings = safeGet(settings, {});
    var $accountDialog;
    var $googleSignOutButton;
    var $googleSignInButton;
    var $guestButton;
    var $signInText;
    var $helloText;
    var $userIdText;
    var $userIdSentence;
    var widgets = new edaplotjs.Widgets();
    var signInSuccess = settings["signInSuccess"];
    var signOutSuccess = settings["signOutSuccess"];
    var ready = settings["ready"];
    var thisObj = this;

    /**
     * Initialize the user interface.
     * @private
     */
    function initUI() {
      createDialogUI();
      $signInText = $("#sign-in-text");
      $helloText = $("#hello-text");
      $userIdText = $("#user-id-text");
      $userIdSentence = $("#user-id-sentence");
      $googleSignOutButton = $("#google-sign-out-button");
      $googleSignInButton = $("#google-sign-in-button");
      $guestButton = $("#guest-button");
      $googleSignOutButton.on("click", function () {
        googleSignOut();
      });
      $guestButton.on("click", function () {
        $accountDialog.dialog("close");
      });
      renderGoogleSignInButton();
    }

    /**
     * Get the client ID for the Google Sign-In API.
     * @private
     * @returns {string} - the client ID for the Google Sign-In API.
     */
    function getGoogleSignInClientId() {
      var urlHostName = window.location.hostname;
      var gid;
      if (urlHostName.indexOf("145.38.198.35") !== -1) {
        // staging back-end
        gid = "878004336244-j1s2d006vt99evg8k92oiu8gegoiah9h.apps.googleusercontent.com";
      } else if (urlHostName.indexOf("staging") !== -1) {
        // staging back-end
        gid = "878004336244-j1s2d006vt99evg8k92oiu8gegoiah9h.apps.googleusercontent.com";
      } else if (urlHostName.indexOf("periscope.io.tudelft.nl") !== -1) {
        // production back-end
        gid = "878004336244-5s4m7msoevi271o26550r0t2qjvuena3.apps.googleusercontent.com";
      } else if (urlHostName.indexOf("localhost") !== -1) {
        // developement back-end
        gid = "878004336244-j1s2d006vt99evg8k92oiu8gegoiah9h.apps.googleusercontent.com";
      }
      return gid;
    }

    /**
     * Load a script asynchronously.
     * @private
     * @param {string} scriptUrl - URL of the script.
     * @returns {Promise} - Promise object for loading a script asynchronously.
     */
    function loaderScript(scriptUrl) {
      return new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = scriptUrl;
        script.type = "text/javascript";
        script.onError = reject;
        script.async = true;
        script.onload = resolve;
        script.addEventListener("error", reject);
        script.addEventListener("load", resolve);
        document.head.appendChild(script);
      });
    }

    /**
     * Create the user interface of the dialog box.
     * @private
     */
    function createDialogUI() {
      var html = "";
      html += '<div id="account-dialog" class="custom-dialog-large" title="Account" data-role="none">';
      html += '  <p id="sign-in-text">';
      html += '    Sign in to track your data.';
      html += '    We will <b>NOT</b> store your personal information (e.g., email).';
      html += '    Your information is only used to verify your identity.';
      html += '  </p>';
      html += '  <div id="hello-text">';
      html += '    <p>';
      html += '      Thank you for signing in.';
      html += '      <span id="user-id-sentence">Your anonymous user ID is <span id="user-id-text"></span>.</span>';
      html += '    </p>';
      html += '  </div>';
      html += '  <div id="google-sign-in-button" class="g_id_signin"></div>';
      html += '  <button id="google-sign-out-button" class="custom-button" class="g_id_signout">Sign out from Google</button>';
      html += '  <button id="guest-button" class="custom-button">Continue as guest</button>';
      html += '</div>';
      $("body").append($(html));
      $accountDialog = widgets.createCustomDialog({
        "selector": "#account-dialog",
        "width": 290,
        "show_cancel_btn": false
      });
    }

    /**
     * Sign out from Google.
     * @private
     */
    function googleSignOut() {
      google.accounts.id.disableAutoSelect();
      $googleSignOutButton.hide();
      $googleSignInButton.show();
      $guestButton.show();
      $signInText.show();
      $helloText.hide();
      if (typeof signOutSuccess === "function") {
        signOutSuccess(thisObj);
      }
    }

    /**
     * Render the Google Sign-In button.
     * @private
     */
    function renderGoogleSignInButton() {
      google.accounts.id.renderButton(
        document.getElementById("google-sign-in-button"), {
          type: "standard",
          theme: "filled_blue",
          shape: "rectangular",
          width: 225,
          auto_select: true,
          locale: "en_US"
        }
      );
    }

    /**
     * A helper for getting data safely with a default value.
     * @private
     * @param {*} v - the original value.
     * @param {*} defaultVal - the default value to return when the original one is undefined.
     * @returns {*} - the original value (if not undefined) or the default value.
     */
    function safeGet(v, defaultVal) {
      if (typeof defaultVal === "undefined") defaultVal = "";
      return (typeof v === "undefined") ? defaultVal : v;
    }

    /**
     * A helper for getting the jQuery dialog object.
     * @public
     * @returns {Object} - the jQuery dialog object.
     */
    this.getDialog = function () {
      return $accountDialog;
    };

    /**
     * Update the user ID text on the dialog box.
     * @public
     * @param {string} user_id - the user ID returned from the back-end.
     */
    this.updateUserId = function (user_id) {
      if (typeof $userIdText !== "undefined") {
        if (typeof user_id !== "undefined") {
          $userIdText.text(user_id);
          $userIdSentence.show();
        } else {
          $userIdSentence.hide();
        }
      } else {
        $userIdSentence.hide();
      }
    };

    /**
     * Handle the situation when the Google Sign-In API returns a user credential.
     * @private
     */
    function handleCredentialResponse(response, select_by) {
      console.log("Google Sign-In by:", select_by);
      $guestButton.hide();
      $googleSignOutButton.show();
      $helloText.show();
      $signInText.hide();
      $googleSignInButton.hide();
      $accountDialog.dialog("close");
      if (typeof signInSuccess === "function") {
        signInSuccess(thisObj, response);
      }
    }

    /**
     * Load and initialize the Google Sign-In API.
     * @private
     */
    function loadGoogleSignInAPI() {
      window.onGoogleLibraryLoad = function () {
        google.accounts.id.initialize({
          client_id: getGoogleSignInClientId(),
          callback: handleCredentialResponse
        });
        initUI();
        ready(thisObj);
      };
      // Load the Google Sign-In API script
      loaderScript("https://accounts.google.com/gsi/client");
    }

    /**
     * Class constructor.
     * @constructor
     * @private
     */
    function Account() {
      loadGoogleSignInAPI();
    }
    Account();
  };

  // Register the class to window
  if (window.periscope) {
    window.periscope.Account = Account;
  } else {
    window.periscope = {};
    window.periscope.Account = Account;
  }
})();