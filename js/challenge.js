
(function () {
  "use strict";

  var form = document.querySelector("[data-signup-form]");
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function getFieldError(input) {
    var value = input.value.trim();

    if (!value) return "This field is required.";

    if (input.name === "first-name") {
      if (value.length < 2) return "Please enter at least 2 characters.";
      if (value.length > 80) return "Please use no more than 80 characters.";
      if (!/^[\p{L}\p{M}\s.'-]+$/u.test(value)) {
        return "Please enter a valid first name.";
      }
    }

    if (input.name === "email") {
      if (value.length > 254 || !input.validity.valid) {
        return "Please enter a valid email address.";
      }
    }

    return "";
  }

  function setFieldState(input, error) {
    var message = document.querySelector('[data-error-for="' + input.id + '"]');
    input.setAttribute("aria-invalid", error ? "true" : "false");
    input.classList.toggle("is-invalid", Boolean(error));
    input.classList.toggle("is-valid", !error && input.value.trim() !== "");

    if (message) message.textContent = error;
    return !error;
  }

  function validateField(input) {
    return setFieldState(input, getFieldError(input));
  }

  function clearStatus() {
    var status = document.querySelector("[data-form-status]");
    if (!status) return;
    status.textContent = "";
    status.className = "form-status";
  }

  function setupSmoothScroll() {
    document.addEventListener("click", function (event) {
      var link = event.target.closest('a[href^="#"]');
      if (!link || link.getAttribute("href") === "#") return;

      var target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion.matches ? "auto" : "smooth", block: "start" });

      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      window.history.replaceState(null, "", link.getAttribute("href"));
    });
  }

  function setupForm() {
    if (!form) return;

    var fields = Array.prototype.slice.call(form.querySelectorAll("input[required]"));
    var status = document.querySelector("[data-form-status]");

    fields.forEach(function (input) {
      input.addEventListener("blur", function () { validateField(input); });
      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true") validateField(input);
        clearStatus();
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearStatus();

      /* Ignore automated submissions that fill the hidden honeypot field. */
      if (form.elements.website && form.elements.website.value) return;

      var isValid = fields.every(validateField);
      if (!isValid) {
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        if (status) {
          status.textContent = "Please correct the highlighted fields and try again.";
          status.classList.add("form-status--error");
        }
        return;
      }

      /*
       * No personal data is stored or sent by this page. Connect a HTTPS backend
       * here to deliver the guide, and repeat validation and anti-spam checks there.
       */
      form.reset();
      fields.forEach(function (input) { setFieldState(input, ""); });
      if (status) {
        status.textContent = "Success! Your details have been validated.";
        status.classList.add("form-status--success");
      }
    });
  }

  function updateCopyrightYear() {
    var yearEl = document.querySelector("[data-current-year]");
    if (!yearEl) return;
    yearEl.textContent = String(new Date().getFullYear());
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateCopyrightYear();
    setupSmoothScroll();
    setupForm();
  });
})();
