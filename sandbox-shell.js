/* Redmark Forge Sandbox — shared shell behaviour (drawer toggle on narrow screens).
   Static markup works without this script; it only adds the mobile menu. */
(function () {
  "use strict";
  var body = document.body;
  var btn = document.querySelector(".rf-menu-btn");
  var side = document.getElementById("rf-side");
  var scrim = document.querySelector(".rf-scrim");
  if (!btn || !side) return;

  function setOpen(open) {
    body.classList.toggle("rf-nav-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    btn.textContent = open ? "✕" : "☰";
    if (scrim) scrim.hidden = !open;
    if (open) {
      var active = side.querySelector(".rf-link.is-active") || side.querySelector(".rf-link");
      if (active && active.scrollIntoView) active.scrollIntoView({ block: "center" });
    }
  }

  btn.addEventListener("click", function () { setOpen(!body.classList.contains("rf-nav-open")); });
  if (scrim) scrim.addEventListener("click", function () { setOpen(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && body.classList.contains("rf-nav-open")) { setOpen(false); btn.focus(); }
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 900 && body.classList.contains("rf-nav-open")) setOpen(false);
  });
  setOpen(false);

  // Keep the active item visible in the (scrollable) desktop sidebar too.
  var current = side.querySelector(".rf-link.is-active");
  if (current && current.scrollIntoView && window.innerWidth > 900) current.scrollIntoView({ block: "nearest" });
})();
