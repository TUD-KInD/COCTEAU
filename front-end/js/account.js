(function () {
  "use strict";

  /**
   * Callback function for a successful Google sign-in.
   * @callback signInSuccess
   * @param {Object} accountObj - account object (in account.js).
   * @param {Object} googleUser - user object returned by the Google Sign-In API.
   */

  /**
   * Callback function for a successful Google sign-out.
   * @callback signOutSuccess
   * @param {Object} accountObj - account object (in account.js).
   */

  /**
   * Class for signing in and out with Google's account.
   * @public
   * @class
   * @param {Object.<string, *>} [settings] - dialog settings.
   * @param {signInSuccess} [settings.signInSuccess] - callback function for a successful sign-in.
   * @param {signOutSuccess} [settings.signOutSuccess] - callback function for a successful sign-out.
   * @param {boolean} [settings.noUI=false] - indicate that UI (the dialog box) is needed or not.
   */
  var Account = function (settings) {
    settings = safeGet(settings, {});
    var $accountDialog;
    var $googleSignOutButton;
    var $googleSignInButton;
    var $guestButton;
    var $signInText;
    var $helloText;
    var $userNameText;
    var $userIdText;
    var $userIdSentence;
    var widgets = new edaplotjs.Widgets();
    var signInSuccess = settings["signInSuccess"];
    var signOutSuccess = settings["signOutSuccess"];
    var noUI = safeGet(settings["noUI"], false);
    var thisObj = this;

    /**
     * Initialize the user interface.
     * @private
     */
    function initUI() {
      createDialogUI();
      $signInText = $("#sign-in-text");
      $helloText = $("#hello-text");
      $userNameText = $("#user-name-text");
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
     * Create the user interface of the dialog box.
     * @private
     */
    function createDialogUI() {
      var html = "";
      html += '<div id="account-dialog" class="custom-dialog-large" title="Account" data-role="none">';
      html += '  <p id="sign-in-text">Sign in to track your personal achievements.</p>';
      html += '  <div id="hello-text">';
      html += '    <p>';
      html += '      Hi <span id="user-name-text"></span>, thank you for signing in.';
      html += '      <span id="user-id-sentence">Your user ID is <span id="user-id-text"></span>.</span>';
      html += '    </p>';
      html += '  </div>';
      html += '  <div id="google-sign-in-button" class="g-signin2"></div>';
      html += '  <button id="google-sign-out-button" class="custom-button">Sign out from Google</button>';
      html += '  <button id="guest-button" class="custom-button">Continue as guest</button>';
      html += '</div>';
      $("body").append($(html));
      $accountDialog = widgets.createCustomDialog({
        "selector": "#account-dialog",
        "width": 285,
        "show_cancel_btn": false
      });
    }

    /**
     * Sign out from Google.
     * @private
     */
    function googleSignOut() {
      var auth2 = gapi.auth2.getAuthInstance();
      auth2.signOut().then(function () {
        auth2.disconnect();
        onGoogleSignOutSuccess();
      });
    }

    /**
     * A handler when signing out from Google successfully.
     * @private
     */
    function onGoogleSignOutSuccess() {
      $googleSignOutButton.hide();
      $googleSignInButton.show();
      $guestButton.show();
      $signInText.show();
      $helloText.hide();
      var $content = $googleSignInButton.find(".abcRioButtonContents");
      var $hidden = $content.find(":hidden");
      var $visible = $content.find(":visible");
      $hidden.show();
      $visible.hide();
      if (typeof signOutSuccess === "function") {
        signOutSuccess(thisObj);
      }
    }

    /**
     * Render the Google Sign-In button.
     * @private
     */
    function renderGoogleSignInButton() {
      gapi.signin2.render("google-sign-in-button", {
        scope: "profile email",
        prompt: "select_account",
        width: 231,
        height: 46,
        longtitle: true,
        theme: "dark",
        onsuccess: onGoogleSignInSuccess
      });
    }

    /**
     * A handler when signing in with Google successfully.
     * @private
     */
    function onGoogleSignInSuccess(googleUser) {
      var profile = googleUser.getBasicProfile();
      $guestButton.hide();
      $googleSignOutButton.show();
      $userNameText.text(profile.getGivenName());
      $helloText.show();
      $signInText.hide();
      $googleSignInButton.hide();
      $accountDialog.dialog("close");
      if (typeof signInSuccess === "function") {
        signInSuccess(thisObj, googleUser);
      }
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
     * Check if the user already signed in with Google.
     * @public
     * @param {Object.<string, function>} [callback] - callback functions.
     * @param {function} [callback.error] - callback function when errors happen.
     * @param {function} [callback.success] - callback function when signing in successfully.
     */
    var isAuthenticatedWithGoogle = function (callback) {
      callback = safeGet(callback, {});
      if (typeof gapi !== "undefined" && typeof gapi.auth2 === "undefined") {
        gapi.load("auth2", function () {
          gapi.auth2.init().then(function () {
            isAuthenticatedWithGoogle(callback);
          }, function (error) {
            if (typeof error !== "undefined") {
              if (typeof callback["error"] === "function") {
                callback["error"](error);
              }
            }
          });
        });
      } else {
        if (typeof callback["success"] === "function") {
          var auth2 = gapi.auth2.getAuthInstance();
          var is_signed_in = auth2.isSignedIn.get();
          if (is_signed_in) {
            callback["success"](is_signed_in, auth2.currentUser.get());
          } else {
            callback["success"](is_signed_in);
          }
        }
      }
    };
    this.isAuthenticatedWithGoogle = isAuthenticatedWithGoogle;

    /**
     * Sign in with Google on the background.
     * (used when the user has signed in with Google before)
     * @public
     * @param {Object.<string, function>} [callback] - callback functions.
     * @param {function} [callback.error] - callback function when errors happen.
     * @param {function} [callback.success] - callback function when signing in successfully.
     */
    this.silentSignInWithGoogle = function (callback) {
      callback = safeGet(callback, {});
      gapi.load("auth2", function () {
        // gapi.auth2.init() will automatically sign in a user to the application if previously signed in
        gapi.auth2.init().then(function () {
          if (typeof callback["success"] === "function") {
            var auth2 = gapi.auth2.getAuthInstance();
            var is_signed_in = auth2.isSignedIn.get();
            if (is_signed_in) {
              callback["success"](is_signed_in, auth2.currentUser.get());
            } else {
              callback["success"](is_signed_in);
            }
          }
        }, function (error) {
          if (typeof error !== "undefined") {
            if (typeof callback["error"] === "function") {
              callback["error"](error);
            }
          }
        });
      });
    };

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
     * Class constructor.
     * @constructor
     * @private
     */
    function Account() {
      if (noUI) {
        return;
      } else {
        initUI();
      }
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