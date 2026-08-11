(() => {
  "use strict";

  const SELECTORS = {
    form: "[data-signup-form]",
    status: "[data-form-status]",
    year: "[data-current-year]",
  };

  const form = document.querySelector(SELECTORS.form);
  const status = document.querySelector(SELECTORS.status);
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  function getFieldError(input) {
    const value = input.value.trim();

    if (!value) {
      return "This field is required.";
    }

    if (input.name === "first_name") {
      if (value.length < 2) {
        return "Please enter at least 2 characters.";
      }

      if (value.length > 80) {
        return "Please use no more than 80 characters.";
      }

      if (!/^[\p{L}\p{M}\s.'-]+$/u.test(value)) {
        return "Please enter a valid first name.";
      }
    }

    if (input.name === "email_address") {
      if (value.length > 254 || !input.validity.valid) {
        return "Please enter a valid email address.";
      }
    }

    return "";
  }

  function setFieldState(input, error) {
    const message = document.querySelector(
      `[data-error-for="${input.id}"]`,
    );
    const isValid = !error;
    const hasValue = input.value.trim() !== "";

    input.setAttribute("aria-invalid", String(!isValid));
    input.classList.toggle("is-invalid", !isValid);
    input.classList.toggle("is-valid", isValid && hasValue);

    if (message) {
      message.textContent = error;
    }

    return isValid;
  }

  function validateField(input) {
    return setFieldState(input, getFieldError(input));
  }

  function clearStatus() {
    if (!status) {
      return;
    }

    status.textContent = "";
    status.className = "form-status";
  }

  function setupSmoothScroll() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');

      if (!link || link.getAttribute("href") === "#") {
        return;
      }

      const targetId = link.getAttribute("href");
      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion.matches ? "auto" : "smooth",
        block: "start",
      });

      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }

      target.focus({ preventScroll: true });
      window.history.replaceState(null, "", targetId);
    });
  }

  function setupForm() {
    if (!form) {
      return;
    }

    const fields = [...form.querySelectorAll("input[required]")];

    fields.forEach((input) => {
      input.addEventListener("blur", () => validateField(input));

      input.addEventListener("input", () => {
        if (input.getAttribute("aria-invalid") === "true") {
          validateField(input);
        }

        clearStatus();
      });
    });

    form.addEventListener("submit", (event) => {
      clearStatus();

      // Honeypot anti-spam protection.
      if (form.elements.website?.value) {
        event.preventDefault();
        return;
      }

      const isValid = fields.every(validateField);

      if (isValid) {
        // Keep the native submission to the Kit endpoint.
        return;
      }

      event.preventDefault();

      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();

      if (status) {
        status.textContent = "Please correct the highlighted fields and try again.";
        status.classList.add("form-status--error");
      }
    });
  }

  function updateCopyrightYear() {
    const year = document.querySelector(SELECTORS.year);

    if (year) {
      year.textContent = String(new Date().getFullYear());
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateCopyrightYear();
    setupSmoothScroll();
    setupForm();
  });
})();
