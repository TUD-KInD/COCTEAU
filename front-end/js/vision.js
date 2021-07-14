(function () {
  "use strict";

  /**
   * Load the scenario title and description.
   * @private
   * @param {number} scenarioId - the ID of the scenario.
   */
  function loadScenario(scenarioId) {
    $.getJSON("file/scenario.json", function (data) {
      var scenarioData = data[scenarioId];
      $("#scenario-title").text(scenarioData["title"]);
      $("#scenario-description").html(scenarioData["description"]);
    });
  }

  /**
   * Create and display the image picker dialog.
   * @private
   * @param {function} [callback] - callback function after creating the dialog.
   * @todo Make this a reusable function in the website template.
   * @todo Add our curated memes to the photo selections.
   * @todo Show an error message when there is no search term.
   */
  function createPhotoPickerDialog(callback) {
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
        $("#vision-image").prop("src", d["urls"]["regular"]);
      },
    });
    $imagePickerDialog.parent().find(".ui-dialog-buttonpane button").prop("disabled", true);
    if (typeof callback === "function") {
      callback($imagePickerDialog);
    }
    $("#photo-search-form").on("submit", function (event) {
      event.preventDefault();
      var search = $("#photo-search-query").blur().val();
      if (search == "") {
        console.log("no search term");
      } else {
        //var url = "file/photo.json";
        var url = periscope.environment.getApiRootUrl() + "/photos/random?query=" + search + "&count=30";
        $.getJSON(url, function (data) {
          var $photos = $("#photos-masonry").empty().show();
          for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var imageSrc = d["urls"]["regular"];
            var credit = 'Credit: <a href="' + d["user"]["links"]["html"] + '" target="_blank">' + d["user"]["name"] + '</a>';
            var $d = createPhotoHTML(credit, imageSrc);
            $d.data("raw", d);
            $photos.append($d);
          }
          $photos.find("figure").on("click", function () {
            if ($(this).hasClass("selected")) {
              $(this).removeClass("selected");
              $imagePickerDialog.parent().find(".ui-dialog-buttonpane button").prop("disabled", true);
            } else {
              $photos.find(".selected").removeClass("selected");
              $(this).addClass("selected");
              $imagePickerDialog.parent().find(".ui-dialog-buttonpane button").prop("disabled", false);
            }
          });
        });
      }
    });
    $(window).resize(function () {
      periscope.util.fitDialogToScreen($imagePickerDialog);
    });
    periscope.util.fitDialogToScreen($imagePickerDialog);
  }

  /**
   * Create the html elements for a photo.
   * @private
   * @param {string} credit - the credit of the photo.
   * @param {string} imageSrc - the source URL of an image for the photo.
   * @returns {Object} - a jQuery DOM object.
   */
  function createPhotoHTML(credit, imageSrc) {
    var html = '<figure><img src="' + imageSrc + '"><div>' + credit + '</div></figure>';
    return $(html);
  }

  /**
   * Initialize the page.
   * @private
   * @todo Only enable the next button when all the questions are filled.
   * @todo If scenario_id is not defined, show a blank page with error messages.
   */
  function init() {
    var queryParas = periscope.util.parseVars(window.location.search);
    var scenarioId = "scenario_id" in queryParas ? queryParas["scenario_id"] : undefined;
    if (typeof scenarioId !== "undefined") {
      loadScenario(scenarioId);
      createPhotoPickerDialog(function ($imagePickerDialog) {
        $("#vision-image-frame").click(function () {
          $imagePickerDialog.dialog("open");
        });
      });
      $("#vision-button").on("click", function () {
        window.location.replace("vision.html" + window.location.search);
      });
      $("#game-button").on("click", function () {
        window.location.replace("game.html" + window.location.search);
      });
      $("#browse-button").on("click", function () {
        window.location.replace("browse.html" + window.location.search);
      });
    }
  }
  $(init);
})();