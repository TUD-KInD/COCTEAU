(function () {
  "use strict";

  /**
   * Initialize the user interface.
   * @private
   */
  function initUI(envObj) {
    $("#get-all-topic").on("click", function () {
      envObj.getAllTopics(function (returnData) {
        console.log(returnData);
      });
    });
    $("#get-topic-by-id").on("click", function () {
      var $topicId = $("#want-topic-get-id");
      envObj.getTopicById($topicId.val(), function (returnData) {
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
      envObj.updateTopic($topicId.val(), t, d, function (returnData) {
        console.log(returnData);
        $topicTitle.val("");
        $topicDescription.val("");
        $topicId.val("");
      });
    });
    $("#delete-topic").on("click", function () {
      var $topicId = $("#want-topic-delete-id");
      envObj.deleteTopic($topicId.val(), function (returnData) {
        console.log(returnData);
        $topicId.val("");
      });
    });
    $("#get-all-scenario").on("click", function () {
      envObj.getAllScenarios(function (returnData) {
        console.log(returnData);
      });
    });
    $("#get-scenario-by-topic-id").on("click", function () {
      var $topicId = $("#want-scenario-get-topic-id");
      envObj.getScenarioByTopicId($topicId.val(), function (returnData) {
        console.log(returnData);
        $topicId.val("");
      });
    });
    $("#get-scenario-by-id").on("click", function () {
      var $scenarioId = $("#want-scenario-get-id");
      envObj.getScenarioById($scenarioId.val(), function (returnData) {
        console.log(returnData);
        $scenarioId.val("");
      });
    });
    $("#create-scenario").on("click", function () {
      var $scenarioTitle = $("#want-scenario-title");
      var $scenarioDescription = $("#want-scenario-description");
      var $scenarioImage = $("#want-scenario-image");
      var $scenarioTopicId = $("#want-scenario-topic-id");
      var t = $scenarioTitle.val().trim();
      if (t == "") t = undefined;
      var d = $scenarioDescription.val().trim();
      if (d == "") d = undefined;
      var i = $scenarioImage.val().trim();
      if (i == "") i = undefined;
      var ti = $scenarioTopicId.val();
      if (ti == "") ti = undefined;
      envObj.createScenario(t, d, i, ti, function (returnData) {
        console.log(returnData);
        $scenarioTitle.val("");
        $scenarioDescription.val("");
        $scenarioImage.val("");
        $scenarioTopicId.val("");
      });
    });
    $("#update-scenario").on("click", function () {
      var $scenarioTitle = $("#want-scenario-title");
      var $scenarioDescription = $("#want-scenario-description");
      var $scenarioImage = $("#want-scenario-image");
      var $scenarioTopicId = $("#want-scenario-topic-id");
      var $scenarioId = $("#want-scenario-update-id");
      var t = $scenarioTitle.val().trim();
      if (t == "") t = undefined;
      var d = $scenarioDescription.val().trim();
      if (d == "") d = undefined;
      var i = $scenarioImage.val().trim();
      if (i == "") i = undefined;
      var ti = $scenarioTopicId.val();
      if (ti == "") ti = undefined;
      envObj.updateScenario($scenarioId.val(), t, d, i, ti, function (returnData) {
        console.log(returnData);
        $scenarioTitle.val("");
        $scenarioDescription.val("");
        $scenarioImage.val("");
        $scenarioTopicId.val("");
        $scenarioId.val("");
      });
    });
    $("#delete-scenario").on("click", function () {
      var $scenarioId = $("#want-scenario-delete-id");
      envObj.deleteScenario($scenarioId.val(), function (returnData) {
        console.log(returnData);
        $scenarioId.val("");
      });
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
      },
      "fail": function (message) {
        console.error(message);
      }
    });
  }
  $(init);
})();