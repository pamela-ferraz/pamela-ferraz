(() => {
  'use strict';

  /* ------------------------------------------------------------
     Menu hambúrguer (mobile / tablet)
  ------------------------------------------------------------ */
  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');

  const closeMenu = () => {
    siteNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menu de navegação');
  };

  const openMenu = () => {
    siteNav.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Fechar menu de navegação');
  };

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    // Fecha ao clicar em qualquer link do menu (mobile)
    siteNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => closeMenu());
    });

    // Fecha com a tecla Escape e devolve o foco ao botão
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        navToggle.focus();
      }
    });

    // Fecha ao redimensionar para desktop
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth >= 1024) closeMenu();
      }, 150);
    });
  }

  /* ------------------------------------------------------------
     Destaque do link ativo no menu conforme a seção visível
  ------------------------------------------------------------ */
  const sections = document.querySelectorAll('main [id]');
  const navLinks = document.querySelectorAll('.nav-list a[href^="#"]');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const linkFor = (id) =>
      [...navLinks].find((link) => link.getAttribute('href') === `#${id}`);

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = linkFor(entry.target.id);
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.removeAttribute('aria-current'));
            link.setAttribute('aria-current', 'true');
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ------------------------------------------------------------
     Revelação suave ao rolar (respeita prefers-reduced-motion)
  ------------------------------------------------------------ */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = document.querySelectorAll('[data-reveal]');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    revealTargets.forEach((el) => revealObserver.observe(el));
  }

  /* ------------------------------------------------------------
     Formulário de contato — validação client-side + honeypot
  ------------------------------------------------------------ */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const setFieldError = (input, message) => {
    const errorEl = document.getElementById(`${input.id}-erro`);
    if (errorEl) errorEl.textContent = message; // textContent: nunca innerHTML
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  };

  const validateField = (input) => {
    if (input.hasAttribute('required') && !input.value.trim()) {
      setFieldError(input, 'This field is required..');
      return false;
    }
    if (input.type === 'email' && !EMAIL_PATTERN.test(input.value.trim())) {
      setFieldError(input, 'Enter a valid email address.');
      return false;
    }
    setFieldError(input, '');
    return true;
  };

  if (form && status) {
    const nome = document.getElementById('nome');
    const email = document.getElementById('email');
    // IMPORTANTE: o id/name deste campo foi trocado de "website" para
    // "hp_field_do_not_fill" no HTML. Nomes comuns como "website" são
    // alvo de autofill/gerenciadores de senha mesmo quando o campo está
    // escondido, o que preenchia o honeypot sozinho e cancelava envios
    // reais silenciosamente (o formulário parecia funcionar, mas nada
    // chegava no Formspree). Se você renomear no HTML de novo, atualize
    // aqui também.
    const honeypot = document.getElementById('hp_field_do_not_fill');

    [nome, email].forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Bot detectado: falha silenciosamente, sem revelar a defesa.
      if (honeypot && honeypot.value.trim() !== '') {
        event.preventDefault();
        status.textContent = 'Obrigada! Em breve retorno o contato.';
        status.classList.add('is-success');
        form.reset();
        return;
      }

      const isNomeValid = validateField(nome);
      const isEmailValid = validateField(email);

      if (!isNomeValid || !isEmailValid) {
        event.preventDefault();
        status.textContent = 'Check the highlighted fields before submitting.';
        status.classList.remove('is-success');
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      status.textContent = 'Sending...';
      status.classList.remove('is-success');

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (!response.ok) throw new Error('Form submission failed.');

        status.textContent = 'Thank you! Your message has been sent.';
        status.classList.add('is-success');
        form.reset();
      } catch (error) {
        status.textContent = 'Unable to send your message right now. Please try again.';
        status.classList.remove('is-success');
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  /* ------------------------------------------------------------
     Ano corrente no rodapé
  ------------------------------------------------------------ */
  const yearEl = document.getElementById('anoAtual');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
