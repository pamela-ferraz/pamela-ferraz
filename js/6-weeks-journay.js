(function () {
  "use strict";

  /* ============================================================
     Utilities
     ============================================================ */
  function isValidEmail(value) {
    // Practical RFC-5322-lite check, adequate for client-side UX validation.
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value.trim());
  }

  function setError(input, errorEl, message) {
    if (message) {
      input.setAttribute("aria-invalid", "true");
      errorEl.textContent = message;
    } else {
      input.removeAttribute("aria-invalid");
      errorEl.textContent = "";
    }
  }

  function showStatus(statusEl, type, message) {
    statusEl.textContent = message;
    statusEl.classList.remove("success", "error");
    statusEl.classList.add(type, "is-visible");
  }

  /* ============================================================
     Generic form handler
     Handles validation, honeypot spam-guard, and a local
     success state. No data ever leaves the browser or is logged
     to the console, keeping visitor input from being exposed.
     ============================================================ */
  function bindForm(formId, statusId, fields) {
    var form = document.getElementById(formId);
    if (!form) return;
    var status = document.getElementById(statusId);
    var honeypot = form.querySelector('input[name="website"]');

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      // Silently drop obvious bot submissions without revealing the trap.
      if (honeypot && honeypot.value.trim() !== "") {
        form.reset();
        return;
      }

      var isValid = true;

      fields.forEach(function (field) {
        var input = document.getElementById(field.id);
        var errorEl = document.getElementById(field.errorId);
        if (!input || !errorEl) return;

        var value = input.value.trim();
        var message = "";

        if (field.required && value === "") {
          message = field.requiredMessage || "This field is required.";
        } else if (field.type === "email" && value !== "" && !isValidEmail(value)) {
          message = "Please enter a valid email address.";
        } else if (field.minLength && value !== "" && value.length < field.minLength) {
          message = "Please enter at least " + field.minLength + " characters.";
        }

        setError(input, errorEl, message);
        if (message) isValid = false;
      });

      if (!isValid) {
        showStatus(status, "error", "Please fix the highlighted field" + (fields.length > 1 ? "s" : "") + " and try again.");
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // No backend is wired to this static page. We confirm locally
      // and never write the entered values anywhere client-visible.
      form.reset();
      fields.forEach(function (field) {
        var input = document.getElementById(field.id);
        var errorEl = document.getElementById(field.errorId);
        if (input && errorEl) setError(input, errorEl, "");
      });
      showStatus(status, "success", "You're on the list! We'll reach out with early access details soon.");
    });

    // Clear inline errors as the visitor corrects a field.
    fields.forEach(function (field) {
      var input = document.getElementById(field.id);
      if (!input) return;
      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true") {
          var value = input.value.trim();
          var stillInvalid =
            (field.required && value === "") ||
            (field.type === "email" && value !== "" && !isValidEmail(value)) ||
            (field.minLength && value !== "" && value.length < field.minLength);
          if (!stillInvalid) {
            setError(input, document.getElementById(field.errorId), "");
          }
        }
      });
    });
  }

  bindForm("hero-form", "hero-form-status", [
    { id: "hero-email", errorId: "hero-email-error", type: "email", required: true, requiredMessage: "Enter your email to join the waitlist." }
  ]);

  bindForm("waitlist-form", "waitlist-form-status", [
    { id: "wl-name", errorId: "wl-name-error", required: true, minLength: 2, requiredMessage: "Enter your name." },
    { id: "wl-email", errorId: "wl-email-error", type: "email", required: true, requiredMessage: "Enter your email to join the waitlist." }
  ]);

  /* ============================================================
     Smooth in-page navigation with reduced-motion respect and
     a safety check so only same-page hash links are intercepted.
     ============================================================ */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      var target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });
      // Keep focus management accessible for keyboard/screen-reader users.
      target.setAttribute("tabindex", "-1");
      target.addEventListener("blur", function handler() {
        target.removeAttribute("tabindex");
        target.removeEventListener("blur", handler);
      });
      target.focus({ preventScroll: true });
    });
  });

  /* ============================================================
     Footer year — small resilience touch, no external calls.
     ============================================================ */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

})();