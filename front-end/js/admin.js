(function () {
  "use strict";

  /**
   * Initialize the user interface.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   */
  function initUI(envObj) {
    // Start for Topic
    $("#get-all-topic").on("click", function () {
      envObj.getAllTopic(function (returnData) {
        console.log(returnData);
      });
    });
    $("#get-topic-by-id").on("click", function () {
      var $topicId = $("#want-topic-get-id");
      var ti = $topicId.val();
      if (ti == "") ti = undefined;
      envObj.getTopicById(ti, function (returnData) {
        console.log(returnData);
        $topicId.val("");
      });
    });
    $("#create-topic").on("click", function () {
      var $topicTitle = $("#want-topic-title");
      var $topicDescription = $("#want-topic-description");
      var t = $topicTitle.val().trim();
      if (t == "") t = undefined;
      var d = $topicDescription.val().trim();
      if (d == "") d = undefined;
      envObj.createTopic(t, d, function (returnData) {
        console.log(returnData);
        $topicTitle.val("");
        $topicDescription.val("");
      });
    });
    $("#update-topic").on("click", function () {
      var $topicTitle = $("#want-topic-title");
      var $topicDescription = $("#want-topic-description");
      var $topicId = $("#want-topic-update-id");
      var t = $topicTitle.val().trim();
      if (t == "") t = undefined;
      var d = $topicDescription.val().trim();
      if (d == "") d = undefined;
      var ti = $topicId.val();
      if (ti == "") ti = undefined;
      envObj.updateTopic(ti, t, d, function (returnData) {
        console.log(returnData);
        $topicTitle.val("");
        $topicDescription.val("");
        $topicId.val("");
      });
    });
    $("#delete-topic").on("click", function () {
      var $topicId = $("#want-topic-delete-id");
      var ti = $topicId.val();
      if (ti == "") ti = undefined;
      envObj.deleteTopic(ti, function (returnData) {
        console.log(returnData);
        $topicId.val("");
      });
    });
    // End for Topic
    // Start for Scenario
    $("#get-all-scenario").on("click", function () {
      envObj.getAllScenario(function (returnData) {
        console.log(returnData);
      });
    });
    $("#get-scenario-by-topic-id").on("click", function () {
      var $topicId = $("#want-scenario-get-topic-id");
      var ti = $topicId.val();
      if (ti == "") ti = undefined;
      envObj.getScenarioByTopicId(ti, function (returnData) {
        console.log(returnData);
        $topicId.val("");
      });
    });
    $("#get-scenario-by-id").on("click", function () {
      var $scenarioId = $("#want-scenario-get-id");
      var si = $scenarioId.val();
      if (si == "") si = undefined;
      envObj.getScenarioById(si, function (returnData) {
        console.log(returnData);
        $scenarioId.val("");
      });
    });
    $("#create-scenario").on("click", function () {
      var $scenarioTitle = $("#want-scenario-title");
      var t = $scenarioTitle.val().trim();
      if (t == "") t = undefined;
      var $scenarioDescription = $("#want-scenario-description");
      var d = $scenarioDescription.val().trim();
      if (d == "") d = undefined;
      var $scenarioImage = $("#want-scenario-image");
      var i = $scenarioImage.val().trim();
      if (i == "") i = undefined;
      var $scenarioTopicId = $("#want-scenario-topic-id");
      var ti = $scenarioTopicId.val();
      if (ti == "") ti = undefined;
      var $scenarioMode = $("#want-scenario-mode");
      var m = $scenarioMode.val();
      if (m == "") m = undefined;
      var $scenarioView = $("#want-scenario-view");
      var v = $scenarioView.val();
      if (v == "") v = undefined;
      envObj.createScenario(t, d, i, ti, m, v, function (returnData) {
        console.log(returnData);
        $scenarioTitle.val("");
        $scenarioDescription.val("");
        $scenarioImage.val("");
        $scenarioTopicId.val("");
        $scenarioMode.val("");
        $scenarioView.val("");
      });
    });
    $("#update-scenario").on("click", function () {
      var $scenarioTitle = $("#want-scenario-title");
      var t = $scenarioTitle.val().trim();
      if (t == "") t = undefined;
      var $scenarioDescription = $("#want-scenario-description");
      var d = $scenarioDescription.val().trim();
      if (d == "") d = undefined;
      var $scenarioImage = $("#want-scenario-image");
      var i = $scenarioImage.val().trim();
      if (i == "") i = undefined;
      var $scenarioTopicId = $("#want-scenario-topic-id");
      var ti = $scenarioTopicId.val();
      if (ti == "") ti = undefined;
      var $scenarioId = $("#want-scenario-update-id");
      var si = $scenarioId.val();
      if (si == "") si = undefined;
      var $scenarioMode = $("#want-scenario-mode");
      var m = $scenarioMode.val();
      if (m == "") m = undefined;
      var $scenarioView = $("#want-scenario-view");
      var v = $scenarioView.val();
      if (v == "") v = undefined;
      envObj.updateScenario(si, t, d, i, ti, m, v, function (returnData) {
        console.log(returnData);
        $scenarioTitle.val("");
        $scenarioDescription.val("");
        $scenarioImage.val("");
        $scenarioTopicId.val("");
        $scenarioId.val("");
        $scenarioMode.val("");
        $scenarioView.val("");
      });
    });
    $("#delete-scenario").on("click", function () {
      var $scenarioId = $("#want-scenario-delete-id");
      var si = $scenarioId.val();
      if (si == "") si = undefined;
      envObj.deleteScenario(si, function (returnData) {
        console.log(returnData);
        $scenarioId.val("");
      });
    });
    // End for Scenario
    // Start for Question
    $("#get-all-question").on("click", function () {
      var $page = $("#want-question-get-page");
      var p = $page.val();
      if (p == "") p = undefined;
      envObj.getAllQuestion(p, function (returnData) {
        console.log(returnData);
        $page.val("");
      });
    });
    $("#get-question-by-topic-id").on("click", function () {
      var $topicId = $("#want-question-get-topic-id");
      var ti = $topicId.val();
      if (ti == "") ti = undefined;
      var $page = $("#want-question-get-page");
      var p = $page.val();
      if (p == "") p = undefined;
      envObj.getQuestionByTopicId(ti, p, function (returnData) {
        console.log(returnData);
        $topicId.val("");
        $page.val("");
      });
    });
    $("#get-question-by-scenario-id").on("click", function () {
      var $scenarioId = $("#want-question-get-scenario-id");
      var si = $scenarioId.val();
      if (si == "") si = undefined;
      var $page = $("#want-question-get-page");
      var p = $page.val();
      if (p == "") p = undefined;
      envObj.getQuestionByScenarioId(si, p, function (returnData) {
        console.log(returnData);
        $scenarioId.val("");
        $page.val("");
      });
    });
    $("#get-question-by-id").on("click", function () {
      var $questionId = $("#want-question-get-id");
      var qi = $questionId.val();
      if (qi == "") qi = undefined;
      var $page = $("#want-question-get-page");
      var p = $page.val();
      if (p == "") p = undefined;
      envObj.getQuestionById(qi, p, function (returnData) {
        console.log(returnData);
        $questionId.val("");
        $page.val("");
      });
    });
    $("#question-choices-add-row").on("click", function () {
      addRow("choices-table");
    });
    $("#question-choices-delete-row").on("click", function () {
      deleteRow("choices-table");
    });
    $("#create-question").on("click", function () {
      var choices = [];
      $("#choices-table").find("tr").each(function () {
        var $this = $(this);
        var text = $this.find(".choice-text").val();
        var value = $this.find(".choice-value").val();
        if (text != "" && value != "") {
          choices.push({
            "text": text,
            "value": value
          });
        }
      });
      if (choices.length == 0) choices = undefined;
      var $isMultipleChoice = $("#want-multiple-choice");
      var mc = $isMultipleChoice.is(":checked");
      var $isJustDescription = $("#want-just-description");
      var jd = $isJustDescription.is(":checked");
      var $questionText = $("#want-question-text");
      var t = $questionText.val().trim();
      if (t == "") t = undefined;
      var $questionTopicId = $("#want-question-topic-id");
      var ti = $questionTopicId.val();
      if (ti == "") ti = undefined;
      var $questionScenarioId = $("#want-question-scenario-id");
      var si = $questionScenarioId.val();
      if (si == "") si = undefined;
      var $questionOrder = $("#want-question-order");
      var order = $questionOrder.val();
      if (order == "") order = undefined;
      var $questionPage = $("#want-question-page");
      var page = $questionPage.val();
      if (page == "") page = undefined;
      var $questionShuffleChoices = $("#want-question-shuffle-choices");
      var shuffle = $questionShuffleChoices.is(":checked");
      var $isCreateVision = $("#want-is-create-vision");
      var icv = $isCreateVision.is(":checked");
      envObj.createQuestion(t, choices, ti, si, mc, jd, order, page, shuffle, icv, function (returnData) {
        console.log(returnData);
        $questionText.val("");
        $questionTopicId.val("");
        $questionScenarioId.val("");
        $questionOrder.val("");
        $questionPage.val("");
        $isMultipleChoice.prop("checked", false);
        $isJustDescription.prop("checked", false);
        $questionShuffleChoices.prop("checked", false);
        $isCreateVision.prop("checked", false);
        $("#choices-table").find("tr").each(function (idx) {
          var $this = $(this);
          if (idx == 0) {
            $this.find(".choice-text").val("");
            $this.find(".choice-value").val("");
          } else {
            $this.find(".choice-checkbox").prop("checked", true);
          }
        });
        deleteRow("choices-table");
      });
    });
    $("#update-question").on("click", function () {
      var choices = [];
      $("#choices-table").find("tr").each(function () {
        var $this = $(this);
        var text = $this.find(".choice-text").val();
        var value = $this.find(".choice-value").val();
        if (text != "" && value != "") {
          choices.push({
            "text": text,
            "value": value
          });
        }
      });
      if (choices.length == 0) choices = undefined;
      var $questionText = $("#want-question-text");
      var t = $questionText.val().trim();
      if (t == "") t = undefined;
      var $questionTopicId = $("#want-question-topic-id");
      var ti = $questionTopicId.val();
      if (ti == "") ti = undefined;
      var $questionScenarioId = $("#want-question-scenario-id");
      var si = $questionScenarioId.val();
      if (si == "") si = undefined;
      var $questionId = $("#want-question-update-id");
      var qi = $questionId.val();
      if (qi == "") qi = undefined;
      var $questionOrder = $("#want-question-order");
      var order = $questionOrder.val();
      if (order == "") order = undefined;
      var $questionPage = $("#want-question-order");
      var page = $questionPage.val();
      if (page == "") page = undefined;
      var $questionShuffleChoices = $("#want-question-shuffle-choices");
      var shuffle = $questionShuffleChoices.is(":checked");
      envObj.updateQuestion(qi, t, choices, ti, si, order, page, shuffle, function (returnData) {
        console.log(returnData);
        $questionText.val("");
        $questionTopicId.val("");
        $questionScenarioId.val("");
        $questionId.val("");
        $questionOrder.val("");
        $questionPage.val("");
        $questionShuffleChoices.prop("checked", false);
        $("#choices-table").find("tr").each(function (idx) {
          var $this = $(this);
          if (idx == 0) {
            $this.find(".choice-text").val("");
            $this.find(".choice-value").val("");
          } else {
            $this.find(".choice-checkbox").prop("checked", true);
          }
        });
        deleteRow("choices-table");
      });
    });
    $("#delete-question").on("click", function () {
      var $questionId = $("#want-question-delete-id");
      var qi = $questionId.val();
      if (qi == "") qi = undefined;
      envObj.deleteQuestion(qi, function (returnData) {
        console.log(returnData);
        $questionId.val("");
      });
    });
    // End for Question
    // Start for Mood
    $("#get-all-mood").on("click", function () {
      envObj.getAllMood(function (returnData) {
        console.log(returnData);
      });
    });
    $("#get-mood-by-id").on("click", function () {
      var $moodId = $("#want-mood-get-id");
      var mi = $moodId.val();
      if (mi == "") mi = undefined;
      envObj.getMoodById(mi, function (returnData) {
        console.log(returnData);
        $moodId.val("");
      });
    });
    $("#create-mood").on("click", function () {
      var $moodName = $("#want-mood-name");
      var $moodImage = $("#want-mood-image");
      var $moodOrder = $("#want-mood-order");
      var n = $moodName.val().trim();
      if (n == "") n = undefined;
      var i = $moodImage.val().trim();
      if (i == "") i = undefined;
      var order = $moodOrder.val().trim();
      if (order == "") order = undefined;
      envObj.createMood(n, i, order, function (returnData) {
        console.log(returnData);
        $moodName.val("");
        $moodImage.val("");
      });
    });
    $("#update-mood").on("click", function () {
      var $moodId = $("#want-mood-update-id");
      var $moodName = $("#want-mood-name");
      var $moodImage = $("#want-mood-image");
      var mi = $moodId.val();
      if (mi == "") mi = undefined;
      var n = $moodName.val().trim();
      if (n == "") n = undefined;
      var i = $moodImage.val().trim();
      if (i == "") i = undefined;
      envObj.updateMood(mi, n, i, function (returnData) {
        console.log(returnData);
        $moodName.val("");
        $moodId.val("");
        $moodImage.val("");
      });
    });
    $("#delete-mood").on("click", function () {
      var $moodId = $("#want-mood-delete-id");
      var mi = $moodId.val();
      if (mi == "") mi = undefined;
      envObj.deleteMood(mi, function (returnData) {
        console.log(returnData);
        $moodId.val("");
      });
    });
    // End for Mood
    // Start for Vision
    $("#get-all-vision").on("click", function () {
      envObj.getAllVision(function (returnData) {
        console.log(returnData);
      });
    });
    $("#get-vision-by-scenario-id").on("click", function () {
      var $scenarioId = $("#want-vision-get-scenario-id");
      var si = $scenarioId.val();
      if (si == "") si = undefined;
      envObj.getVisionByScenarioId(si, function (returnData) {
        console.log(returnData);
        $scenarioId.val("");
        var printData = [];
        for (var i = 0; i < returnData["data"].length; i++) {
          var m = returnData["data"][i]["medias"][0];
          printData.push({
            "url": m["url"],
            "description": m["description"],
            "unsplash_creator_url": m["unsplash_creator_url"],
            "unsplash_creator_name": m["unsplash_creator_name"],
            "unsplash_image_id": m["unsplash_image_id"]
          });
        }
        console.log(JSON.stringify(printData));
      });
    });
    $("#get-vision-by-user-id").on("click", function () {
      var $userId = $("#want-vision-get-user-id");
      var ui = $userId.val();
      if (ui == "") ui = undefined;
      envObj.getVisionByUserId(ui, function (returnData) {
        console.log(returnData);
        $userId.val("");
      });
    });
    $("#get-vision-by-id").on("click", function () {
      var $visionId = $("#want-vision-get-id");
      var vi = $visionId.val();
      if (vi == "") vi = undefined;
      envObj.getVisionById(vi, function (returnData) {
        console.log(returnData);
        $visionId.val("");
      });
    });
    $("#delete-vision").on("click", function () {
      var $visionId = $("#want-vision-delete-id");
      var vi = $visionId.val();
      if (vi == "") vi = undefined;
      envObj.deleteVision(vi, function (returnData) {
        console.log(returnData);
        $visionId.val("");
      });
    });
    // End for Vision
    // Start for Answer
    $("#get-all-answer").on("click", function () {
      envObj.getAllAnswer(function (returnData) {
        console.log(returnData);
      });
    });
    $("#get-answer-by-topic-id").on("click", function () {
      var $topicId = $("#want-answer-get-topic-id");
      var ti = $topicId.val();
      if (ti == "") ti = undefined;
      envObj.getAnswerByTopicId(ti, function (returnData) {
        console.log(returnData);
        $topicId.val("");
      });
    });
    $("#get-answer-by-scenario-id").on("click", function () {
      var $scenarioId = $("#want-answer-get-scenario-id");
      var si = $scenarioId.val();
      if (si == "") si = undefined;
      envObj.getAnswerByScenarioId(si, function (returnData) {
        console.log(returnData);
        $scenarioId.val("");
      });
    });
    $("#get-answer-by-user-id").on("click", function () {
      var $userId = $("#want-answer-get-user-id");
      var ui = $userId.val();
      if (ui == "") ui = undefined;
      envObj.getAnswerByUserId(ui, function (returnData) {
        console.log(returnData);
        $userId.val("");
      });
    });
    $("#get-answer-by-question-id").on("click", function () {
      var $questionId = $("#want-answer-get-question-id");
      var qi = $questionId.val();
      if (qi == "") qi = undefined;
      envObj.getAnswerByQuestionId(qi, function (returnData) {
        console.log(returnData);
        $questionId.val("");
      });
    });
    $("#get-answer-by-id").on("click", function () {
      var $answerId = $("#want-answer-get-id");
      var ai = $answerId.val();
      if (ai == "") ai = undefined;
      envObj.getAnswerById(ai, function (returnData) {
        console.log(returnData);
        $answerId.val("");
      });
    });
    $("#delete-answer").on("click", function () {
      var $answerId = $("#want-answer-delete-id");
      var ai = $answerId.val();
      if (ai == "") ai = undefined;
      envObj.deleteAnswer(ai, function (returnData) {
        console.log(returnData);
        $answerId.val("");
      });
    });
    // End for Answer
    // Start for Game
    $("#get-all-game").on("click", function () {
      envObj.getAllGame(function (returnData) {
        console.log(returnData);
      });
    });
    $("#get-game-by-id").on("click", function () {
      var $gameId = $("#want-game-get-id");
      var gi = $gameId.val();
      if (gi == "") gi = undefined;
      envObj.getGameById(gi, function (returnData) {
        console.log(returnData);
        $gameId.val("");
      });
    });
    $("#get-game-by-user-id").on("click", function () {
      var $userId = $("#want-game-get-user-id");
      var ui = $userId.val();
      if (ui == "") ui = undefined;
      envObj.getGameByUserId(ui, function (returnData) {
        console.log(returnData);
        $userId.val("");
      });
    });
    $("#get-game-by-vision-id").on("click", function () {
      var $visionId = $("#want-game-get-vision-id");
      var vi = $visionId.val();
      if (vi == "") vi = undefined;
      envObj.getGameByVisionId(vi, function (returnData) {
        console.log(returnData);
        $visionId.val("");
      });
    });
    $("#delete-game").on("click", function () {
      var $gameId = $("#want-game-delete-id");
      var gi = $gameId.val();
      if (gi == "") gi = undefined;
      envObj.deleteGame(gi, function (returnData) {
        console.log(returnData);
        $gameId.val("");
      });
    });
    // End for Game
    // Start for dangerous operations
    $("#confirm-delete-all-data").on("change", function () {
      $("#delete-all-data").prop("disabled", !$(this).is(":checked"));
    });
    $("#delete-all-data").on("click", function () {
      $(this).prop("disabled", true);
      $("#confirm-delete-all-data").prop("checked", false);
      deleteAllData(envObj);
    });
    $("#confirm-set-initial-data").on("change", function () {
      $("#set-initial-data").prop("disabled", !$(this).is(":checked"));
    });
    $("#set-initial-data").on("click", function () {
      $(this).prop("disabled", true);
      $("#confirm-set-initial-data").prop("checked", false);
      setInitialData(envObj);
    });
    // End for dangerous operations
  }

  /**
   * Copy the first row of a table and add it to the table.
   * @private
   * @param {string} tableID - ID of the table DOM element.
   */
  function addRow(tableID) {
    var table = document.getElementById(tableID);
    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);
    var colCount = table.rows[0].cells.length;
    for (var i = 0; i < colCount; i++) {
      var newcell = row.insertCell(i);
      newcell.innerHTML = table.rows[0].cells[i].innerHTML;
      switch (newcell.childNodes[0].type) {
        case "text":
          newcell.childNodes[0].value = "";
          break;
        case "checkbox":
          newcell.childNodes[0].checked = false;
          break;
        case "select-one":
          newcell.childNodes[0].selectedIndex = 0;
          break;
      }
    }
  }

  /**
   * Delete rows in a table that have the checkbox checked.
   * @private
   * @param {string} tableID - ID of the table DOM element.
   */
  function deleteRow(tableID) {
    try {
      var table = document.getElementById(tableID);
      var rowCount = table.rows.length;
      for (var i = 0; i < rowCount; i++) {
        var row = table.rows[i];
        var chkbox = row.cells[0].childNodes[0];
        if (null != chkbox && true == chkbox.checked) {
          if (rowCount <= 1) {
            console.log("Cannot delete all the rows.");
            break;
          }
          table.deleteRow(i);
          rowCount--;
          i--;
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Delete all topics, scenarios, and questions.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   */
  function deleteAllData(envObj) {
    // TODO: make this function not depend on the timer
    console.log("Start deleting data...");
    // Delete all games
    envObj.getAllGame(function (returnData) {
      var data = returnData["data"];
      for (var i = 0; i < data.length; i++) {
        envObj.deleteGame(data[i]["id"], function () {
          console.log("Game deleted");
        });
      }
    });
    // Delete all answers
    window.setTimeout(function () {
      envObj.getAllAnswer(function (returnData) {
        var data = returnData["data"];
        for (var i = 0; i < data.length; i++) {
          envObj.deleteAnswer(data[i]["id"], function () {
            console.log("Answer deleted");
          });
        }
      });
    }, 1000);
    // Delete all visions
    window.setTimeout(function () {
      envObj.getAllVision(function (returnData) {
        var data = returnData["data"];
        for (var i = 0; i < data.length; i++) {
          envObj.deleteVision(data[i]["id"], function () {
            console.log("Vision deleted");
          });
        }
      });
    }, 5000);
    // Delete all questions
    window.setTimeout(function () {
      envObj.getAllQuestion(undefined, function (returnData) {
        var data = returnData["data"];
        var questionIdList = [];
        for (var i = 0; i < data.length; i++) {
          questionIdList.push(data[i]["id"]);
        }
        envObj.deleteQuestionList(questionIdList, function () {
          console.log("Question deleted");
        });
      });
    }, 6000);
    // Delete all scenarios
    window.setTimeout(function () {
      envObj.getAllScenario(function (returnData) {
        var data = returnData["data"];
        for (var i = 0; i < data.length; i++) {
          envObj.deleteScenario(data[i]["id"], function () {
            console.log("Scenario deleted");
          });
        }
      });
    }, 21000);
    // Delete all topics
    window.setTimeout(function () {
      envObj.getAllTopic(function (returnData) {
        var data = returnData["data"];
        for (var i = 0; i < data.length; i++) {
          envObj.deleteTopic(data[i]["id"], function () {
            console.log("Topic deleted");
          });
        }
      });
    }, 22000);
    // Delete all moods
    window.setTimeout(function () {
      envObj.getAllMood(function (returnData) {
        var data = returnData["data"];
        for (var i = 0; i < data.length; i++) {
          envObj.deleteMood(data[i]["id"], function () {
            console.log("Mood deleted");
          });
        }
      });
    }, 23000);
  }

  /**
   * Add a set of scenario, question, and vision.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   */
  function addDataSet(envObj, topicId, scenarioPath, scenarioQuestionPath, moodId, visionPath) {
    $.getJSON(scenarioPath, function (s) {
      envObj.createScenario(s["title"], s["description"], s["image"], topicId, s["mode"], s["view"], function (scenarioData) {
        console.log("Scenario created", scenarioData);
        var scenarioId = scenarioData["data"]["id"];
        addQuestion(envObj, scenarioQuestionPath, undefined, scenarioId); // scenario questions
        addVision(envObj, moodId, scenarioId, visionPath);
      });
    });
  }

  /**
   * Add a set of visions.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   */
  function addVision(envObj, moodId, scenarioId, visionPath, success, error) {
    $.getJSON(visionPath, function (visions) {
      addVisionInOrder(envObj, moodId, scenarioId, visions, [], success, error);
    });
  }

  /**
   * Add visions in the specified order.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   */
  function addVisionInOrder(envObj, moodId, scenarioId, visions, visionList, success, error) {
    if (visions.length == 0) {
      if (typeof success === "function") success(visionList);
      return true;
    } else {
      var v = visions[0];
      var d = v["description"];
      var url = v["url"];
      var iid = v["unsplash_image_id"];
      var cn = v["unsplash_creator_name"];
      var cu = v["unsplash_creator_url"];
      envObj.createVision(moodId, scenarioId, d, url, iid, cn, cu, function (visionData) {
        console.log("Vision created", visionData);
        visionList.push(visionData["data"]);
        addVisionInOrder(envObj, moodId, scenarioId, visions.slice(1), visionList, success, error);
      }, function () {
        if (typeof error === "function") error();
        return false;
      });
    }
  }

  /**
   * Add a set of moods.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   */
  function addMood(envObj, moodPath, success, error) {
    $.getJSON(moodPath, function (moods) {
      addMoodInOrder(envObj, moods, [], success, error);
    });
  }

  /**
   * Add moods in the specified order.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   */
  function addMoodInOrder(envObj, moods, moodList, success, error) {
    if (moods.length == 0) {
      if (typeof success === "function") success(moodList);
      return true;
    } else {
      var m = moods[0];
      envObj.createMood(m["name"], m["image"], m["order"], function (moodData) {
        console.log("Mood created", moodData);
        moodList.push(moodData["data"]);
        addMoodInOrder(envObj, moods.slice(1), moodList, success, error);
      }, function () {
        if (typeof error === "function") error();
        return false;
      });
    }
  }

  /**
   * Add a set of questions.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   */
  function addQuestion(envObj, questionPath, topicId, scenarioId, success, error) {
    $.getJSON(questionPath, function (questions) {
      for (var i = 0; i < questions.length; i++) {
        questions[i]["topic_id"] = topicId;
        questions[i]["scenario_id"] = scenarioId;
      }
      envObj.createQuestionList(questions, function (returnData) {
        console.log("Questions created", returnData);
      }, error);
    });
  }

  /**
   * Add initial data to the application.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   */
  function setInitialData(envObj) {
    addMood(envObj, "file/mood.json", function (moodList) {
      var moodId = moodList[(moodList.length - 1) / 2]["id"]; // ID of the "Neutral" mood
      // Add the deployement studies
      $.getJSON("file/topic_1.json", function (t) {
        envObj.createTopic(t["title"], t["description"], function (topicData) {
          console.log("Topic created", topicData);
          var topicId = topicData["data"]["id"];
          addQuestion(envObj, "file/topic_1_question.json", topicId, undefined); // topic questions
          addDataSet(envObj, topicId, "file/scenario_1.json", "file/scenario_1_question.json", moodId, "file/scenario_1_vision.json");
          addDataSet(envObj, topicId, "file/scenario_2.json", "file/scenario_2_question.json", moodId, "file/scenario_2_vision.json");
          //addDataSet(envObj, topicId, "file/scenario_3.json", "file/scenario_3_question.json", moodId, "file/empty.json");
          addDataSet(envObj, topicId, "file/scenario_4.json", "file/scenario_4_question.json", moodId, "file/scenario_4_vision.json");
        });
      });
      // Add the crowdscouring experiments
      var numOfModes = 3;
      var numOfViews = 5;
      var fileEndList = [];
      for (var i = 1; i < numOfModes + 1; i++) {
        for (var j = 1; j < numOfViews + 1; j++) {
          fileEndList.push("_mode_" + i + "_view_" + j + ".json");
        }
      }
      $.when.apply($, fileEndList.map(function (fileEnd) {
        var filePath = "file/experiment/";
        return $.getJSON(filePath + "topic_4" + fileEnd, function (t) {
          envObj.createTopic(t["title"], t["description"], function (topicData) {
            console.log("Topic created", topicData);
            var topicId = topicData["data"]["id"];
            addQuestion(envObj, filePath + "topic_4_question.json", topicId, undefined); // topic questions
            addDataSet(envObj, topicId, filePath + "scenario_4" + fileEnd, filePath + "scenario_4_question" + fileEnd, moodId, "file/empty.json");
          });
        });
      }));
    });
  }

  /**
   * Initialize the page.
   * @private
   */
  function init() {
    var env = new periscope.Environment({
      "ready": function (envObj) {
        initUI(envObj);
        envObj.showPage();
      },
      "fail": function (message) {
        console.error(message);
      }
    });
  }
  $(init);
})();