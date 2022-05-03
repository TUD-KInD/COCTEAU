(function () {
  "use strict";

  var wantToReportScrollBottom = true;
  var previousScroll = 0;

  /**
   * Initialize the pagination UI.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {number} scenarioId - the scenario ID of the visions.
   */
  function initPagination(envObj, scenarioId) {
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
          envObj.addVisionsToContainer($("#browse"), data);
          wantToReportScrollBottom = true;
          previousScroll = 0;
        } else {
          console.error("No data during pagination.");
          $("#page-control").hide();
          $("#prompt-text").text("Currently, there are no visions created by people. Please come back later.");
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
   * Add the event to detect if the user scrolls the page to the end.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   */
  function addScrollEndEvent(envObj) {
    var $window = $(window);
    $window.on("scroll", function () {
      if (wantToReportScrollBottom && $window.scrollTop() + $window.height() == $(document).height()) {
        var currentScroll = $window.scrollTop();
        if (currentScroll > previousScroll) {
          envObj.sendTrackerEvent("scroll", {
            "value": 100
          });
          // Send a GA event with vision items
          wantToReportScrollBottom = false;
        }
        previousScroll = currentScroll;
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
    if (typeof scenarioId !== "undefined") {
      envObj.getScenarioById(scenarioId, function (data) {
        var scenario = data["data"];
        if ($.isEmptyObject(scenario)) {
          envObj.showErrorPage();
        } else {
          $("#scenario-title").text(scenario["title"]);
          $("#scenario-description").html(scenario["description"]);
          initPagination(envObj, scenarioId);
          addScrollEndEvent(envObj);
          envObj.showPage();
        }
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