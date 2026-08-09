/**
 * Pamela Ferraz — landing page
 * JS puro, sem dependências externas.
 *
 * Notas de segurança:
 * - Nunca usamos innerHTML com dados dinâmicos: só textContent.
 * - Nenhum uso de eval/Function/setTimeout com strings.
 * - Nenhum handler inline no HTML (tudo via addEventListener).
 * - Validação de formulário é só UX: se este formulário for ligado a um
 *   backend, valide e sanitize os dados no servidor também.
 * - Honeypot simples contra bots de spam automatizado.
 */
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
      setFieldError(input, 'Este campo é obrigatório.');
      return false;
    }
    if (input.type === 'email' && !EMAIL_PATTERN.test(input.value.trim())) {
      setFieldError(input, 'Digite um e-mail válido.');
      return false;
    }
    setFieldError(input, '');
    return true;
  };

  if (form && status) {
    const nome = document.getElementById('nome');
    const email = document.getElementById('email');
    const honeypot = document.getElementById('website');

    [nome, email].forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      // Bot detectado: falha silenciosamente, sem revelar a defesa.
      if (honeypot && honeypot.value.trim() !== '') {
        status.textContent = 'Obrigada! Em breve retorno o contato.';
        status.classList.add('is-success');
        form.reset();
        return;
      }

      const isNomeValid = validateField(nome);
      const isEmailValid = validateField(email);

      if (!isNomeValid || !isEmailValid) {
        status.textContent = 'Verifique os campos destacados antes de enviar.';
        status.classList.remove('is-success');
        return;
      }

      // Não há backend conectado neste template. Ao integrar um serviço,
      // envie via fetch() para um endpoint HTTPS próprio e trate a resposta
      // sem usar innerHTML com o retorno do servidor.
      status.textContent = 'Obrigada! Recebi seus dados e retorno em breve.';
      status.classList.add('is-success');
      form.reset();
    });
  }

  /* ------------------------------------------------------------
     Ano corrente no rodapé
  ------------------------------------------------------------ */
  const yearEl = document.getElementById('anoAtual');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();