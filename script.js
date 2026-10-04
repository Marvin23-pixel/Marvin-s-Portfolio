/* ==========================================================================
   Portfolio — script.js
   Smooth scrolling, scroll-spy navigation, mobile menu, scroll progress,
   back-to-top, reveal animations, live WAT clock, project links,
   copy-email and the contact form.
   ========================================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Config — edit these
   * ------------------------------------------------------------------ */
  const CONFIG = {
    email: 'marvelousnsikaksolomon@gmail.com',

    // Optional: paste a form endpoint (e.g. Formspree: 'https://formspree.io/f/xxxxxxx')
    // to send messages straight from the page. Left empty, the form opens the
    // visitor's mail app with the message pre-filled instead.
    formEndpoint: '',

    timeZone: 'Africa/Lagos',

    // Fill these in to turn the project links on. Empty ones show "coming soon".
    links: {
      'workhouse-demo': '',
      'workhouse-repo': '',
      'digisol-demo': '',
      'digisol-repo': '',
      'lab-case-study': '',
      'lab-repo': ''
    }
  };

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.classList.add('js');

  const header = $('#siteHeader');
  const headerHeight = () => (header ? header.offsetHeight : 80);

  /* ------------------------------------------------------------------ *
   * Toast
   * ------------------------------------------------------------------ */
  const toastEl = document.createElement('div');
  toastEl.setAttribute('role', 'status');
  toastEl.className =
    'fixed left-1/2 -translate-x-1/2 bottom-6 z-[90] max-w-[90vw] px-4 py-2.5 bg-surface-container-highest text-primary border border-outline-variant font-label-md text-label-md text-center opacity-0 pointer-events-none transition-opacity duration-300 shadow-xl';
  document.body.appendChild(toastEl);
  let toastTimer;

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.remove('opacity-0');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.add('opacity-0'), 2400);
  }

  /* ------------------------------------------------------------------ *
   * Smooth scrolling for in-page links
   * ------------------------------------------------------------------ */
  function scrollToHash(hash) {
    if (hash === '#top') {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', location.pathname + location.search);
      return true;
    }
    const target = hash.length > 1 ? $(hash) : null;
    if (!target) return false;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight();
    window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', hash);
    return true;
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    if (hash === '#') {
      e.preventDefault(); // placeholder links never jump to the top
      return;
    }
    if (scrollToHash(hash)) {
      e.preventDefault();
      setMenu(false);
    }
  });

  /* ------------------------------------------------------------------ *
   * Mobile menu
   * ------------------------------------------------------------------ */
  const menuToggle = $('#menuToggle');
  const menuIcon = $('#menuIcon');
  const mobileMenu = $('#mobileMenu');

  function setMenu(open) {
    if (!mobileMenu) return;
    mobileMenu.classList.toggle('hidden', !open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuIcon.textContent = open ? 'close' : 'menu';
  }

  menuToggle.addEventListener('click', () => setMenu(mobileMenu.classList.contains('hidden')));

  document.addEventListener('click', (e) => {
    if (!mobileMenu.classList.contains('hidden') && !e.target.closest('#siteHeader')) setMenu(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });

  window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });

  /* ------------------------------------------------------------------ *
   * Scroll-spy, progress bar, back-to-top
   * ------------------------------------------------------------------ */
  const sections = $$('main section[id]');
  const desktopNav = $('#desktopNav');
  const desktopLinks = $$('a[data-path]', desktopNav);
  const mobileLinks = $$('a[data-path]', mobileMenu);
  const activeClasses = (desktopNav.dataset.activeClasses || 'text-primary border-b border-primary pb-0.5').split(' ');
  const progressBar = $('#scrollProgress');
  const backToTop = $('#backToTop');
  let currentSection = '';
  let ticking = false;

  function setActive(id) {
    if (id === currentSection) return;
    currentSection = id;

    desktopLinks.forEach((a) => {
      const on = a.dataset.path === id;
      activeClasses.forEach((c) => a.classList.toggle(c, on));
      a.classList.toggle('text-on-surface-variant', !on);
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    mobileLinks.forEach((a) => {
      const on = a.dataset.path === id;
      a.classList.toggle('text-primary', on);
      a.classList.toggle('text-on-surface-variant', !on);
    });
  }

  function onScroll() {
    ticking = false;
    const y = window.scrollY;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;

    progressBar.style.width = `${max > 0 ? Math.min(100, (y / max) * 100) : 0}%`;

    const showTop = y > 600;
    backToTop.classList.toggle('opacity-0', !showTop);
    backToTop.classList.toggle('pointer-events-none', !showTop);
    backToTop.classList.toggle('translate-y-2', !showTop);

    const offset = headerHeight() + 80;
    let current = 'about';
    sections.forEach((s) => {
      if (s.getBoundingClientRect().top <= offset) current = s.id;
    });
    if (window.innerHeight + y >= doc.scrollHeight - 4) current = 'contact';
    setActive(current);
  }

  function requestScrollUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate);
  backToTop.addEventListener('click', () => scrollToHash('#top'));

  /* ------------------------------------------------------------------ *
   * Reveal on scroll
   * ------------------------------------------------------------------ */
  const revealEls = $$('[data-reveal]');

  if (reducedMotion || !('IntersectionObserver' in window)) {
    // nothing to animate
  } else {
    revealEls.forEach((el) => {
      const siblings = el.parentElement ? $$(':scope > [data-reveal]', el.parentElement) : [el];
      const index = Math.max(0, siblings.indexOf(el));
      el.style.setProperty('--reveal-delay', `${(index % 3) * 80}ms`);
      el.classList.add('reveal');
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add('is-visible');
          io.unobserve(el);
          // Hand the element back to its normal hover/transition styles afterwards
          const cleanup = (ev) => {
            if (ev.propertyName !== 'opacity') return;
            el.removeEventListener('transitionend', cleanup);
            el.classList.remove('reveal', 'is-visible');
            el.style.removeProperty('--reveal-delay');
          };
          el.addEventListener('transitionend', cleanup);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    revealEls.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------ *
   * Live clock (WAT) + footer year
   * ------------------------------------------------------------------ */
  const localTime = $('#localTime');
  const mockClock = $('#mockClock');
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: CONFIG.timeZone
  });

  function tickClock() {
    const t = timeFormatter.format(new Date());
    if (localTime) localTime.textContent = `${t.slice(0, 5)} UTC+1 [WAT]`;
    if (mockClock) mockClock.textContent = `${t} WAT`;
  }

  tickClock();
  setInterval(tickClock, 1000);

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------ *
   * Project links
   * ------------------------------------------------------------------ */
  $$('a[data-link]').forEach((a) => {
    const url = CONFIG.links[a.dataset.link];
    if (url) {
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    } else {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        toast('Link coming soon');
      });
    }
  });

  /* ------------------------------------------------------------------ *
   * Copy email
   * ------------------------------------------------------------------ */
  const copyBtn = $('#copyEmailBtn');
  const copyIcon = $('#copyEmailIcon');

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (e) {
        ok = false;
      }
      ta.remove();
      return ok;
    }
  }

  copyBtn.addEventListener('click', async () => {
    const ok = await copyText(CONFIG.email);
    toast(ok ? 'Email address copied' : 'Could not copy — please copy it manually');
    if (ok) {
      copyIcon.textContent = 'check';
      setTimeout(() => (copyIcon.textContent = 'content_copy'), 1800);
    }
  });

  /* ------------------------------------------------------------------ *
   * Contact form
   * ------------------------------------------------------------------ */
  const form = $('#contact-form');
  const submitBtn = $('#submit-btn');
  const statusEl = $('#formStatus');
  const messageField = $('#message');
  const messageCount = $('#messageCount');
  const defaultLabel = submitBtn.textContent.trim();
  let resetTimer;

  const fields = {
    name: $('#name'),
    email: $('#email'),
    message: messageField
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setFieldError(key, text) {
    const el = $(`[data-error-for="${key}"]`);
    if (el) el.textContent = text;
    fields[key].setAttribute('aria-invalid', text ? 'true' : 'false');
  }

  function validate() {
    let firstInvalid = null;
    const checks = {
      name: (v) => (v.trim().length < 2 ? 'Please enter your name.' : ''),
      email: (v) => (!emailPattern.test(v.trim()) ? 'Please enter a valid email address.' : ''),
      message: (v) => (v.trim().length < 10 ? 'Please write at least a short sentence (10+ characters).' : '')
    };
    Object.keys(checks).forEach((key) => {
      const error = checks[key](fields[key].value);
      setFieldError(key, error);
      if (error && !firstInvalid) firstInvalid = fields[key];
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function setStatus(text, state) {
    statusEl.textContent = text;
    if (state) statusEl.dataset.state = state;
    else delete statusEl.dataset.state;
  }

  function setButton(label, state, disabled = false) {
    submitBtn.textContent = label;
    submitBtn.disabled = disabled;
    if (state) submitBtn.dataset.state = state;
    else delete submitBtn.dataset.state;
  }

  function resetButtonLater(ms = 4000) {
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      setButton(defaultLabel, '');
      setStatus('', '');
    }, ms);
  }

  // clear errors as the visitor types + live character counter
  Object.keys(fields).forEach((key) => {
    fields[key].addEventListener('input', () => setFieldError(key, ''));
  });
  messageField.addEventListener('input', () => {
    messageCount.textContent = `${messageField.value.length} / ${messageField.maxLength}`;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      message: fields.message.value.trim()
    };

    if (CONFIG.formEndpoint) {
      setButton('TRANSMITTING…', '', true);
      setStatus('Sending your message…', '');
      try {
        const res = await fetch(CONFIG.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Request failed');
        setButton('TRANSMISSION SENT', 'success');
        setStatus('Thanks — your message has been sent. I will reply within 24 hours.', 'success');
        form.reset();
        messageCount.textContent = `0 / ${messageField.maxLength}`;
      } catch (err) {
        setButton('TRANSMISSION FAILED', 'error');
        setStatus(`Something went wrong. Please email me directly at ${CONFIG.email}.`, 'error');
      }
      resetButtonLater(5000);
      return;
    }

    // No endpoint configured: open the visitor's mail app with everything pre-filled.
    const subject = `Portfolio inquiry from ${payload.name}`;
    const body = `Name: ${payload.name}\nEmail: ${payload.email}\n\n${payload.message}`;
    const mailto = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setButton('OPENING MAIL APP…', 'success');
    setStatus(`If your mail app didn't open, email me at ${CONFIG.email}.`, '');
    window.location.href = mailto;
    resetButtonLater(6000);
  });

  /* ------------------------------------------------------------------ *
   * Init
   * ------------------------------------------------------------------ */
  onScroll();

  // Land on the right section if the page was opened with a hash (e.g. index.html#projects)
  if (location.hash && location.hash.length > 1) {
    setTimeout(() => scrollToHash(location.hash), 50);
  }
})();