(function () {
  "use strict";

  /**
   * Load the moods.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   */
  function loadMood(envObj) {
    envObj.getAllMood(function (data) {
      var moods = data["data"];
      periscope.util.sortArrayOfDictByKeyInPlace(moods, "order");
      var $moodOptionContainer = $("#mood-option-container");
      for (var i = 0; i < moods.length; i++) {
        var m = moods[i];
        $moodOptionContainer.append(createMoodHTML(m["id"], m["name"], "img/" + m["image"]));
      }
    });
  }

  /**
   * Create and display the dialog for submitting a vision.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {number} scenarioId - the desired scenario ID of the vision.
   * @param {function} [callback] - callback function after creating the dialog.
   */
  function createSubmitVisionDialog(envObj, scenarioId, callback) {
    var widgets = new edaplotjs.Widgets();
    // Set the image picker dialog
    // We need to give the parent element so that on small screens, the dialog can be scrollable
    var $submitVisionDialog = widgets.createCustomDialog({
      "selector": "#dialog-submit-vision",
      "action_text": "Submit",
      "width": 290,
      "class": "dialog-container-submit-vision",
      "cancel_text": "Close",
      "close_dialog_on_action": false,
      "action_callback": function () {
        submitVision(envObj, scenarioId, $submitVisionDialog);
      }
    });
    $submitVisionDialog.on("dialogclose", function () {
      handleSubmitVisionDialogClose($submitVisionDialog);
    });
    $(window).resize(function () {
      periscope.util.fitDialogToScreen($submitVisionDialog);
    });
    periscope.util.fitDialogToScreen($submitVisionDialog);
    if (typeof callback === "function") {
      callback($submitVisionDialog);
    }
  }

  /**
   * Create and display the image picker dialog.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {function} [callback] - callback function after creating the dialog.
   */
  function createPhotoPickerDialog(envObj, callback) {
    var widgets = new edaplotjs.Widgets();
    // Set the image picker dialog
    // We need to give the parent element so that on small screens, the dialog can be scrollable
    var $imagePickerDialog = widgets.createCustomDialog({
      "selector": "#dialog-photo-picker",
      "action_text": "Select",
      "width": 290,
      "class": "dialog-container-photo-picker",
      "show_cancel_btn": false,
      "action_callback": function () {
        var d = $($("#photos-masonry").find(".selected")[0]).data("raw");
        $("#vision-image").data("raw", d).prop("src", d["urls"]["regular"]);
      }
    });
    $imagePickerDialog.dialog("widget").find("button.ui-action-button").prop("disabled", true);
    $("#photo-search-form").on("submit", function (event) {
      event.preventDefault();
      var search = $("#photo-search-query").blur().val();
      if (search == "") {
        console.log("no search term");
      } else {
        //var url = "file/photo.json";
        var url = envObj.getApiRootUrl() + "/photos/random?query=" + search + "&count=30";
        $.getJSON(url, function (data) {
          $("#photos-masonry-error-message").hide();
          var $photos = $("#photos-masonry").empty().show();
          for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var imageUrl = d["urls"]["regular"];
            var credit = 'Credit: <a href="' + d["user"]["links"]["html"] + '" target="_blank">' + d["user"]["name"] + '</a>';
            var $d = createPhotoHTML(credit, imageUrl);
            $d.data("raw", d);
            $photos.append($d);
          }
          $photos.find("figure").on("click", function () {
            if ($(this).hasClass("selected")) {
              $(this).removeClass("selected");
              $imagePickerDialog.dialog("widget").find("button.ui-action-button").prop("disabled", true);
            } else {
              $photos.find(".selected").removeClass("selected");
              $(this).addClass("selected");
              $imagePickerDialog.dialog("widget").find("button.ui-action-button").prop("disabled", false);
            }
          });
        }).fail(function () {
          $("#photos-masonry").empty().hide();
          $("#photos-masonry-error-message").show();
        });
      }
    });
    $(window).resize(function () {
      periscope.util.fitDialogToScreen($imagePickerDialog);
    });
    periscope.util.fitDialogToScreen($imagePickerDialog);
    if (typeof callback === "function") {
      callback($imagePickerDialog);
    }
  }

  /**
   * Create the html elements for a mood.
   * @private
   * @param {number} moodId - the ID of the mood.
   * @param {string} name - the name of the mood.
   * @param {string} imageUrl - the source URL of an image for the mood.
   * @returns {Object} - a jQuery DOM object.
   */
  function createMoodHTML(moodId, name, imageUrl) {
    var radioId = "express-emotion-item-" + moodId;
    var html = '<div><input type="radio" name="express-emotion-scale" value="' + moodId + '" id="' + radioId + '"><label for="' + radioId + '">' + name + '<img src="' + imageUrl + '" /></label></div>';
    return $(html);
  }

  /**
   * Create the html elements for a photo.
   * @private
   * @param {string} credit - the credit of the photo.
   * @param {string} imageUrl - the source URL of an image for the photo.
   * @returns {Object} - a jQuery DOM object.
   */
  function createPhotoHTML(credit, imageUrl) {
    var html = '<figure style="display: none;"><img src="' + imageUrl + '"><div>' + credit + '</div></figure>';
    var $html = $(html);
    $html.find("img").one("load", function () {
      // Only show the figure when the image is loaded
      $(this).parent().show();
    });
    return $html;
  }

  /**
   * Submit the vision to the back-end.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {number} scenarioId - the scenario ID of the vision.
   * @param {object} $submitVisionDialog - the jQuery object for submitting the vision.
   */
  function submitVision(envObj, scenarioId, $submitVisionDialog) {
    $("#submit-vision-button").prop("disabled", true);
    $submitVisionDialog.dialog("widget").find("button.ui-action-button").prop("disabled", true);
    $("#vision-submitted-message").show();
    periscope.util.scrollTop($("#vision-submitted-message"), 0, $("#dialog-submit-vision"));
    var visionData = collectVisionData();
    var moodId = visionData["mood_id"];
    var d = visionData["description"];
    var url = visionData["url"];
    var iid = visionData["unsplash_image_id"];
    var cn = visionData["unsplash_creator_name"];
    var cu = visionData["unsplash_creator_url"];
    envObj.createVision(moodId, scenarioId, d, url, iid, cn, cu, function () {
      handleSubmitVisionSuccess();
    });
  }

  /**
   * Handle the situation when the jQuery dialog (for submitting the vision) is closed.
   * @private
   * @param {object} $submitVisionDialog - the jQuery object for submitting the vision.
   */
  function handleSubmitVisionDialogClose($submitVisionDialog) {
    $("#vision-submitted-message").hide();
    $submitVisionDialog.dialog("widget").find("button.ui-action-button").prop("disabled", false);
  }

  /**
   * Collect the vision data from DOM elements.
   * @private
   */
  function collectVisionData() {
    var rawImageData = $("#vision-image").data("raw");
    var data = {
      "mood_id": $("#mood-option-container").find("input[type='radio']:checked").val(),
      "url": rawImageData["urls"]["regular"],
      "unsplash_image_id": rawImageData["id"],
      "unsplash_creator_name": rawImageData["user"]["name"],
      "unsplash_creator_url": rawImageData["user"]["links"]["html"],
      "description": $("#vision-description").val()
    };
    return data;
  }

  /**
   * Sanity check before submitting a vision.
   * @private
   */
  function submitVisionSanityCheck() {
    var moodId = $("#mood-option-container").find("input[type='radio']:checked").val();
    if (typeof moodId === "undefined") {
      handleSubmitVisionError("(Would you please pick a mood?)");
      return false;
    }
    var imageData = $("#vision-image").data("raw");
    if (typeof imageData === "undefined") {
      handleSubmitVisionError("(Would you please select an image?)");
      return false;
    }
    var visionData = collectVisionData();
    var moodId = visionData["mood_id"];
    var d = visionData["description"];
    var url = visionData["url"];
    var cn = visionData["unsplash_creator_name"];
    var cu = visionData["unsplash_creator_url"];
    var $visionFrame = $("#submit-vision-frame figure");
    $visionFrame.find("img").prop("src", url);
    if (typeof d === "undefined" || d == "") {
      $visionFrame.find("figcaption").text("").hide();
    } else {
      $visionFrame.find("figcaption").show().text(d);
    }
    $visionFrame.find("a").prop("href", cu).text(cn);
    return true;
  }

  /**
   * Handle the error when submitting a vision.
   * @private
   * @param {string} errorMessage - the error message.
   */
  function handleSubmitVisionError(errorMessage) {
    console.error(errorMessage);
    $("#submit-vision-button").prop("disabled", false);
    $("#submit-error-message").text(errorMessage).stop(true).fadeIn(500).delay(5000).fadeOut(500);
  }

  /**
   * When submitting a vision successfully.
   * @private
   */
  function handleSubmitVisionSuccess() {
    $("#vision-image").removeData("raw").prop("src", "img/dummy_image.png");
    $("#submit-vision-button").prop("disabled", false);
    $("#express-emotion").find("input").prop("checked", false);
    $("#vision-description").val("");
  }

  /**
   * Load the content of the page.
   * @private
   * @param {Object} envObj - environment object (in environment.js).
   * @param {number} scenarioId - the ID of the scenario.
   */
  function loadPageContent(envObj, scenarioId) {
    envObj.getScenarioById(scenarioId, function (data) {
      var scenario = data["data"];
      if ($.isEmptyObject(scenario)) {
        envObj.showErrorPage();
      } else {
        $("#scenario-title").text(scenario["title"]);
        $("#scenario-description").html(scenario["description"]);
        loadMood(envObj);
        createPhotoPickerDialog(envObj, function ($dialog) {
          $("#vision-image-frame").on("click", function () {
            $dialog.dialog("open");
            $("#photo-search-query").focus();
          });
        });
        createSubmitVisionDialog(envObj, scenarioId, function ($dialog) {
          $("#submit-vision-button").on("click", function () {
            if (submitVisionSanityCheck()) {
              $dialog.dialog("open");
            }
          });
        });
        $("#game-button").on("click", function () {
          window.location.replace("game.html" + window.location.search);
        });
        $("#browse-button").on("click", function () {
          window.location.replace("browse.html" + window.location.search);
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
    if (typeof scenarioId !== "undefined") {
      envObj.checkUserConsent(topicId, function () {
        // The user has provided consent
        loadPageContent(envObj, scenarioId);
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