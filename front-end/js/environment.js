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
   * The object for the "Choice" database table.
   * @typedef {Object} Choice
   * @property {string} text - text of the choice.
   * @property {number} value - value of the choice.
   */

  /**
   * The object for the "Question" database table.
   * @typedef {Object} Question
   * @param {number} id - ID of the question.
   * @param {string} text - text of the question.
   * @param {number} page - page of the question.
   * @param {number} view - view of the question.
   * @param {number} order - order of the question.
   * @param {number} topic_id - topic ID of the question.
   * @param {number} scenario_id - scenario ID of the question.
   * @param {sting|null} question_type - type of the question.
   * @param {Choice[]} choices - choices of the question.
   */

  /**
   * The object for the "Media" database table.
   * @typedef {Object} Media
   * @property {number} id - ID of the media.
   * @property {string} description - description of the media.
   * @property {string} unsplash_creator_name - the creator name of the unsplash photo.
   * @property {string} unsplash_creator_url - the creator URL of the unsplash photo.
   * @property {string} unsplash_image_id - the ID of the unsplash photo.
   * @property {string} url - URL of the media (the unsplash photo URL).
   * @property {number} vision_id - ID of the vision.
   */

  /**
   * The object for the "Vision" database table.
   * @typedef {Object} Vision
   * @property {number} id - ID of the vision.
   * @property {Media[]} medias - medias of the vision.
   * @property {number} scenario_id - scenario ID of the vision.
   */

  /**
   * The JavaScript implementation of the python collections.defaultdict data type
   * Below are usage examples:
   * var a = new DefaultDict(Array);
   * a["banana"].push("ya");
   * var b = new DefaultDict(new DefaultDict(Array));
   * b["orange"]["apple"].push("yo");
   * var c = new DefaultDict(Number);
   * c["banana"] = 1;
   * var d = new DefaultDict([2]);
   * d["banana"].push(1);
   * var e = new DefaultDict(new DefaultDict(2));
   * e["orange"]["apple"] = 3;
   * var f = new DefaultDict(1);
   * f["banana"] = 2;
   */
  class DefaultDict {
    constructor(defaultInit) {
      this.original = defaultInit;
      return new Proxy({}, {
        get: function (target, name) {
          if (name in target) {
            return target[name];
          } else {
            if (typeof defaultInit === "function") {
              target[name] = new defaultInit().valueOf();
            } else if (typeof defaultInit === "object") {
              if (typeof defaultInit.original !== "undefined") {
                target[name] = new DefaultDict(defaultInit.original);
              } else {
                target[name] = JSON.parse(JSON.stringify(defaultInit));
              }
            } else {
              target[name] = defaultInit;
            }
            return target[name];
          }
        }
      });
    }
  }
  window.DefaultDict = DefaultDict;

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
        if (typeof success === "function") success(returnData);
      }, function () {
        console.error("ERROR when getting user token.");
        if (typeof error === "function") error();
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
          if (typeof success === "function") success(returnData);
        },
        "error": function (xhr) {
          console.error(xhr);
          if (typeof error === "function") error();
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
     * @param {number} [mode] - system configuration of the scenario.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.createScenario = function (title, description, image, topicId, mode, success, error) {
      var data = {
        "title": title,
        "description": description,
        "image": image,
        "topic_id": topicId
      };
      if (typeof mode !== "undefined") {
        data["mode"] = mode;
      }
      generalPost("/scenario/", data, success, error);
    };

    /**
     * Update a scenario.
     * @public
     * @param {number} scenarioId - ID of the scenario that we wish to update.
     * @param {string} [title] - title of the scenario.
     * @param {string} [description] - description of the scenario.
     * @param {string} [image] - image URL of the scenario.
     * @param {number} [topicId] - topic ID that the scenario is in.
     * @param {number} [mode] - system configuration of the scenario.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.updateScenario = function (scenarioId, title, description, image, topicId, mode, success, error) {
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
      if (typeof mode !== "undefined") {
        data["mode"] = mode;
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
     * @param {number} [page] - page of the questions that we want to get.
     * @param {number} [view] - view of the questions that we want to get.
     * @param {number} [mode] - mode of the questions that we want to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAllQuestion = function (page, view, mode, success, error) {
      var path = "/question/?";
      if (typeof page !== "undefined") {
        path += "&page=" + page;
      }
      if (typeof view !== "undefined") {
        path += "&view=" + view;
      }
      if (typeof mode !== "undefined") {
        path += "&mode=" + mode;
      }
      generalGet(path, success, error);
    };

    /**
     * Get a list of questions by topic ID.
     * @public
     * @param {number} topicId - topic ID of questions that we wish to get.
     * @param {number} [page] - page of the questions that we want to get.
     * @param {number} [view] - view of the questions that we want to get.
     * @param {number} [mode] - mode of the questions that we want to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    var getQuestionByTopicId = function (topicId, page, view, mode, success, error) {
      var path = "/question/?topic_id=" + topicId;
      if (typeof page !== "undefined") {
        path += "&page=" + page;
      }
      if (typeof view !== "undefined") {
        path += "&view=" + view;
      }
      if (typeof mode !== "undefined") {
        path += "&mode=" + mode;
      }
      generalGet(path, success, error);
    };
    this.getQuestionByTopicId = getQuestionByTopicId;

    /**
     * Get a list of questions by scenario ID.
     * @public
     * @param {number} scenarioId - scenario ID of questions that we wish to get.
     * @param {number} [page] - page of the questions that we want to get.
     * @param {number} [view] - view of the questions that we want to get.
     * @param {number} [mode] - mode of the questions that we want to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getQuestionByScenarioId = function (scenarioId, page, view, mode, success, error) {
      var path = "/question/?scenario_id=" + scenarioId;
      if (typeof page !== "undefined") {
        path += "&page=" + page;
      }
      if (typeof view !== "undefined") {
        path += "&view=" + view;
      }
      if (typeof mode !== "undefined") {
        path += "&mode=" + mode;
      }
      generalGet(path, success, error);
    };

    /**
     * Get a question by ID.
     * @public
     * @param {number} questionId - ID of the question that we wish to get.
     * @param {number} [page] - page of the questions that we want to get.
     * @param {number} [view] - view of the questions that we want to get.
     * @param {number} [mode] - mode of the questions that we want to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getQuestionById = function (questionId, page, view, mode, success, error) {
      var path = "/question/?question_id=" + questionId;
      if (typeof page !== "undefined") {
        path += "&page=" + page;
      }
      if (typeof view !== "undefined") {
        path += "&view=" + view;
      }
      if (typeof mode !== "undefined") {
        path += "&mode=" + mode;
      }
      generalGet(path, success, error);
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
     * @param {number} [topicId] - topic ID that the question is in (for topic questions).
     * @param {string} [scenarioId] - scenario ID that the question is in (for scenario quesions).
     * @param {boolean} [isMulitpleChoice] - indicate if the question allows multiple choices.
     * @param {boolean} [isJustDescription] - indicate if the question is just a description but not a question.
     * @param {number} [order] - indicate the order of the question relative to the others.
     * @param {number} [page] - page of the questions that we want to get.
     * @param {number} [view] - view of the questions that we want to get.
     * @param {number} [mode] - mode of the questions that we want to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.createQuestion = function (text, choices, topicId, scenarioId, isMulitpleChoice, isJustDescription, order, page, view, mode, success, error) {
      var data = {
        "text": text
      };
      if (typeof choices !== "undefined") {
        for (var i = 0; i < choices.length; i++) {
          var c = choices[i]["text"];
          if (typeof c === "object") {
            // If the choice text turns out to be a dictionary, we need to encode it into a string that can be decoded later.
            choices[i]["text"] = encodeURIComponent(JSON.stringify(c));
          }
        };
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
      if (typeof isJustDescription !== "undefined") {
        data["is_just_description"] = isJustDescription;
      }
      if (typeof order !== "undefined") {
        data["order"] = order;
      }
      if (typeof page !== "undefined") {
        data["page"] = page;
      }
      if (typeof view !== "undefined") {
        data["view"] = view;
      }
      if (typeof mode !== "undefined") {
        data["mode"] = mode;
      }
      generalPost("/question/", data, success, error);
    };

    /**
     * Update a question.
     * @private
     * @param {number} questionId - ID of the question.
     * @param {string} [text] - text of the question.
     * @param {Choice[]} [choices] - choices of the question.
     * @param {number} [topicId] - topic ID that the question is in (for topic questions).
     * @param {string} [scenarioId] - scenario ID that the question is in (for scenario quesions).
     * @param {number} [order] - indicate the order of the question relative to the others.
     * @param {number} [page] - page of the questions that we want to get.
     * @param {number} [view] - view of the questions that we want to get.
     * @param {number} [mode] - mode of the questions that we want to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.updateQuestion = function (questionId, text, choices, topicId, scenarioId, order, page, view, mode, success, error) {
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
      if (typeof order !== "undefined") {
        data["order"] = order;
      }
      if (typeof page !== "undefined") {
        data["page"] = page;
      }
      if (typeof view !== "undefined") {
        data["view"] = view;
      }
      if (typeof mode !== "undefined") {
        data["mode"] = mode;
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
     * @param {number} [order] - indicate the order of the mood relative to the others.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.createMood = function (name, image, order, success, error) {
      var data = {
        "name": name
      };
      if (typeof image !== "undefined") {
        data["image"] = image;
      }
      if (typeof order !== "undefined") {
        data["order"] = order;
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
      var path = "/answer/";
      if (typeof userToken !== "undefined") {
        path += "?user_token=" + userToken;
      }
      generalGet(path, success, error);
    };

    /**
     * Get a list of answers by scenario ID.
     * @public
     * @param {number} scenarioId - scenario ID of answers that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAnswerByScenarioId = function (scenarioId, success, error) {
      var path = "/answer/?scenario_id=" + scenarioId;
      if (typeof userToken !== "undefined") {
        path += "&user_token=" + userToken;
      }
      generalGet(path, success, error);
    };

    /**
     * Get a list of answers by question ID.
     * @public
     * @param {number} questionId - question ID of answers that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAnswerByQuestionId = function (questionId, success, error) {
      var path = "/answer/?question_id=" + questionId;
      if (typeof userToken !== "undefined") {
        path += "&user_token=" + userToken;
      }
      generalGet(path, success, error);
    };

    /**
     * Get a list of answers of the current user by scenario ID.
     * @public
     * @param {number} scenarioId - scenario ID of answers that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAnswerOfCurrentUserByScenarioId = function (scenarioId, success, error) {
      var path = "/answer/?scenario_id=" + scenarioId + "&user_id=" + userData["user_id"];
      if (typeof userToken !== "undefined") {
        path += "&user_token=" + userToken;
      }
      generalGet(path, success, error);
    };

    /**
     * Get a list of answers by topic ID.
     * @public
     * @param {number} topicId - topic ID of answers that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAnswerByTopicId = function (topicId, success, error) {
      var path = "/answer/?topic_id=" + topicId;
      if (typeof userToken !== "undefined") {
        path += "&user_token=" + userToken;
      }
      generalGet(path, success, error);
    };

    /**
     * Get a list of answers of the current user by topic ID.
     * @public
     * @param {number} topicId - topic ID of answers that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    var getAnswerOfCurrentUserByTopicId = function (topicId, success, error) {
      var path = "/answer/?topic_id=" + topicId + "&user_id=" + userData["user_id"];
      if (typeof userToken !== "undefined") {
        path += "&user_token=" + userToken;
      }
      generalGet(path, success, error);
    };
    this.getAnswerOfCurrentUserByTopicId = getAnswerOfCurrentUserByTopicId;

    /**
     * Get a list of answers by user ID.
     * @public
     * @param {number} userId - user ID of answers that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAnswerByUserId = function (userId, success, error) {
      var path = "/answer/?user_id=" + userId;
      if (typeof userToken !== "undefined") {
        path += "&user_token=" + userToken;
      }
      generalGet(path, success, error);
    };

    /**
     * Get a list of answers by the current user ID.
     * @public
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAnswerByCurrentUserId = function (success, error) {
      var path = "/answer/?user_id=" + userData["user_id"];
      if (typeof userToken !== "undefined") {
        path += "&user_token=" + userToken;
      }
      generalGet(path, success, error);
    };

    /**
     * Get an answer by its ID.
     * @public
     * @param {number} answerId - answer ID that we wish to get.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.getAnswerById = function (answerId, success, error) {
      var path = "/answer/?answer_id=" + answerId;
      if (typeof userToken !== "undefined") {
        path += "&user_token=" + userToken;
      }
      generalGet(path, success, error);
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
     * @public
     * @param {Answer[]} answers - list of answers that we want to create.
     * @param {Object[]} answerList - a list to collect the answer objects returned from the server.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    var createAnswersInOrder = function (answers, answerList, success, error) {
      if (answers.length == 0) {
        if (typeof success === "function") success(answerList);
        return true;
      } else {
        var a = answers[0];
        createAnswer(a["questionId"], a["text"], a["choiceIdList"], a["secret"], function (data) {
          answerList.push(data["data"]);
          createAnswersInOrder(answers.slice(1), answerList, success, error);
        }, function () {
          if (typeof error === "function") error();
          return false;
        });
      }
    };
    this.createAnswersInOrder = createAnswersInOrder;

    /**
     * Create an answer.
     * @public
     * @param {number} questionId - ID of the question that we want to fill in the answer.
     * @param {string} [text] - text of the answer.
     * @param {number[]} [choiceIdList] - array of the IDs of the selected choice objects.
     * @param {string} [secret] - a secret message related to the answer that only admin users can see.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    var createAnswer = function (questionId, text, choiceIdList, secret, success, error) {
      var data = {
        "question_id": questionId
      };
      if (typeof text !== "undefined") {
        data["text"] = text;
      }
      if (typeof choiceIdList !== "undefined") {
        data["choices"] = choiceIdList;
      }
      if (typeof secret !== "undefined") {
        data["secret"] = secret;
      }
      generalPost("/answer/", data, success, error);
    };
    this.createAnswer = createAnswer;

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
      html += '<p class="full-image-text">';
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
      if (!$container.hasClass("full-image")) {
        $("#main-content-container").addClass("full-image").empty().append(createErrorHTML(errorMessage)).show();
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
     * Submit the answers to topic questions from the UI to the back-end.
     * @private
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    function submitTopicQuestionAnswer(success, error) {
      var answers = [];
      var areAllQuestionsAnswered = true;
      var valueOfCheckedChoices = [];
      var handleError = function (errorMessage) {
        // Error when the user disagree with our consent
        console.error(errorMessage);
        $("#submit-topic-question-error-message").text(errorMessage).stop(true).fadeIn(500).delay(5000).fadeOut(500);
        $("#dialog-topic-question").scrollTop($("#topic-questions").height() + 30);
        if (typeof error === "function") error();
      };
      $(".topic-question-item").each(function () {
        var $this = $(this);
        var $allChoices = $this.find("option");
        var $checkedChoices = $this.find("option:selected");
        var answer = {
          "questionId": $this.data("raw")["id"]
        };
        if ($allChoices.length > 0) {
          // This condition means that this is a single or multiple choice question
          if ($checkedChoices.length > 0 && $checkedChoices.val() != "none") {
            // This condition means that user provides the answer
            // So we need to get the list of the choices
            answer["choiceIdList"] = $checkedChoices.map(function () {
              return parseInt($(this).val());
            }).get();
            // Also we need to store some extra experiment information in the text
            var queryParas = periscope.util.parseVars(window.location.search);
            var scenarioId = queryParas["scenario_id"];
            var topicId = queryParas["topic_id"];
            var userPlatformId = queryParas["PROLIFIC_PID"];
            var view = queryParas["view"];
            var mode = queryParas["mode"];
            if (typeof scenarioId !== "undefined" && typeof topicId !== "undefined" && typeof userPlatformId !== "undefined" && typeof view !== "undefined" && typeof mode !== "undefined") {
              var info = {
                "scenario_id": scenarioId,
                "topic_id": topicId,
                "user_platform_id": userPlatformId,
                "view": view,
                "mode": mode
              };
              answer["secret"] = JSON.stringify(info);
            }
            // Add the answer to the answer list that we will submit
            answers.push(answer);
            // Only record the values of answers to YES/NO questions
            // The length should be 3 since there should be "Select", "Yes", and "No" options
            if ($allChoices.length == 3) {
              valueOfCheckedChoices.push($checkedChoices.map(function () {
                return parseInt($(this).data("value"));
              }).get());
            }
          } else {
            // This condition means that there are no answers to this question
            areAllQuestionsAnswered = false;
          }
        }
      });
      // Check if all the questions are answered
      if (areAllQuestionsAnswered) {
        // Check if the YES/NO quesions are all answered as YES (i.e., having value 1)
        var doesUserAgree = function (valueOfCheckedChoices) {
          var consent = true;
          for (var i = 0; i < valueOfCheckedChoices.length; i++) {
            var choices = valueOfCheckedChoices[i];
            // Must choose only one option, cannot be more than one
            if (choices.length != 1) {
              consent = false;
              break;
            } else {
              // Must choose the "Yes" option with value 1, cannot be others
              if (choices[0] != 1) {
                consent = false;
                break;
              }
            }
          }
          return consent;
        }
        if (doesUserAgree(valueOfCheckedChoices)) {
          // Create the answers when the user provides consent and agrees with our policy
          createAnswersInOrder(answers, [], success, error);
        } else {
          // Error when the user disagree with our consent
          handleError("(Sorry that we are unable to proceed since you did not provide consent.)");
        }
      } else {
        // Error when some questions are not answered
        handleError("(Would you please select an answer for all questions?)");
      }
    }

    /**
     * Create the html elements for a topic question.
     * @private
     * @param {string} uniqueId - a unique ID for the topic question.
     * @param {Question} question - the topic question object.
     * @returns {Object} - a jQuery DOM object.
     */
    function createTopicQuestionHTML(uniqueId, question) {
      var option = question["choices"];
      var html = '';
      html += '<div class="topic-question-item">';
      html += '  <ul class="small-left-padding"><li><b>' + question["text"] + '</b></li></ul>';
      html += '  <select id="topic-question-select-' + uniqueId + '" data-role="none">';
      html += '    <option selected="" value="none">Select...</option>';
      for (var i = 0; i < option.length; i++) {
        html += '    <option value="' + option[i]["id"] + '" data-value="' + option[i]["value"] + '">' + option[i]["text"] + '</option>';
      }
      html += '  </select>';
      html += '</div>';
      return $(html);
    }

    /**
     * Create the html elements for a topic question as a text description.
     * @public
     * @param {string} text - the text description.
     * @returns {Object} - a jQuery DOM object.
     */
    var createTopicTextHTML = function (text) {
      var $html;
      try {
        $html = $(text);
      } catch (error) {
        $html = $('<p class="text">' + text + '</p>');
      }
      return $html;
    };
    this.createTopicTextHTML = createTopicTextHTML;

    /**
     * Create and display the topic question dialog.
     * @private
     * @param {number} topicId - the ID of the topic.
     * @param {function} [create] - callback function after creating the dialog.
     * @param {function} [submit] - callback function after answers are submitted successfully.
     */
    function createTopicQuestionDialog(topicId, create, submit) {
      getQuestionByTopicId(topicId, undefined, undefined, undefined, function (data) {
        // Add topic questions
        var topicQuestions = data["data"];
        periscope.util.sortArrayOfDictByKeyInPlace(topicQuestions, "order");
        var $topicQuestions = $("#topic-questions");
        for (var i = 0; i < topicQuestions.length; i++) {
          var q = topicQuestions[i];
          if (q["question_type"] == null) {
            var $q = createTopicTextHTML(q["text"]);
          } else {
            var $q = createTopicQuestionHTML("dq" + i, q);
            $q.data("raw", q);
          }
          $topicQuestions.append($q);
        }
        var widgets = new edaplotjs.Widgets();
        // Set the topic question dialog
        // We need to give the parent element so that on small screens, the dialog can be scrollable
        var $topicQuestionDialog = widgets.createCustomDialog({
          "selector": "#dialog-topic-question",
          "action_text": "Submit",
          "width": 290,
          "class": "dialog-container-topic-question",
          "show_cancel_btn": false,
          "close_dialog_on_action": false,
          "show_close_button": false,
          "action_callback": function () {
            $topicQuestionDialog.dialog("widget").find("button.ui-action-button").prop("disabled", true);
            submitTopicQuestionAnswer(function (answerList) {
              // Success condition
              if (typeof submit === "function") submit(answerList);
              $topicQuestionDialog.dialog("close");
            }, function () {
              // Error condition
              $topicQuestionDialog.dialog("widget").find("button.ui-action-button").prop("disabled", false);
            });
          }
        });
        $topicQuestionDialog.on("dialogopen", function (event, ui) {
          $topicQuestionDialog.scrollTop(0);
        });
        $(window).resize(function () {
          periscope.util.fitDialogToScreen($topicQuestionDialog);
        });
        periscope.util.fitDialogToScreen($topicQuestionDialog);
        if (typeof create === "function") create($topicQuestionDialog);
      });
    }

    /**
     * Create the html elements for a scenario question.
     * @private
     * @param {string} uniqueId - a unique ID for the scenario question.
     * @param {Question} question - the scenario question object.
     * @returns {Object} - a jQuery DOM object.
     */
    function createScenarioQuestionHTML(uniqueId, question) {
      var option = question["choices"];
      // Check if it is a multiple choice question
      var isMulitpleChoice = question["question_type"] == "MULTI_CHOICE";
      // Check if the choices are images
      var isImageOnly = false;
      if (typeof option[0] !== "undefined") {
        var firstText = option[0]["text"];
        if (firstText.indexOf("%7B") !== -1 && firstText.indexOf("%7D") !== -1) {
          // This means that it is likely to be an encoded JSON string
          // Which means it is going to be a meme image
          try {
            var ti = JSON.parse(decodeURIComponent(firstText));
            isImageOnly = true;
          } catch (err) {
            console.error(err.message);
            isImageOnly = false;
          }
        }
      }
      // Construct the HTML
      var html = '';
      html += '<div class="custom-survey add-top-margin add-bottom-margin" id="scenario-question-' + uniqueId + '">';
      html += '  <span class="text">' + question["text"] + '</span>';
      if (isImageOnly) {
        html += '  <div class="custom-radio-group-survey image-only add-top-margin">';
      } else {
        html += '  <div class="custom-radio-group-survey add-top-margin">';
      }
      for (var i = 0; i < option.length; i++) {
        html += '  <div>';
        var inputId = 'scenario-question-' + uniqueId + '-item-' + i;
        if (isMulitpleChoice) {
          html += '    <input type="checkbox" name="scenario-question-' + uniqueId + '-scale" value="' + option[i]["id"] + '" id="' + inputId + '">'
        } else {
          html += '    <input type="radio" name="scenario-question-' + uniqueId + '-scale" value="' + option[i]["id"] + '" id="' + inputId + '">'
        }
        var ti = option[i]["text"];
        var isTextJson = false;
        if (ti.indexOf("%7B") !== -1 && ti.indexOf("%7D") !== -1) {
          // This means that it is likely to be an encoded JSON string
          try {
            ti = JSON.parse(decodeURIComponent(ti));
            isTextJson = true;
          } catch (err) {
            console.error(err.message);
            isTextJson = false;
          }
        }
        if (isTextJson) {
          if ("url" in ti) {
            // Add a DOM item with image and text
            var imageSrc = ti["url"];
            var caption = ti["description"];
            var credit = 'Credit: ' + ti["unsplash_creator_name"];
            var figcaptionElement = '<figcaption>' + caption + '</figcaption>';
            if (typeof caption === "undefined" || caption == "") {
              figcaptionElement = "";
            }
            html += '<label for="' + inputId + '"><figure><img src="' + imageSrc + '"><div>' + credit + '</div>' + figcaptionElement + '</figure></label>';
          } else {
            // Add a DOM item with only text
            var caption = ti["description"];
            var figcaptionElement = '<figcaption class="text-only">' + caption + '</figcaption>';
            if (typeof caption === "undefined" || caption == "") {
              figcaptionElement = "";
            }
            html += '<label for="' + inputId + '"><figure>' + figcaptionElement + '</figure></label>';
          }
        } else {
          // Add the normal question item
          html += '    <label class="break-long-url" for="' + inputId + '">' + ti + '</label>'
        }
        html += '  </div>';
      }
      html += '  </div>';
      if (option.length == 0) {
        html += '  <textarea class="custom-textbox-survey add-top-margin" placeholder="Your opinion (max 500 characters)" maxlength="500"></textarea>';
      }
      html += '</div>';
      return $(html);
    }

    /**
     * Create the html elements for a scenario question as a text description.
     * @private
     * @param {string} text - the text description.
     * @returns {Object} - a jQuery DOM object.
     */
    function createScenarioTextHTML(text) {
      var $html;
      try {
        $html = $(text);
      } catch (error) {
        $html = $('<p class="text break-long-url">' + text + '</p>');
      }
      return $html;
    }

    /**
     * Add questions to the HTML container.
     * @public
     * @param {Object} $container - the jQuery object of the question container.
     * @param {Question[]} questions - a list of the scenario question object.
     * @param {number} page - page of the scenario questions that we want to load.
     * @param {number} view - view of the scenario questions that we want to load.
     * @param {number} mode - mode of the scenario questions that we want to load.
     */
    this.addScenarioQuestionsToContainer = function ($container, questions, page, view, mode) {
      // Build a dictionary based on page and view
      var questionDict = new DefaultDict(new DefaultDict(new DefaultDict(Array)))
      for (var i = 0; i < questions.length; i++) {
        var sq = questions[i];
        var p = sq["page"];
        var v = sq["view"];
        var m = sq["mode"];
        if (typeof p === "undefined" || typeof v === "undefined" || typeof m === "undefined") continue;
        questionDict[p][v][m].push(sq);
      }
      // Filter questions by page and view
      var filteredQuestions = questionDict[page][view][mode];
      if (view != 0 && filteredQuestions.length == 0) {
        // Use the default view if the desired view has no questions
        // Default view is 0
        filteredQuestions = questionDict[page][0][mode];
      }
      if (mode != 0 && filteredQuestions.length == 0) {
        // Use the default mode if the desired mode has no questions
        // Default mode is 0
        filteredQuestions = questionDict[page][view][0];
      }
      if (mode != 0 && view != 0 && filteredQuestions.length == 0) {
        // Use the default mode if the desired mode has no questions
        // Default mode is 0
        filteredQuestions = questionDict[page][0][0];
      }
      // Sort questions
      periscope.util.sortArrayOfDictByKeyInPlace(filteredQuestions, "order");
      // Create HTML elements
      for (var j = 0; j < filteredQuestions.length; j++) {
        var q = filteredQuestions[j]
        if (q["question_type"] == null) {
          var $q = createScenarioTextHTML(q["text"]);
        } else {
          var $q = createScenarioQuestionHTML("sq-" + q["id"], q);
          $q.data("raw", q);
        }
        $container.append($q);
      }
    };

    /**
     * Submit the scenario answers to the back-end.
     * @public
     * @param {Object} $container - the jQuery object of the container for putting scenario questions.
     * @param {function} [success] - callback function when the operation is successful.
     * @param {function} [error] - callback function when the operation is failing.
     */
    this.submitScenarioAnswer = function ($container, success, error) {
      var answers = [];
      var areAllQuestionsAnswered = true;
      $container.find(".custom-survey").each(function () {
        var $this = $(this);
        var $allChoices = $this.find("input[type='radio'], input[type='checkbox']");
        var $checkedChoices = $this.find("input[type='radio']:checked, input[type='checkbox']:checked");
        var answer = {
          "questionId": $this.data("raw")["id"],
          "text": $this.find(".custom-textbox-survey").val()
        };
        if ($allChoices.length > 0) {
          // This condition means that this is a single or multiple choice question
          if ($checkedChoices.length > 0) {
            // This condition means that user provides the answer
            answer["choiceIdList"] = $checkedChoices.map(function () {
              return parseInt($(this).val());
            }).get();
            answers.push(answer);
          } else {
            // This condition means that there are no answers to this question
            if ($allChoices.attr("type") == "radio") {
              // Only do the answer check for radio (not checkbox)
              areAllQuestionsAnswered = false;
            }
          }
        } else {
          // This condition means that this is a free text question
          answers.push(answer);
        }
      });
      if (areAllQuestionsAnswered) {
        createAnswersInOrder(answers, [], success, error);
      } else {
        var errorMessage = "(Would you please select an answer for all questions that have choices?)";
        console.error(errorMessage);
        if (typeof error === "function") error(errorMessage);
      }
    };

    /**
     * Create the html elements for a vision.
     * @private
     * @param {string} caption - the caption of the vision.
     * @param {string} imageSrc - the source URL of an image for the vision.
     * @param {string} credit - the credit of the photo.
     * @returns {Object} - a jQuery DOM object.
     */
    function createVisionHTML(caption, imageSrc, credit) {
      // This is a hack for Firefox, since Firefox does not respect the CSS "break-inside" and "page-break-inside"
      // We have to set the CSS display to "inline-flex" to prevent Firefox from breaking the figure in the middle
      // But, setting display to inline-flex will cause another problem in Chrome, where the columns will not be balanced
      // So we want Chrome to use "display: flex", and we want Firefox to use "display: inline-flex"
      var html = '<figure style="display: none;">';
      if (periscope.util.isFirefox()) {
        html = '<figure style="display: inline-flex">';
      }
      var figcaptionElement = '<figcaption>' + caption + '</figcaption>';
      if (typeof caption === "undefined" || caption == "") {
        figcaptionElement = "";
      }
      html += '<img src="' + imageSrc + '"><div>' + credit + '</div>' + figcaptionElement + '</figure>';
      var $html = $(html);
      $html.find("img").one("load", function () {
        // Only show the figure when the image is loaded
        $(this).parent().show();
      });
      return $html;
    }

    /**
     * Load and display visions.
     * @public
     * @param {Object} $container - the jQuery object of the container for putting visions.
     * @param {Vision[]} visions - a list of vision objects to load.
     */
    this.addVisionsToContainer = function ($container, visions) {
      $container.empty();
      for (var i = 0; i < visions.length; i++) {
        var v = visions[i];
        var media = v["medias"][0];
        var imageSrc = media["url"];
        var caption = media["description"];
        var credit = 'Credit: <a href="' + media["unsplash_creator_url"] + '" target="_blank">' + media["unsplash_creator_name"] + '</a>';
        var $t = createVisionHTML(caption, imageSrc, credit);
        $t.attr("id", "vision-id-" + v["id"]);
        $container.append($t);
      }
    };

    /**
     * Create the html elements for a vision with only text.
     * @private
     * @param {string} caption - the caption of the vision.
     * @returns {Object} - a jQuery DOM object.
     */
    function createTextVisionHTML(caption) {
      // This is a hack for Firefox, since Firefox does not respect the CSS "break-inside" and "page-break-inside"
      // We have to set the CSS display to "inline-flex" to prevent Firefox from breaking the figure in the middle
      // But, setting display to inline-flex will cause another problem in Chrome, where the columns will not be balanced
      // So we want Chrome to use "display: flex", and we want Firefox to use "display: inline-flex"
      var html = '<figure>';
      if (periscope.util.isFirefox()) {
        html = '<figure style="display: inline-flex">';
      }
      var figcaptionElement = '<figcaption class="text-only">' + caption + '</figcaption>';
      if (typeof caption === "undefined" || caption == "") {
        figcaptionElement = "";
      }
      html += figcaptionElement + '</figure>';
      var $html = $(html);
      return $html;
    }

    /**
     * Load and display visions with only text.
     * @public
     * @param {Object} $container - the jQuery object of the container for putting visions.
     * @param {Vision[]} visions - a list of vision objects to load.
     */
    this.addTextVisionsToContainer = function ($container, visions) {
      $container.empty();
      for (var i = 0; i < visions.length; i++) {
        var v = visions[i];
        var media = v["medias"][0];
        var caption = media["description"];
        var $t = createTextVisionHTML(caption);
        $t.attr("id", "vision-id-" + v["id"]);
        $container.append($t);
      }
    };

    /**
     * Check if the user provided consent.
     * @public
     * @param {number} topicId - the ID of the topic.
     * @param {function} [pass] - callback function when the user has provided consent.
     */
    var checkUserConsent = function (topicId, pass) {
      // Get the answers to topic questions (i.e., the consent questions with binary YES/NO options)
      // The logic ensures that only the YES answers will be entered into the database
      getAnswerOfCurrentUserByTopicId(topicId, function (data) {
        var answerList = data["data"];
        if (typeof answerList === "undefined" || answerList.length == 0) {
          // This means that the user has not provided consent yet
          createTopicQuestionDialog(topicId, function ($topicQuestionDialog) {
            // This means that the topic question dialog is created
            $topicQuestionDialog.dialog("open");
          }, function () {
            // This means that the answers to the questions are submitted successfully
            // And also that the user has provided consent
            if (typeof pass === "function") pass();
          });
        } else {
          // This means that the user has provided consent
          if (typeof pass === "function") pass();
        }
      });
    };
    this.checkUserConsent = checkUserConsent;

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