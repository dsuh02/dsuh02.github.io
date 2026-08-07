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

  /* ------------------------------------------------- scroll-driven decoration
     One rAF-throttled scroll handler drives the progress bar, the hero
     parallax, and the section rail. Everything it touches is decorative, so a
     failure here costs polish and nothing else. */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var prog = document.getElementById("prog");
  var rail = document.getElementById("rail");

  // build the rail from whatever sections exist, so it cannot fall out of sync
  var railDots = [];
  if (rail && sections.length) {
    sections.forEach(function () {
      var d = document.createElement("i");
      rail.appendChild(d);
      railDots.push(d);
    });
  }

  var queued = false;
  function onScrollFrame() {
    queued = false;
    var doc = document.documentElement;
    var y = window.scrollY;
    var max = doc.scrollHeight - window.innerHeight;

    var p = max > 0 ? Math.max(0, Math.min(1, y / max)) : 0;

    if (prog) prog.style.width = (p * 100).toFixed(2) + "%";

    // Nothing else here touches the background. It is a fixed, anchored layer:
    // the movement you see is the content travelling over it, which costs zero
    // work per frame and is the whole point of the effect.

    // rail: mark everything above the midpoint as seen, nearest one as active
    if (railDots.length) {
      var mid = y + window.innerHeight * 0.4;
      var activeIdx = 0;
      for (var i = 0; i < sections.length; i++) {
        var top = sections[i].offsetTop;
        var seen = mid >= top;
        railDots[i].setAttribute("data-seen", seen ? "true" : "false");
        if (seen) activeIdx = i;
      }
      for (var j = 0; j < railDots.length; j++) {
        railDots[j].setAttribute("data-active", j === activeIdx ? "true" : "false");
      }
    }
  }
  function onScrollDecor() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(onScrollFrame);
  }
  onScrollFrame();
  window.addEventListener("scroll", onScrollDecor, { passive: true });
  window.addEventListener("resize", onScrollDecor);

  /* -------------------------------------------------------- cursor spotlight
     Writes --mx/--my on the hovered card. The CSS has fallback values, so if
     this never runs the cards simply have no spotlight. */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.addEventListener("pointermove", function (e) {
      var card = e.target.closest && e.target.closest(".card");
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%");
    }, { passive: true });
  }

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

  /* ------------------------------------------------------- command palette
     Cmd+K / Ctrl+K. Every action here is reachable another way (a nav link, a
     button, a keyboard shortcut), so this is convenience, never the only path. */
  var EMAIL = "dsuh3508@gmail.com";

  function copyEmail() {
    function ok() { toast("Copied " + EMAIL + " to your clipboard"); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(ok, fallback);
    } else { fallback(); }
    function fallback() {
      // older Safari and any non-secure context
      var ta = document.createElement("textarea");
      ta.value = EMAIL;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:-100px;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      var done = false;
      try { done = document.execCommand("copy"); } catch (e) { done = false; }
      document.body.removeChild(ta);
      if (done) { ok(); } else { toast("Copy failed. The address is " + EMAIL, 6000); }
    }
  }

  function goto(hash) {
    var el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", hash);
  }

  var ACTIONS = [
    { label: "Work",            sub: "what I do day to day",       run: function () { goto("#work"); } },
    { label: "Projects",        sub: "things I built for myself",  run: function () { goto("#projects"); } },
    { label: "Stack",           sub: "tools I reach for",          run: function () { goto("#stack"); } },
    { label: "Writing",         sub: "published articles",         run: function () { goto("#writing"); } },
    { label: "About",           sub: "the short version",          run: function () { goto("#about"); } },
    { label: "Contact",         sub: "get in touch",               run: function () { goto("#contact"); } },
    { label: "Download resume", sub: "one page, PDF",              run: function () { window.open("assets/Daniel-Suh-Resume.pdf", "_blank", "noopener"); } },
    { label: "Copy my email",   sub: EMAIL,                        run: copyEmail },
    { label: "GitHub",          sub: "github.com/dsuh02",          run: function () { window.open("https://github.com/dsuh02", "_blank", "noopener"); } },
    { label: "LinkedIn",        sub: "in/danielsuh8205",           run: function () { window.open("https://www.linkedin.com/in/danielsuh8205/", "_blank", "noopener"); } },
    { label: "Toggle theme",    sub: "or just press t",            run: function () { setTheme(currentTheme() === "light" ? "dark" : "light", true); } },
    { label: "Top of page",     sub: "back to the start",          run: function () { window.scrollTo({ top: 0, behavior: "smooth" }); } }
  ];

  var pal = document.getElementById("pal");
  var palIn = document.getElementById("palIn");
  var palList = document.getElementById("palList");
  var filtered = ACTIONS.slice();
  var cursor = 0;
  var lastFocus = null;

  function renderPal() {
    palList.innerHTML = "";
    if (!filtered.length) {
      var none = document.createElement("div");
      none.className = "pal__empty";
      none.textContent = "Nothing matches that.";
      palList.appendChild(none);
      return;
    }
    filtered.forEach(function (a, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "pal__item";
      b.setAttribute("role", "option");
      b.setAttribute("aria-selected", i === cursor ? "true" : "false");
      b.innerHTML = '<span class="lbl"></span><span class="sub"></span>';
      b.querySelector(".lbl").textContent = a.label;
      b.querySelector(".sub").textContent = a.sub;
      b.addEventListener("click", function () { closePal(); a.run(); });
      b.addEventListener("mousemove", function () {
        if (cursor === i) return;
        cursor = i; syncSelection();
      });
      palList.appendChild(b);
    });
  }
  function syncSelection() {
    var items = palList.querySelectorAll(".pal__item");
    for (var i = 0; i < items.length; i++) {
      items[i].setAttribute("aria-selected", i === cursor ? "true" : "false");
    }
    if (items[cursor]) items[cursor].scrollIntoView({ block: "nearest" });
  }
  function filterPal(q) {
    q = q.trim().toLowerCase();
    filtered = !q ? ACTIONS.slice() : ACTIONS.filter(function (a) {
      return (a.label + " " + a.sub).toLowerCase().indexOf(q) !== -1;
    });
    cursor = 0;
    renderPal();
  }
  function openPal() {
    if (!pal) return;
    lastFocus = document.activeElement;
    closeNav();
    pal.setAttribute("data-open", "true");
    palIn.value = "";
    filterPal("");
    palIn.focus();
  }
  function closePal() {
    if (!pal) return;
    pal.setAttribute("data-open", "false");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function palIsOpen() { return pal && pal.getAttribute("data-open") === "true"; }

  if (pal) {
    renderPal();
    palIn.addEventListener("input", function () { filterPal(palIn.value); });
    [].forEach.call(pal.querySelectorAll("[data-pal-close]"), function (el) {
      el.addEventListener("click", closePal);
    });
    pal.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); closePal(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); if (filtered.length) { cursor = (cursor + 1) % filtered.length; syncSelection(); } return; }
      if (e.key === "ArrowUp")   { e.preventDefault(); if (filtered.length) { cursor = (cursor - 1 + filtered.length) % filtered.length; syncSelection(); } return; }
      if (e.key === "Enter") {
        e.preventDefault();
        var a = filtered[cursor];
        if (a) { closePal(); a.run(); }
      }
    });
    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        palIsOpen() ? closePal() : openPal();
      }
    });
  }

  // the visible affordance, so the palette is discoverable without guessing
  var palBtn = document.getElementById("palBtn");
  if (palBtn) palBtn.addEventListener("click", openPal);

  var copyBtn = document.getElementById("copyBtn");
  if (copyBtn) copyBtn.addEventListener("click", copyEmail);

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
