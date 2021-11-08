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
      } else if (urlHostName.indexOf("staging") !== -1) {
        // staging back-end
        url = "https://staging.api.periscope.io.tudelft.nl";
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
      var accountObj = new periscope.Account({
        "signInSuccess": function (accountObj, googleUserObj) {
          getUserTokenWrapper(googleUserObj, function () {
            handleGoogleSignInSuccessUI(accountObj);
          });
        },
        "signOutSuccess": function (accountObj) {
          getUserTokenWrapper(undefined, function () {
            handleGoogleSignOutSuccessUI(accountObj);
          });
        }
      });
      $("#sign-in-prompt").on("click", function () {
        accountObj.getDialog().dialog("open");
      });
      return accountObj;
    }

    /**
     * Get user token from the back-end.
     * @private
     * @param {Object.<string, *>} data - the data object to give to the back-end.
     * @param {string} [data.google_id_token] - the token returned by the Google Sign-In API.
     * @param {string} [data.client_id] - the returned Google Analytics client ID or created by the tracker object.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    function getUserToken(data, success, error) {
      generalRequest("POST", "/login/", data, function (returnData) {
        userToken = returnData["user_token"];
        userData = getJwtPayload(userToken);
        if (typeof success === "function") {
          success(returnData);
        }
      }, function () {
        console.error("ERROR when getting user token.");
        if (typeof error === "function") {
          error();
        }
      });
    }

    /**
     * General function for the HTTP request.
     * @private
     * @param {string} requestType - type for the request ("GET", "POST", "PATCH", or "DELETE").
     * @param {string} path - path for the request.
     * @param {Object.<string, *>} [data] - data for the request.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    function generalRequest(requestType, path, data, success, error) {
      var request = {
        "url": getApiRootUrl() + path,
        "type": requestType,
        "dataType": "json",
        "success": function (returnData) {
          if (typeof success === "function") {
            success(returnData);
          }
        },
        "error": function (xhr) {
          console.error(xhr);
          if (typeof error === "function") {
            error();
          }
          showErrorPage();
        }
      };
      if (requestType != "GET") {
        request["data"] = JSON.stringify(data);
        request["contentType"] = "application/json";
        request["dataType"] = "json";
      }
      $.ajax(request);
    }

    /**
     * General function for the GET request.
     * @private
     * @param {string} path - path for the GET request.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    function generalGet(path, success, error) {
      generalRequest("GET", path, undefined, success, error);
    }

    /**
     * General function for the DELETE request.
     * @private
     * @param {string} path - path for the DELETE request.
     * @param {Object.<string, *>} data - data for the DELETE request.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    function generalDelete(path, data, success, error) {
      data["user_token"] = userToken;
      generalRequest("DELETE", path, data, success, error);
    }

    /**
     * General function for the POST request.
     * @private
     * @param {string} path - path for the POST request.
     * @param {Object.<string, *>} data - data for the POST request.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    function generalPost(path, data, success, error) {
      data["user_token"] = userToken;
      generalRequest("POST", path, data, success, error);
    }

    /**
     * General function for the PATCH request.
     * @private
     * @param {string} path - path for the PATCH request.
     * @param {Object.<string, *>} data - data for the PATCH request.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    function generalPatch(path, data, success, error) {
      data["user_token"] = userToken;
      generalRequest("PATCH", path, data, success, error);
    }

    /**
     * Get a list of all topics.
     * @public
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAllTopic = function (success, error) {
      generalGet("/topic/", success, error);
    };

    /**
     * Get a topic by ID.
     * @public
     * @param {number} topicId - ID of the topic that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getTopicById = function (topicId, success, error) {
      generalGet("/topic/?topic_id=" + topicId, success, error);
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
      var data = {
        "title": title,
        "description": description
      };
      generalPost("/topic/", data, success, error);
    };

    /**
     * Update a topic.
     * @public
     * @param {number} topicId - ID of the topic that we wish to update.
     * @param {string} [title] - title of the topic.
     * @param {string} [description] - description of the topic.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.updateTopic = function (topicId, title, description, success, error) {
      var data = {
        "topic_id": topicId
      };
      if (typeof title !== "undefined") {
        data["title"] = title;
      }
      if (typeof description !== "undefined") {
        data["description"] = description;
      }
      generalPatch("/topic/", data, success, error);
    };

    /**
     * Delete a topic by ID.
     * @public
     * @param {number} topicId - ID of the topic.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.deleteTopic = function (topicId, success, error) {
      var data = {
        "topic_id": topicId
      };
      generalDelete("/topic/", data, success, error);
    };

    /**
     * Get a list of all scenarios.
     * @public
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAllScenario = function (success, error) {
      generalGet("/scenario/", success, error);
    };

    /**
     * Get a list of scenarios by topic ID.
     * @public
     * @param {number} topicId - topic ID of scenarios that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getScenarioByTopicId = function (topicId, success, error) {
      generalGet("/scenario/?topic_id=" + topicId, success, error);
    };

    /**
     * Get a scenario by ID.
     * @public
     * @param {number} scenarioId - ID of the scenario that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getScenarioById = function (scenarioId, success, error) {
      generalGet("/scenario/?scenario_id=" + scenarioId, success, error);
    };

    /**
     * Create a scenario.
     * @public
     * @param {string} title - title of the scenario.
     * @param {string} description - description of the scenario.
     * @param {string} image - image URL of the scenario.
     * @param {number} topicId - topic ID that the scenario is in.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.createScenario = function (title, description, image, topicId, success, error) {
      var data = {
        "title": title,
        "description": description,
        "image": image,
        "topic_id": topicId
      };
      generalPost("/scenario/", data, success, error);
    };

    /**
     * Update a scenario.
     * @public
     * @param {number} scenarioId - ID of the scenario that we wish to update.
     * @param {string} [title] - title of the scenario.
     * @param {string} [description] - description of the scenario.
     * @param {string} [image] - image URL of the scenario.
     * @param {string} [topicId] - topic ID that the scenario is in.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.updateScenario = function (scenarioId, title, description, image, topicId, success, error) {
      var data = {
        "scenario_id": scenarioId
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
      generalPatch("/scenario/", data, success, error);
    };

    /**
     * Delete a scenario by ID.
     * @public
     * @param {number} scenarioId - ID of the scenario.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.deleteScenario = function (scenarioId, success, error) {
      var data = {
        "scenario_id": scenarioId
      };
      generalDelete("/scenario/", data, success, error);
    };

    /**
     * Get a list of all questions.
     * @public
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAllQuestion = function (success, error) {
      generalGet("/question/", success, error);
    };

    /**
     * Get a list of questions by topic ID.
     * @public
     * @param {number} topicId - topic ID of questions that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getQuestionByTopicId = function (topicId, success, error) {
      generalGet("/question/?topic_id=" + topicId, success, error);
    };

    /**
     * Get a list of questions by scenario ID.
     * @public
     * @param {number} scenarioId - scenario ID of questions that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getQuestionByScenarioId = function (scenarioId, success, error) {
      generalGet("/question/?scenario_id=" + scenarioId, success, error);
    };

    /**
     * Get a question by ID.
     * @public
     * @param {number} questionId - ID of the question that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getQuestionById = function (questionId, success, error) {
      generalGet("/question/?question_id=" + questionId, success, error);
    };

    /**
     * The object for the "Choice" database table.
     * @typedef {Object} Choice
     * @property {string} text - text of the choice.
     * @property {number} value - value of the choice.
     */

    /**
     * Create a question.
     * @private
     * @param {string} text - text of the question.
     * @param {Choice[]} [choices] - choices of the question.
     * @param {string} [topicId] - topic ID that the question is in (for demographic questions).
     * @param {string} [scenarioId] - scenario ID that the question is in (for scenario quesions).
     * @param {boolean} [isMulitpleChoice] - indicate if the question allows multiple choices.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.createQuestion = function (text, choices, topicId, scenarioId, isMulitpleChoice, success, error) {
      var data = {
        "text": text
      };
      if (typeof choices !== "undefined") {
        data["choices"] = choices;
      }
      if (typeof topicId !== "undefined") {
        data["topic_id"] = topicId;
      }
      if (typeof scenarioId !== "undefined") {
        data["scenario_id"] = scenarioId;
      }
      if (typeof isMulitpleChoice !== "undefined") {
        data["is_mulitple_choice"] = isMulitpleChoice;
      }
      generalPost("/question/", data, success, error);
    };

    /**
     * Update a question.
     * @private
     * @param {number} questionId - ID of the question.
     * @param {string} [text] - text of the question.
     * @param {Choice[]} [choices] - choices of the question.
     * @param {string} [topicId] - topic ID that the question is in (for demographic questions).
     * @param {string} [scenarioId] - scenario ID that the question is in (for scenario quesions).
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.updateQuestion = function (questionId, text, choices, topicId, scenarioId, success, error) {
      var data = {
        "question_id": questionId
      };
      if (typeof text !== "undefined") {
        data["text"] = text;
      }
      if (typeof choices !== "undefined") {
        data["choices"] = choices;
      }
      if (typeof topicId !== "undefined") {
        data["topic_id"] = topicId;
      }
      if (typeof scenarioId !== "undefined") {
        data["scenario_id"] = scenarioId;
      }
      generalPatch("/question/", data, success, error);
    };

    /**
     * Delete a question by ID.
     * @public
     * @param {number} questionId - ID of the question.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.deleteQuestion = function (questionId, success, error) {
      var data = {
        "question_id": questionId
      };
      generalDelete("/question/", data, success, error);
    };

    /**
     * Get a list of all moods.
     * @public
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAllMood = function (success, error) {
      generalGet("/mood/", success, error);
    };

    /**
     * Get a mood by ID.
     * @public
     * @param {number} moodId - ID of the mood that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getMoodById = function (moodId, success, error) {
      generalGet("/mood/?mood_id=" + moodId, success, error);
    };

    /**
     * Create a mood.
     * @public
     * @param {string} name - name of the mood.
     * @param {string} [image] - image of the mood.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.createMood = function (name, image, success, error) {
      var data = {
        "name": name
      };
      if (typeof image !== "undefined") {
        data["image"] = image;
      }
      generalPost("/mood/", data, success, error);
    };

    /**
     * Update a mood.
     * @public
     * @param {number} moodId - ID of the mood that we wish to update.
     * @param {string} [name] - name of the mood.
     * @param {string} [image] - image of the mood.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.updateMood = function (moodId, name, image, success, error) {
      var data = {
        "mood_id": moodId
      };
      if (typeof name !== "undefined") {
        data["name"] = name;
      }
      if (typeof image !== "undefined") {
        data["image"] = image;
      }
      generalPatch("/mood/", data, success, error);
    };

    /**
     * Delete a mood by ID.
     * @public
     * @param {number} moodId - ID of the mood.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.deleteMood = function (moodId, success, error) {
      var data = {
        "mood_id": moodId
      };
      generalDelete("/mood/", data, success, error);
    };

    /**
     * Get a list of all visions.
     * @public
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAllVision = function (success, error) {
      generalGet("/vision/?paginate=0", success, error);
    };

    /**
     * Get a list of visions by scenario ID.
     * @public
     * @param {number} scenarioId - scenario ID of visions that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getVisionByScenarioId = function (scenarioId, success, error) {
      generalGet("/vision/?paginate=0&scenario_id=" + scenarioId, success, error);
    };

    /**
     * Get a list of visions by user ID.
     * @public
     * @param {number} userId - user ID of visions that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getVisionByUserId = function (userId, success, error) {
      generalGet("/vision/?paginate=0&user_id=" + userId, success, error);
    };

    /**
     * Get a vision by ID.
     * @public
     * @param {number} visionId - ID of the vision that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getVisionById = function (visionId, success, error) {
      generalGet("/vision/?vision_id=" + visionId, success, error);
    };

    /**
     * Create a vision.
     * @public
     * @param {number} moodId - mood ID of a vision.
     * @param {number} scenarioId - scenario ID of a vision.
     * @param {string} description - description of a vision.
     * @param {string} url - image URL of a vision.
     * @param {string} unsplashImageId - image ID of the unsplash image (https://unsplash.com/photos/[unsplashImageId]).
     * @param {string} unsplashCreatorName - creator Name of the unsplash image.
     * @param {string} unsplashCreatorUrl - creator URL of the unsplash image (e.g., https://unsplash.com/@xxx).
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.createVision = function (moodId, scenarioId, description, url, unsplashImageId, unsplashCreatorName, unsplashCreatorUrl, success, error) {
      var data = {
        "mood_id": moodId,
        "medias": [{
          "description": description,
          "type": "IMAGE",
          "url": url,
          "unsplash_image_id": unsplashImageId,
          "unsplash_creator_name": unsplashCreatorName,
          "unsplash_creator_url": unsplashCreatorUrl
        }],
        "scenario_id": scenarioId,
      };
      generalPost("/vision/", data, success, error);
    };

    /**
     * Update a vision.
     * @public
     * @param {number} visionId - ID of the vision that we wish to update.
     * @param {string} [moodId] - mood ID of a vision.
     * @param {string} [description] - description of a vision.
     * @param {string} [url] - image URL of a vision.
     * @param {string} [unsplashImageId] - image ID of the unsplash image (https://unsplash.com/photos/[unsplashImageId]).
     * @param {string} [unsplashCreatorName] - creator Name of the unsplash image.
     * @param {string} [unsplashCreatorUrl] - creator URL of the unsplash image (e.g., https://unsplash.com/@xxx).
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.updateVision = function (visionId, moodId, description, url, unsplashImageId, unsplashCreatorName, unsplashCreatorUrl, success, error) {
      var data = {
        "vision_id": visionId
      };
      if (typeof moodId !== "undefined") {
        data["mood_id"] = moodId;
      }
      if (typeof description !== "undefined" && typeof url !== "undefined" && typeof unsplashImageId !== "undefined" && typeof unsplashCreatorName !== "undefined" && typeof unsplashCreatorUrl !== "undefined") {
        data["medias"] = [{
          "description": description,
          "type": "IMAGE",
          "url": url,
          "unsplash_image_id": unsplashImageId,
          "unsplash_creator_name": unsplashCreatorName,
          "unsplash_creator_url": unsplashCreatorUrl
        }];
      } else {
        console.warn("Field 'description' is ignored.");
        console.warn("Field 'url' is ignored.");
        console.warn("Field 'unsplashImageId' is ignored.");
        console.warn("Field 'unsplashCreatorName' is ignored.");
        console.warn("Field 'unsplashCreatorUrl' is ignored.");
        console.warn("Must have all of the above ignored fields.");
      }
      generalPatch("/vision/", data, success, error);
    };

    /**
     * Delete a vision by ID.
     * @public
     * @param {number} visionId - ID of the vision.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.deleteVision = function (visionId, success, error) {
      var data = {
        "vision_id": visionId
      };
      generalDelete("/vision/", data, success, error);
    };

    /**
     * Get a list of all answers.
     * @public
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAllAnswer = function (success, error) {
      generalGet("/answer/", success, error);
    };

    /**
     * Get a list of answers by scenario ID.
     * @public
     * @param {number} scenarioId - scenario ID of answers that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAnswerByScenarioId = function (scenarioId, success, error) {
      generalGet("/answer/?scenario_id=" + scenarioId, success, error);
    };

    /**
     * Get a list of answers by question ID.
     * @public
     * @param {number} questionId - question ID of answers that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAnswerByQuestionId = function (questionId, success, error) {
      generalGet("/answer/?question_id=" + questionId, success, error);
    };

    /**
     * Get a list of answers of the current user by scenario ID.
     * @public
     * @param {number} scenarioId - scenario ID of answers that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAnswerOfCurrentUserByScenarioId = function (scenarioId, success, error) {
      generalGet("/answer/?scenario_id=" + scenarioId + "&user_id=" + userData["user_id"], success, error);
    };

    /**
     * Get a list of answers by topic ID.
     * @public
     * @param {number} topicId - topic ID of answers that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAnswerByTopicId = function (topicId, success, error) {
      generalGet("/answer/?topic_id=" + topicId, success, error);
    };

    /**
     * Get a list of answers of the current user by topic ID.
     * @public
     * @param {number} topicId - topic ID of answers that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAnswerOfCurrentUserByTopicId = function (topicId, success, error) {
      generalGet("/answer/?topic_id=" + topicId + "&user_id=" + userData["user_id"], success, error);
    };

    /**
     * Get a list of answers by user ID.
     * @public
     * @param {number} userId - user ID of answers that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAnswerByUserId = function (userId, success, error) {
      generalGet("/answer/?user_id=" + userId, success, error);
    };

    /**
     * Get a list of answers by the current user ID.
     * @public
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAnswerByCurrentUserId = function (success, error) {
      generalGet("/answer/?user_id=" + userData["user_id"], success, error);
    };

    /**
     * Get an answer by its ID.
     * @public
     * @param {number} answerId - answer ID that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAnswerById = function (answerId, success, error) {
      generalGet("/answer/?answer_id=" + answerId, success, error);
    };

    /**
     * The object for the "Answer" database table.
     * @typedef {Object} Answer
     * @param {number} questionId - ID of the question that we want to fill in the answer.
     * @param {string} [text] - text of the answer.
     * @param {number[]} [choiceIdList] - array of the IDs of the selected choice objects.
     */

    /**
     * Create answers in the specified order.
     * @private
     * @param {Object} envObj - environment object (in environment.js).
     * @param {Answer[]} answers - list of answers that we want to create.
     * @param {Object[]} answerList - a list to collect the answer objects returned from the server.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    var createAnswersInOrder = function (envObj, answers, answerList, success, error) {
      if (answers.length == 0) {
        if (typeof success === "function") success(answerList);
        return true;
      } else {
        var a = answers[0];
        envObj.createAnswer(a["questionId"], a["text"], a["choiceIdList"], function (data) {
          answerList.push(data["data"]);
          createAnswersInOrder(envObj, answers.slice(1), answerList, success, error);
        }, function () {
          if (typeof error === "function") error();
          return false;
        });
      }
    };
    this.createAnswersInOrder = createAnswersInOrder;

    /**
     * Create an answer.
     * @private
     * @param {number} questionId - ID of the question that we want to fill in the answer.
     * @param {string} [text] - text of the answer.
     * @param {number[]} [choiceIdList] - array of the IDs of the selected choice objects.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.createAnswer = function (questionId, text, choiceIdList, success, error) {
      var data = {
        "question_id": questionId
      };
      if (typeof text !== "undefined") {
        data["text"] = text;
      }
      if (typeof choiceIdList !== "undefined") {
        data["choices"] = choiceIdList;
      }
      generalPost("/answer/", data, success, error);
    };

    /**
     * Delete an answer by ID.
     * @public
     * @param {number} answerId - ID of the answer.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.deleteAnswer = function (answerId, success, error) {
      var data = {
        "answer_id": answerId
      };
      generalDelete("/answer/", data, success, error);
    };

    /**
     * Get a list of all games.
     * @public
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAllGame = function (success, error) {
      generalGet("/game/", success, error);
    };

    /**
     * Get a list of games by user ID.
     * @public
     * @param {number} userId - user ID of games that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getGameByUserId = function (userId, success, error) {
      generalGet("/game/?user_id=" + userId, success, error);
    };

    /**
     * Get a list of games by vision ID.
     * @public
     * @param {number} visionId - vision ID of games that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getGameByVisionId = function (visionId, success, error) {
      generalGet("/game/?vision_id=" + visionId, success, error);
    };

    /**
     * Get a game by its ID.
     * @public
     * @param {number} gameId - game ID that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getGameById = function (gameId, success, error) {
      generalGet("/game/?game_id=" + gameId, success, error);
    };

    /**
     * Create a random game.
     * @private
     * @param {number} [scenarioId] - ID of the scenario that we wish to get the visions for the game.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.createRandomGame = function (scenarioId, success, error) {
      var data = {};
      if (typeof scenarioId !== "undefined") {
        data["scenario_id"] = scenarioId;
      }
      generalPost("/game/", data, success, error);
    };

    /**
     * Submit and update a game.
     * @public
     * @param {number} gameId - ID of the game that we wish to update.
     * @param {number[]} [moods] - list of mood IDs that the user guesses.
     * @param {string} [feedback] - text feedback of the vision in a game.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.updateGame = function (gameId, moods, feedback, success, error) {
      var data = {
        "game_id": gameId
      };
      if (typeof moods !== "undefined") {
        data["moods"] = moods;
      }
      if (typeof feedback !== "undefined") {
        data["feedback"] = feedback;
      }
      generalPatch("/game/", data, success, error);
    };

    /**
     * Delete a game by its ID.
     * @public
     * @param {number} gameId - ID of the game.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.deleteGame = function (gameId, success, error) {
      var data = {
        "game_id": gameId
      };
      generalDelete("/game/", data, success, error);
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
     * Handle the UI changes for a successful Google sign-in.
     * @private
     * @param {Object} accountObj - account object (in account.js).
     */
    function handleGoogleSignInSuccessUI(accountObj) {
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
    }

    /**
     * Handle the UI changes for a successful Google sign-out.
     * @private
     * @param {Object} accountObj - account object (in account.js).
     */
    function handleGoogleSignOutSuccessUI(accountObj) {
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
    }

    /**
     * A wrapper of the getUserToken function to make it easier to use.
     * @private
     * @param {Object} googleUserObj - user object returned by the Google Sign-In API.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    function getUserTokenWrapper(googleUserObj, success, error) {
      if (typeof periscope.Tracker === "undefined") {
        // This means that some plugin blocks the tracker.js file so that the tracker object cannot be created
        console.warn("Failed to initialize the tracker object (maybe blocked by a third-party plugin).");
        if (typeof googleUserObj === "undefined") {
          // This means that the user did not sign in with Google
          // In this case, we need to manually generate the client ID to log in to the back-end
          getUserToken({
            "client_id": "custom.cid." + new Date().getTime() + "." + Math.random().toString(36).substring(2)
          }, success, error);
        } else {
          // This means that the user has signed in with Google
          // In this case, we need to use the Google user token to log in to the back-end
          getUserToken({
            "google_id_token": googleUserObj.getAuthResponse().id_token
          }, success, error);
        }
      } else {
        // This means that we can create the tracker (and it is not blocked)
        // The tracker object will handle the case if the Google Analytics script is blocked
        if (typeof tracker === "undefined") {
          if (typeof googleUserObj === "undefined") {
            // This means that the tracker is not created yet
            // And the user did not sign in with Google
            // For example, initially when loading the application without Google sign-in
            // In this case, we need to use the Google Analytics client ID to log in to the back-end
            // We also need to create the tracker
            tracker = new periscope.Tracker({
              "ready": function (trackerObj) {
                getUserToken({
                  "client_id": trackerObj.getClientId()
                }, success, error);
              }
            });
          } else {
            // This means that the tracker is not created yet
            // And the user has signed in with Google
            // For example, initially when loading the application with Google sign-in
            // In this case, we need to use the Google user token to log in to the back-end
            // We also need to create the tracker
            tracker = new periscope.Tracker({
              "ready": function () {
                getUserToken({
                  "google_id_token": googleUserObj.getAuthResponse().id_token
                }, success, error);
              }
            });
          }
        } else {
          if (typeof googleUserObj === "undefined") {
            // This means that the tracker is already created
            // And the user did not sign in with Google
            // For example, when user signed out with Google on the account dialog
            // In this case, we need to use the Google Analytics client ID to log in to the back-end
            getUserToken({
              "client_id": tracker.getClientId()
            }, success, error);
          } else {
            // This means that the tracker is already created
            // And the user has signed in with Google
            // For example, when user signed in with Google on the account dialog
            // In this case, we need to use the Google user token to log in to the back-end
            getUserToken({
              "google_id_token": googleUserObj.getAuthResponse().id_token
            }, success, error);
          }
        }
      }
    }

    /**
     * Create the html elements when there is an error on the back-end server.
     * @private
     * @param {string} errorMessage - the error message to show on the page.
     * @returns {Object} - a jQuery DOM object.
     */
    function createErrorHTML(errorMessage) {
      var html = "";
      html += '<img src="https://images.unsplash.com/photo-1555861496-0666c8981751?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" />';
      html += '<p class="server-error-text">';
      if (typeof errorMessage === "undefined") {
        html += '  Something is wrong (sad face)';
      } else {
        html += errorMessage;
      }
      html += '</p>';
      return $(html);
    }

    /**
     * Show an error page.
     * @public
     */
    var showErrorPage = function (errorMessage) {
      var $container = $("#main-content-container");
      if (!$container.hasClass("error")) {
        $("#main-content-container").addClass("error").empty().append(createErrorHTML(errorMessage)).show();
      }
    };
    this.showErrorPage = showErrorPage;

    /**
     * Show the normal page.
     * @public
     */
    var showPage = function () {
      $("#main-content-container").show();
    };
    this.showPage = showPage;

    /**
     * Class constructor.
     * @constructor
     * @private
     */
    function Environment() {
      var accountObj = initAccountUI();
      var userTokenSuccess = function () {
        ready(thisObj);
      };
      var userTokenError = function () {
        fail("Back-end server error.");
      };
      accountObj.silentSignInWithGoogle(function (isUserSignedInWithGoogle, googleUserObj) {
        if (isUserSignedInWithGoogle) {
          getUserTokenWrapper(googleUserObj, function () {
            handleGoogleSignInSuccessUI(accountObj);
            userTokenSuccess();
          }, userTokenError);
        } else {
          getUserTokenWrapper(undefined, function () {
            userTokenSuccess();
          }, userTokenError);
        }
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