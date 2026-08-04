/* =========================================================================
   dsuh02.github.io
   No framework, no build step. Everything degrades if this file never loads.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- theme */
  var root = document.documentElement;
  var themeBtn = document.getElementById("themeBtn");

  function systemTheme() {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  function currentTheme() {
    return root.getAttribute("data-theme") || systemTheme();
  }
  function setTheme(next, remember) {
    root.setAttribute("data-theme", next);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "light" ? "#f7f6f2" : "#0a0c10");
    if (remember) {
      try { localStorage.setItem("theme", next); } catch (e) { /* private mode */ }
    }
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      setTheme(currentTheme() === "light" ? "dark" : "light", true);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "t" && e.key !== "T") return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target.tagName;
    if (t === "INPUT" || t === "TEXTAREA" || e.target.isContentEditable) return;
    setTheme(currentTheme() === "light" ? "dark" : "light", true);
  });

  /* ------------------------------------------------------------ mobile nav */
  var navIn = document.getElementById("navIn");
  var navBtn = document.getElementById("navBtn");
  var navLinks = document.getElementById("navLinks");

  function closeNav() {
    if (!navIn) return;
    navIn.setAttribute("data-open", "false");
    if (navBtn) navBtn.setAttribute("aria-expanded", "false");
  }
  if (navBtn && navIn) {
    navBtn.addEventListener("click", function () {
      var open = navIn.getAttribute("data-open") === "true";
      navIn.setAttribute("data-open", open ? "false" : "true");
      navBtn.setAttribute("aria-expanded", open ? "false" : "true");
    });
  }
  if (navLinks) {
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* --------------------------------------------------------- sticky border */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (nav) nav.setAttribute("data-stuck", window.scrollY > 8 ? "true" : "false");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ------------------------------------------------------------- scrollspy */
  var sections = [].slice.call(document.querySelectorAll("main section[id]"));
  var linkFor = {};
  [].forEach.call(document.querySelectorAll('.nav__links a[href^="#"]'), function (a) {
    linkFor[a.getAttribute("href").slice(1)] = a;
  });

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var a = linkFor[entry.target.id];
        if (!a) return;
        if (entry.isIntersecting) {
          for (var k in linkFor) linkFor[k].removeAttribute("aria-current");
          a.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------------------------------------------------------- numbers
     There used to be count-up animation on the stat strip. It was removed on
     purpose: it overwrote correct markup with a tween that starts at zero, so
     any stalled frame, throttled tab, or screenshot caught the page claiming
     "0 columns encrypted". The numbers are the whole point of that strip, so
     they are plain text now and always right. */

  /* ------------------------------------------------------------------ year */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* ----------------------------------------------------------------- toast */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg, ms) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.setAttribute("data-show", "true");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.setAttribute("data-show", "false");
    }, ms || 3600);
  }

  /* ------------------------------------------------------------ easter egg
     Type "ready" anywhere. It is a joke about the health-probe work above:
     a probe that reports the boot routine finished is not the same as a
     probe that checked anything.                                          */
  var buf = "";
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target.tagName;
    if (t === "INPUT" || t === "TEXTAREA" || e.target.isContentEditable) return;
    if (e.key.length !== 1) return;

    buf = (buf + e.key.toLowerCase()).slice(-12);

    if (buf.indexOf("ready") !== -1) {
      buf = "";
      toast("GET /health/ready -> 200 OK   ( and this one actually checked )", 4500);
      if (window.console && console.log) {
        console.log(
          "%c GET /health/ready %c 200 OK ",
          "background:#b8f24a;color:#0a0c10;font-weight:700;border-radius:3px 0 0 3px",
          "background:#12151b;color:#b8f24a;border-radius:0 3px 3px 0"
        );
        console.log("A probe that reports startup finished is not the same as a probe that checked something.");
        console.log("Ask me about it: dsuh3508@gmail.com");
      }
    }
  });
})();
