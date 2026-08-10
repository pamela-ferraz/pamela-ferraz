/**
 * Work With Pamela Ferraz — site scripts
 *
 * Vanilla JS, no dependencies. Everything is wrapped in a single IIFE to
 * avoid leaking globals, every DOM lookup is null-checked before use, and
 * every feature degrades gracefully if its browser API isn't available.
 */
(function () {
  "use strict";

  /** Small helper: run `fn` once the DOM is interactive. */
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  var prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ *
   * Mobile navigation
   * ------------------------------------------------------------------ */
  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("primaryNav");
    var scrim = document.getElementById("navScrim");
    if (!toggle || !nav) return;

    function closeNav() {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      nav.setAttribute("data-open", "false");
      if (scrim) {
        scrim.setAttribute("data-open", "false");
        scrim.setAttribute("aria-hidden", "true");
      }
      document.body.classList.remove("nav-locked");
    }

    function openNav() {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      nav.setAttribute("data-open", "true");
      if (scrim) {
        scrim.setAttribute("data-open", "true");
        scrim.setAttribute("aria-hidden", "false");
      }
      document.body.classList.add("nav-locked");
    }

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Close the menu whenever a nav link is activated.
    nav.addEventListener("click", function (event) {
      var link = event.target.closest("a");
      if (link) closeNav();
    });

    // Tapping the dimmed backdrop closes the menu too.
    if (scrim) {
      scrim.addEventListener("click", closeNav);
    }

    // Close on Escape for keyboard users.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    // Close automatically if the viewport grows into desktop size.
    if (typeof window.matchMedia === "function") {
      var desktopQuery = window.matchMedia("(min-width: 768px)");
      var handleChange = function (e) {
        if (e.matches) closeNav();
      };
      if (typeof desktopQuery.addEventListener === "function") {
        desktopQuery.addEventListener("change", handleChange);
      } else if (typeof desktopQuery.addListener === "function") {
        // Safari < 14 fallback
        desktopQuery.addListener(handleChange);
      }
    }
  }

  /* ------------------------------------------------------------------ *
   * Scroll-triggered reveal animations
   * ------------------------------------------------------------------ */
  function initScrollReveal() {
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    if (prefersReducedMotion || typeof IntersectionObserver !== "function") {
      // No motion, or no observer support: just show everything.
      targets.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /** Tags the sections we want to fade in without touching the HTML file directly. */
  function tagRevealTargets() {
    var selectors = [
      ".section-head",
      ".package-card",
      ".discovery__text",
    ];
    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        if (!el.hasAttribute("data-reveal")) {
          el.setAttribute("data-reveal", "");
        }
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Sticky header shadow on scroll
   * ------------------------------------------------------------------ */
  function initHeaderShadow() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var ticking = false;

    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    update();
  }

  /* ------------------------------------------------------------------ *
   * Back-to-top button
   * ------------------------------------------------------------------ */
  function initBackToTop() {
    var button = document.getElementById("backToTop");
    if (!button) return;

    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Hero portrait fallback
   * The <img> in the hero points at images/pamela-ferraz.jpg, which may
   * not exist yet. If it fails to load, swap in the styled "PF" monogram
   * placeholder instead of a broken-image icon.
   * ------------------------------------------------------------------ */
  function initPortraitFallback() {
    var figure = document.querySelector(".hero__portrait");
    var img = figure ? figure.querySelector(".hero__portrait-img") : null;
    if (!figure || !img) return;

    function showFallback() {
      figure.classList.add("hero__portrait--empty");
    }

    // If the image already failed before this script ran, `complete` is
    // true but `naturalWidth` stays 0.
    if (img.complete && img.naturalWidth === 0) {
      showFallback();
    } else {
      img.addEventListener("error", showFallback, { once: true });
    }
  }

  /* ------------------------------------------------------------------ *
   * Footer year (avoids ever showing a stale hard-coded year)
   * ------------------------------------------------------------------ */
  function initFooterYear() {
    var el = document.getElementById("year");
    if (!el) return;
    el.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------ *
   * Outbound link safety net
   * Every external link already ships with target="_blank" and
   * rel="noopener noreferrer" in the markup; this is a defensive second
   * pass in case a link is added later without those attributes.
   * ------------------------------------------------------------------ */
  function hardenExternalLinks() {
    var links = document.querySelectorAll('a[target="_blank"]');
    links.forEach(function (link) {
      var rel = (link.getAttribute("rel") || "").split(/\s+/);
      ["noopener", "noreferrer"].forEach(function (token) {
        if (rel.indexOf(token) === -1) rel.push(token);
      });
      link.setAttribute("rel", rel.filter(Boolean).join(" "));
    });
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */
  onReady(function () {
    document.documentElement.classList.remove("js-disabled");
    tagRevealTargets();
    initMobileNav();
    initScrollReveal();
    initHeaderShadow();
    initBackToTop();
    initPortraitFallback();
    initFooterYear();
    hardenExternalLinks();
  });
})();