(function () {
  "use strict";

  /**
   * Initialize the pagination UI.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {number} scenarioId - the scenario ID of the visions.
   * @param {boolean} noImage - a flag to indicate that we want no images for the visions.
   */
  function initPagination(envObj, scenarioId, noImage) {
    var $pageNav = $("#page-navigator");
    var $pageControl = $("#page-control");
    var $pageBack = $("#page-back");
    var $pageNext = $("#page-next");
    $pageNav.pagination({
      dataSource: envObj.getApiRootUrl() + "/vision/?scenario_id=" + scenarioId,
      locator: "data",
      totalNumberLocator: function (response) {
        if (typeof response === "undefined") {
          return 0;
        } else {
          return parseInt(response["total"]);
        }
      },
      formatAjaxError: function () {
        console.error("Error during pagination.");
      },
      ajax: {
        type: "GET"
      },
      className: "paginationjs-custom",
      pageSize: 10,
      showPageNumbers: false,
      showNavigator: true,
      showGoInput: true,
      showGoButton: true,
      showPrevious: false,
      showNext: false,
      callback: function (data, pagination) {
        if (typeof data !== "undefined" && data.length > 0) {
          $(window).scrollTop(0);
          if (typeof noImage !== "undefined" && noImage) {
            envObj.addTextVisionsToContainer($("#browse"), data);
          } else {
            envObj.addVisionsToContainer($("#browse"), data);
          }
        } else {
          console.error("No data during pagination.");
          $("#page-control").hide();
        }
        // Handle pagination UI
        var totalPage = $pageNav.pagination("getTotalPage");
        if (typeof totalPage !== "undefined" && !isNaN(totalPage) && totalPage != 1) {
          if ($pageControl.hasClass("force-hidden")) {
            $pageControl.removeClass("force-hidden");
          }
          var pageNumber = pagination["pageNumber"];
          if (pageNumber == 1) {
            $pageBack.prop("disabled", true);
          } else {
            $pageBack.prop("disabled", false);
          }
          if (pageNumber == totalPage) {
            $pageNext.prop("disabled", true);
          } else {
            $pageNext.prop("disabled", false);
          }
        } else {
          if (!$pageControl.hasClass("force-hidden")) {
            $pageControl.addClass("force-hidden");
          }
        }
      }
    });
    $pageBack.on("click", function () {
      $pageNav.pagination("previous");
    });
    $pageNext.on("click", function () {
      $pageNav.pagination("next");
    });
  }

  /**
   * Load the content of the page.
   * If no questions are found for the desired view on that page, show the default view for that page (which is view=0).
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {number} scenarioId - the ID of the scenario.
   * @param {number} page - page of the scenario questions that we want to load.
   * @param {number} view - view of the scenario questions that we want to load.
   * @param {number} mode - the mode of the system configuration.
   */
  function loadPageContent(envObj, scenarioId, page, view, mode) {
    envObj.getScenarioById(scenarioId, function (data) {
      var scenario = data["data"];
      if ($.isEmptyObject(scenario)) {
        envObj.showErrorPage();
      } else {
        if (mode == 2) {
          // Mode 2 has no image
          initPagination(envObj, scenarioId, true);
        } else if (mode == 1) {
          // Mode 1 has both image and text
          initPagination(envObj, scenarioId, false);
        }
        var $questionContainer = $("#scenario-questions");
        envObj.addScenarioQuestionsToContainer($questionContainer, scenario["questions"], page, view, mode);
        $("#next-button").on("click", function () {
          envObj.submitScenarioAnswer($questionContainer, function () {
            var queryString = window.location.search;
            if (queryString.indexOf("page=" + page) !== -1) {
              // Increase the page number
              queryString = queryString.replace("page=" + page, "page=" + (page + 1));
            }
            window.location.href = "experiment-opinion.html" + queryString;
          }, function (errorMessage) {
            $("#submit-survey-error-message").text(errorMessage).stop(true).fadeIn(500).delay(5000).fadeOut(500);
          });
        });
        envObj.showPage();
      }
    });
  }

  /**
   * Initialize the user interface.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   */
  function initUI(envObj) {
    var queryParas = periscope.util.parseVars(window.location.search);
    var scenarioId = "scenario_id" in queryParas ? queryParas["scenario_id"] : undefined;
    var topicId = "topic_id" in queryParas ? queryParas["topic_id"] : undefined;
    var page = "page" in queryParas ? parseInt(queryParas["page"]) : 0;
    var view = "view" in queryParas ? parseInt(queryParas["view"]) : 0;
    var mode = "mode" in queryParas ? parseInt(queryParas["mode"]) : 0;
    if (typeof scenarioId !== "undefined" && topicId !== "undefined") {
      envObj.checkUserConsent(topicId, function () {
        // The user has provided consent
        loadPageContent(envObj, scenarioId, page, view, mode);
      });
    } else {
      envObj.showErrorPage();
    }
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