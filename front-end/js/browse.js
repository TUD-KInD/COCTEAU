(function () {
  "use strict";

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
   * Load and display visions.
   * @private
   * @param {Vision[]} visions - environment object (in environment.js).
   */
  function loadVision(visions) {
    var $browse = $("#browse").empty();
    for (var i = 0; i < visions.length; i++) {
      var v = visions[i];
      var media = v["medias"][0];
      var imageSrc = media["url"];
      var caption = media["description"];
      var credit = 'Credit: <a href="' + media["unsplash_creator_url"] + '" target="_blank">' + media["unsplash_creator_name"] + '</a>';
      var $t = createVisionHTML(caption, imageSrc, credit);
      $t.attr("id", "vision-id-" + v["id"]);
      $browse.append($t);
    }
  }

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
      pageSize: 20,
      showPageNumbers: false,
      showNavigator: true,
      showGoInput: true,
      showGoButton: true,
      showPrevious: false,
      showNext: false,
      callback: function (data, pagination) {
        if (typeof data !== "undefined" && data.length > 0) {
          $(window).scrollTop(0);
          loadVision(data);
        } else {
          console.error("No data during pagination.");
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