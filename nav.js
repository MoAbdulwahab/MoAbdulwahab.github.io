/* ── Mobile Navigation Controller ───────────────────────
   Handles: open/close, outside-tap dismiss, Escape key,
   body-scroll-lock, closing animation, active-link, sticky nav.
   Loaded on every page — no dependencies.
──────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var toggle = document.querySelector('.nav-toggle');
  var links  = document.getElementById('nav-links');
  var nav    = document.querySelector('.nav');
  var body   = document.body;

  if (!toggle || !links) return;

  /* ── helpers ── */
  function isOpen() {
    return links.classList.contains('open') && !links.classList.contains('nav-closing');
  }

  function openMenu() {
    links.classList.remove('nav-closing');
    links.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    body.classList.add('nav-open');
    toggle.setAttribute('aria-label', 'Close navigation');
  }

  function closeMenu() {
    if (!links.classList.contains('open')) return;
    links.classList.add('nav-closing');
    toggle.setAttribute('aria-expanded', 'false');
    body.classList.remove('nav-open');
    toggle.setAttribute('aria-label', 'Open navigation');

    function onEnd() {
      links.classList.remove('open', 'nav-closing');
      links.removeEventListener('animationend', onEnd);
    }
    links.addEventListener('animationend', onEnd);

    /* Fallback in case animation doesn't fire (e.g. reduced-motion) */
    setTimeout(function () {
      links.classList.remove('open', 'nav-closing');
    }, 300);
  }

  /* ── toggle button ── */
  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    isOpen() ? closeMenu() : openMenu();
  });

  /* ── close when a nav link is tapped ── */
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  /* ── close on outside tap / click ── */
  document.addEventListener('click', function (e) {
    if (isOpen() && nav && !nav.contains(e.target)) closeMenu();
  });

  /* ── close on touch outside (iOS fix) ── */
  document.addEventListener('touchstart', function (e) {
    if (isOpen() && nav && !nav.contains(e.target)) closeMenu();
  }, { passive: true });

  /* ── Escape key ── */
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.key === 'Esc') && isOpen()) {
      closeMenu();
      toggle.focus();
    }
  });

  /* ── active link highlight ── */
  var path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('#nav-links a:not(.nav-cta)').forEach(function (a) {
    var href = (a.getAttribute('href') || '').replace(/\/$/, '') || '/';
    if (href !== '/' && path.startsWith(href)) a.classList.add('active');
    else if (href === '/' && path === '/') a.classList.add('active');
  });

  /* ── sticky nav shadow on scroll ── */
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }
})();
