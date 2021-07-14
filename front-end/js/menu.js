(function () {
  "use strict";

  /**
   * Load the menu bar.
   * @private
   */
  function loadMenu() {
    $(".menu-container").load("menu.html");
  }
  $(loadMenu);
})();