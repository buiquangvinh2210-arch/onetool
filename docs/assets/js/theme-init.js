(function () {
  try {
    var t = localStorage.getItem("lamai-theme");
    var root = document.documentElement;
    if (t) root.setAttribute("data-theme", t);
    else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.setAttribute("data-theme", "dark");
    }
  } catch (_) {}
})();
