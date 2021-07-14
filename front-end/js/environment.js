(function () {
  "use strict";

  /**
   * Callback function when the environment is ready.
   * @callback ready
   * @param {Object} envObj - environment object (in environment.js).
   */

  /**
   * Callback function when the environment is failing.
   * @callback fail
   * @param {string} message - the reason why the environment is failing.
   */

  /**
   * Class for setting the environment.
   * This class is used for PERISCOPE tool specific settings.
   * @public
   * @class
   * @param {Object.<string, *>} [settings] - environment settings.
   * @param {ready} [settings.ready] - callback function when the environment is ready.
   * @param {fail} [settings.fail] - callback function when the environment is failing.
   */
  var Environment = function (settings) {
    settings = safeGet(settings, {});
    var ready = settings["ready"];
    var fail = settings["fail"];
    var thisObj = this;
    var userToken;
    var userData;
    var tracker;

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
     * Get the payload part of a JWT (JSON Web Token).
     * @private
     * @param {string} jwt - the JSON Web Token.
     * @returns {Object.<string, *>} - the payload part of the JWT.
     */
    function getJwtPayload(jwt) {
      return JSON.parse(window.atob(jwt.split(".")[1]));
    }

    /**
     * Get the user data.
     * @public
     * @returns {Object.<string, *>} - the user data (i.e., payload of the decoded user JWT).
     */
    this.getUserData = function () {
      return userData;
    };

    /**
     * Get the API root URL.
     * @public
     * @returns {string} - the back-end API root URL.
     */
    var getApiRootUrl = function () {
      var urlHostName = window.location.hostname;
      var url;
      if (urlHostName.indexOf("145.38.198.35") !== -1) {
        // staging back-end
        url = "http://145.38.198.35/api";
      } else if (urlHostName.indexOf("periscope.io.tudelft.nl") !== -1) {
        // production back-end
        url = "https://api.periscope.io.tudelft.nl";
      } else if (urlHostName.indexOf("localhost") !== -1) {
        // developement back-end
        url = "http://localhost:5000";
      }
      return url;
    };
    this.getApiRootUrl = getApiRootUrl;

    /**
     * Initialize the UI for the account dialog.
     * @private
     */
    function initAccountUI() {
      var account = new periscope.Account({
        "signInSuccess": googleSignInSuccess,
        "signOutSuccess": googleSignOutSuccess
      });
      $("#sign-in-prompt").on("click", function () {
        account.getDialog().dialog("open");
      });
    }

    /**
     * Initialize the Google Analytics tracker.
     * @private
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    function initTracker(success, error) {
      var userTokenSuccess = function () {
        if (typeof success === "function") {
          success();
        }
      };
      var userTokenError = function () {
        if (typeof error === "function") {
          error();
        }
      };
      var trackerReady = function (trackerObj) {
        var data = {
          "client_id": trackerObj.getClientId()
        };
        getUserToken(data, userTokenSuccess, userTokenError);
      };
      tracker = new periscope.Tracker({
        "ready": trackerReady
      });
    }

    /**
     * Callback function for a successful Google sign-in.
     * @private
     * @callback
     * @param {Object} accountObj - account object (in account.js).
     * @param {Object} googleUser - user object returned by the Google Sign-In API.
     */
    function googleSignInSuccess(accountObj, googleUser) {
      var data = {
        "google_id_token": googleUser.getAuthResponse().id_token
      };
      var userTokenSuccess = function () {
        // Change the text of the sign-in button and remove the pulsing effect from it
        var $signInPrompt = $("#sign-in-prompt");
        if ($signInPrompt.length > 0) {
          $signInPrompt.find("span").text("Sign Out");
          if ($signInPrompt.hasClass("pulse-primary")) {
            $signInPrompt.removeClass("pulse-primary");
          }
        }
        // Update the user ID
        if (typeof userData !== "undefined") {
          accountObj.updateUserId(userData["user_id"]);
        }
        // Send a login event
        sendTrackerEvent("login", {
          "method": "GoogleLogIn"
        });
      };
      getUserToken(data, userTokenSuccess);
    }

    /**
     * Get user token from the back-end.
     * @private
     * @param {Object} data - the data object to give to the back-end.
     * @param {string} [data.google_id_token] - the token returned by the Google Sign-In API.
     * @param {string} [data.client_id] - the returned Google Analytics client ID or created by the tracker object.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    function getUserToken(data, success, error) {
      $.ajax({
        "url": getApiRootUrl() + "/login/",
        "type": "POST",
        "data": JSON.stringify(data),
        "contentType": "application/json",
        "dataType": "json",
        "success": function (returnData) {
          userToken = returnData["user_token"];
          userData = getJwtPayload(userToken);
          if (typeof success === "function") {
            success(returnData);
          }
        },
        "error": function (xhr) {
          console.error("ERROR when getting user token.");
          console.error(xhr);
          if (typeof error === "function") {
            error();
          }
        }
      });
    }

    /**
     * Get a list of all topics.
     * @public
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAllTopics = function (success, error) {
      $.ajax({
        "url": getApiRootUrl() + "/topic/",
        "type": "GET",
        "dataType": "json",
        "success": function (returnData) {
          if (typeof success === "function") {
            success(returnData);
          }
        },
        "error": function (xhr) {
          console.error("ERROR when getting all topics.");
          console.error(xhr);
          if (typeof error === "function") {
            error();
          }
        }
      });
    };

    /**
     * Get a topic by ID.
     * @public
     * @param {string} topicId - ID of the topic that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getTopicById = function (topicId, success, error) {
      $.ajax({
        "url": getApiRootUrl() + "/topic/?topic_id=" + topicId,
        "type": "GET",
        "dataType": "json",
        "success": function (returnData) {
          if (typeof success === "function") {
            success(returnData);
          }
        },
        "error": function (xhr) {
          console.error("ERROR when getting topic by ID.");
          console.error(xhr);
          if (typeof error === "function") {
            error();
          }
        }
      });
    };

    /**
     * Create a topic.
     * @public
     * @param {string} title - title of the topic.
     * @param {string} description - description of the topic.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.createTopic = function (title, description, success, error) {
      if (typeof title === "undefined") {
        console.error("Topic title cannot be undefined.");
        if (typeof error === "function") {
          error();
        }
      } else if (typeof description === "undefined") {
        console.error("Topic description cannot be undefined.");
        if (typeof error === "function") {
          error();
        }
      } else if (typeof userToken === "undefined") {
        console.error("User token cannot be undefined.");
        if (typeof error === "function") {
          error();
        }
      } else {
        $.ajax({
          "url": getApiRootUrl() + "/topic/",
          "type": "POST",
          "data": JSON.stringify({
            "title": title,
            "description": description,
            "user_token": userToken
          }),
          "contentType": "application/json",
          "dataType": "json",
          "success": function (returnData) {
            if (typeof success === "function") {
              success(returnData);
            }
          },
          "error": function (xhr) {
            console.error("ERROR when creating topic.");
            console.error(xhr);
            if (typeof error === "function") {
              error();
            }
          }
        });
      }
    };

    /**
     * Update a topic.
     * @public
     * @param {string} topicId - ID of the topic that we wish to update.
     * @param {string} [title] - title of the topic.
     * @param {string} [description] - description of the topic.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.updateTopic = function (topicId, title, description, success, error) {
      if (typeof topicId === "undefined") {
        console.error("Topic ID cannot be undefined.");
        if (typeof error === "function") {
          error();
        }
      } else if (typeof userToken === "undefined") {
        console.error("User token cannot be undefined.");
        if (typeof error === "function") {
          error();
        }
      } else if (typeof title === "undefined" && typeof description === "undefined") {
        console.error("Need to specify either title or description.");
        if (typeof error === "function") {
          error();
        }
      } else {
        var data = {
          "topic_id": topicId,
          "user_token": userToken
        };
        if (typeof title !== "undefined") {
          data["title"] = title;
        }
        if (typeof description !== "undefined") {
          data["description"] = description;
        }
        $.ajax({
          "url": getApiRootUrl() + "/topic/",
          "type": "PATCH",
          "data": JSON.stringify(data),
          "contentType": "application/json",
          "dataType": "json",
          "success": function (returnData) {
            if (typeof success === "function") {
              success(returnData);
            }
          },
          "error": function (xhr) {
            console.error("ERROR when updating topic.");
            console.error(xhr);
            if (typeof error === "function") {
              error();
            }
          }
        });
      }
    };

    /**
     * Delete a topic by ID.
     * @public
     * @param {string} topicId - ID of the topic.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.deleteTopic = function (topicId, success, error) {
      if (typeof topicId === "undefined") {
        console.error("Topic ID is undefined.");
        if (typeof error === "function") {
          error();
        }
      } else if (typeof userToken === "undefined") {
        console.error("User token is undefined.");
        if (typeof error === "function") {
          error();
        }
      } else {
        $.ajax({
          "url": getApiRootUrl() + "/topic/",
          "type": "DELETE",
          "data": JSON.stringify({
            "topic_id": topicId,
            "user_token": userToken
          }),
          "contentType": "application/json",
          "dataType": "json",
          "success": function () {
            if (typeof success === "function") {
              success();
            }
          },
          "error": function (xhr) {
            console.error("ERROR when deleting topic.");
            console.error(xhr);
            if (typeof error === "function") {
              error();
            }
          }
        });
      }
    };

    /**
     * Get a list of all scenarios.
     * @public
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAllScenarios = function (success, error) {
      $.ajax({
        "url": getApiRootUrl() + "/scenario/",
        "type": "GET",
        "dataType": "json",
        "success": function (returnData) {
          if (typeof success === "function") {
            success(returnData);
          }
        },
        "error": function (xhr) {
          console.error("ERROR when getting all scenarios.");
          console.error(xhr);
          if (typeof error === "function") {
            error();
          }
        }
      });
    };

    /**
     * Get a list of scenarios by topic ID.
     * @public
     * @param {string} topicId - topic ID of scenarios that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getScenarioByTopicId = function (topicId, success, error) {
      $.ajax({
        "url": getApiRootUrl() + "/scenario/?topic_id=" + topicId,
        "type": "GET",
        "dataType": "json",
        "success": function (returnData) {
          if (typeof success === "function") {
            success(returnData);
          }
        },
        "error": function (xhr) {
          console.error("ERROR when getting scenario by topic ID.");
          console.error(xhr);
          if (typeof error === "function") {
            error();
          }
        }
      });
    };

    /**
     * Get a scenario by ID.
     * @public
     * @param {string} scenarioId - ID of the scenario that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getScenarioById = function (scenarioId, success, error) {
      $.ajax({
        "url": getApiRootUrl() + "/scenario/?scenario_id=" + scenarioId,
        "type": "GET",
        "dataType": "json",
        "success": function (returnData) {
          if (typeof success === "function") {
            success(returnData);
          }
        },
        "error": function (xhr) {
          console.error("ERROR when getting scenario by ID.");
          console.error(xhr);
          if (typeof error === "function") {
            error();
          }
        }
      });
    };

    /**
     * Create a scenario.
     * @public
     * @param {string} title - title of the scenario.
     * @param {string} description - description of the scenario.
     * @param {string} image - image URL of the scenario.
     * @param {string} topicId - topic ID that the scenario is in.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.createScenario = function (title, description, image, topicId, success, error) {
      if (typeof title === "undefined") {
        console.error("Scenario title cannot be undefined.");
        if (typeof error === "function") {
          error();
        }
      } else if (typeof description === "undefined") {
        console.error("Scenario description cannot be undefined.");
        if (typeof error === "function") {
          error();
        }
      } else if (typeof image === "undefined") {
        console.error("Scenario image URL cannot be undefined.");
        if (typeof error === "function") {
          error();
        }
      } else if (typeof topicId === "undefined") {
        console.error("Topic ID of the scenario cannot be undefined.");
        if (typeof error === "function") {
          error();
        }
      } else if (typeof userToken === "undefined") {
        console.error("User token cannot be undefined.");
        if (typeof error === "function") {
          error();
        }
      } else {
        $.ajax({
          "url": getApiRootUrl() + "/scenario/",
          "type": "POST",
          "data": JSON.stringify({
            "title": title,
            "description": description,
            "image": image,
            "topic_id": topicId,
            "user_token": userToken
          }),
          "contentType": "application/json",
          "dataType": "json",
          "success": function (returnData) {
            if (typeof success === "function") {
              success(returnData);
            }
          },
          "error": function (xhr) {
            console.error("ERROR when creating scenario.");
            console.error(xhr);
            if (typeof error === "function") {
              error();
            }
          }
        });
      }
    };

    /**
     * Update a scenario.
     * @public
     * @param {string} scenarioId - ID of the scenario that we wish to update.
     * @param {string} [title] - title of the scenario.
     * @param {string} [description] - description of the scenario.
     * @param {string} [image] - image URL of the scenario.
     * @param {string} [topicId] - topic ID that the scenario is in.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.updateScenario = function (scenarioId, title, description, image, topicId, success, error) {
      if (typeof scenarioId === "undefined") {
        console.error("Scenario ID cannot be undefined.");
        if (typeof error === "function") {
          error();
        }
      } else if (typeof userToken === "undefined") {
        console.error("User token cannot be undefined.");
        if (typeof error === "function") {
          error();
        }
      } else if (typeof title === "undefined" && typeof description === "undefined" && typeof image === "undefined" && typeof topicId === "undefined") {
        console.error("Need to specify either title, description, image URL, or its topic ID.");
        if (typeof error === "function") {
          error();
        }
      } else {
        var data = {
          "scenario_id": scenarioId,
          "user_token": userToken
        };
        if (typeof title !== "undefined") {
          data["title"] = title;
        }
        if (typeof description !== "undefined") {
          data["description"] = description;
        }
        if (typeof image !== "undefined") {
          data["image"] = image;
        }
        if (typeof topicId !== "undefined") {
          data["topic_id"] = topicId;
        }
        $.ajax({
          "url": getApiRootUrl() + "/scenario/",
          "type": "PATCH",
          "data": JSON.stringify(data),
          "contentType": "application/json",
          "dataType": "json",
          "success": function (returnData) {
            if (typeof success === "function") {
              success(returnData);
            }
          },
          "error": function (xhr) {
            console.error("ERROR when updating scenario.");
            console.error(xhr);
            if (typeof error === "function") {
              error();
            }
          }
        });
      }
    };

    /**
     * Delete a scenario by ID.
     * @public
     * @param {string} scenarioId - ID of the scenario.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.deleteScenario = function (scenarioId, success, error) {
      if (typeof scenarioId === "undefined") {
        console.error("Scenario ID is undefined.");
        if (typeof error === "function") {
          error();
        }
      } else if (typeof userToken === "undefined") {
        console.error("User token is undefined.");
        if (typeof error === "function") {
          error();
        }
      } else {
        $.ajax({
          "url": getApiRootUrl() + "/scenario/",
          "type": "DELETE",
          "data": JSON.stringify({
            "scenario_id": scenarioId,
            "user_token": userToken
          }),
          "contentType": "application/json",
          "dataType": "json",
          "success": function () {
            if (typeof success === "function") {
              success();
            }
          },
          "error": function (xhr) {
            console.error("ERROR when deleting scenario.");
            console.error(xhr);
            if (typeof error === "function") {
              error();
            }
          }
        });
      }
    };

    /**
     * Send a Google Analytics tracker event.
     * @public
     * @param {string} action - the action of the tracker (e.g., "page_view").
     * @param {Object.<string, string>} [data] - the data of the tracker (e.g., {"user_id": "1"}).
     */
    var sendTrackerEvent = function (action, data) {
      if (typeof tracker !== "undefined") {
        tracker.sendEvent(action, data);
      }
    };
    this.sendTrackerEvent = sendTrackerEvent;

    /**
     * Callback function for a successful Google sign-out.
     * @public
     * @callback
     * @param {Object} accountObj - account object (in account.js).
     */
    var googleSignOutSuccess = function (accountObj) {
      // Change the text of the sign-in button and add the pulsing effect to it
      var $signInPrompt = $("#sign-in-prompt");
      if ($signInPrompt.length > 0) {
        $signInPrompt.find("span").text("Sign In");
        if (!$signInPrompt.hasClass("pulse-primary")) {
          $signInPrompt.addClass("pulse-primary")
        }
      }
      // Hide the user ID
      accountObj.updateUserId();
      // Send a logout event
      sendTrackerEvent("login", {
        "method": "GoogleLogOut"
      });
    };
    this.googleSignOutSuccess = googleSignOutSuccess;

    /**
     * Class constructor.
     * @constructor
     * @private
     */
    function Environment() {
      initAccountUI();
      initTracker(function () {
        if (typeof ready === "function") ready(thisObj);
      }, function () {
        if (typeof fail === "function") fail("Tracker initialization error.");
      });
    }
    Environment();
  };

  // Register the class to window
  if (window.periscope) {
    window.periscope.Environment = Environment;
  } else {
    window.periscope = {};
    window.periscope.Environment = Environment;
  }
})();