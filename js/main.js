/* ======================================================
   KERGE-INSPIRED PERSONAL SITE — MAIN.JS
   ====================================================== */

(function () {
  'use strict';

  /* ---------- TYPED TEXT ANIMATION ---------- */
  const titles = [
    'Game System Designer',
    'Matchmaking Architect',
    'Data-Driven Strategist',
  ];

  const typedEl = document.querySelector('.typed-text');
  let titleIdx = 0;
  let charIdx = 0;
  let deleting = false;
  const TYPING_SPEED = 80;
  const DELETING_SPEED = 45;
  const PAUSE_AFTER_TYPED = 2000;
  const PAUSE_AFTER_DELETED = 400;

  function typeLoop() {
    const current = titles[titleIdx];
    if (!deleting) {
      typedEl.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(typeLoop, PAUSE_AFTER_TYPED);
        return;
      }
      setTimeout(typeLoop, TYPING_SPEED);
    } else {
      typedEl.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        titleIdx = (titleIdx + 1) % titles.length;
        setTimeout(typeLoop, PAUSE_AFTER_DELETED);
        return;
      }
      setTimeout(typeLoop, DELETING_SPEED);
    }
  }

  typeLoop();

  /* ---------- SIDEBAR NAV — ACTIVE STATE & SCROLL ---------- */
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');

  function activateNav() {
    let scrollY = window.scrollY + 120;
    sections.forEach(function (sec) {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', activateNav, { passive: true });

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMobileMenu();
    });
  });

  /* ---------- MOBILE MENU ---------- */
  const sidebar = document.querySelector('.sidebar');
  const menuBtn = document.querySelector('.mobile-menu-btn');
  let overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  function openMobileMenu() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', function () {
    if (sidebar.classList.contains('open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  overlay.addEventListener('click', closeMobileMenu);

  /* ---------- PORTFOLIO FILTER ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      portfolioCards.forEach(function (card) {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* ---------- SCROLL REVEAL ---------- */
  const reveals = document.querySelectorAll('.reveal');

  function checkReveal() {
    const trigger = window.innerHeight * 0.88;
    reveals.forEach(function (el) {
      const top = el.getBoundingClientRect().top;
      if (top < trigger) {
        el.classList.add('visible');
      }
    });
  }

  window.addEventListener('scroll', checkReveal, { passive: true });
  window.addEventListener('load', checkReveal);

  /* ---------- SKILL BAR ANIMATION ---------- */
  const skillFills = document.querySelectorAll('.skill-fill');
  let skillsAnimated = false;

  function animateSkills() {
    if (skillsAnimated) return;
    const resumeSection = document.getElementById('resume');
    if (!resumeSection) return;
    const top = resumeSection.getBoundingClientRect().top;
    if (top < window.innerHeight * 0.75) {
      skillFills.forEach(function (fill) {
        fill.style.width = fill.getAttribute('data-width') + '%';
      });
      skillsAnimated = true;
    }
  }

  window.addEventListener('scroll', animateSkills, { passive: true });
  window.addEventListener('load', animateSkills);

  /* ---------- FUN FACTS COUNTER ANIMATION ---------- */
  const counters = document.querySelectorAll('.funfact-number');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    const extraSection = document.getElementById('extra');
    if (!extraSection) return;
    const top = extraSection.getBoundingClientRect().top;
    if (top < window.innerHeight * 0.8) {
      countersAnimated = true;
      counters.forEach(function (el) {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1800;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const interval = duration / steps;

        function tick() {
          current += increment;
          if (current >= target) {
            current = target;
            el.textContent = formatNumber(target) + suffix;
            return;
          }
          el.textContent = formatNumber(Math.floor(current)) + suffix;
          setTimeout(tick, interval);
        }

        tick();
      });
    }
  }

  function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(0) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toString();
  }

  window.addEventListener('scroll', animateCounters, { passive: true });
  window.addEventListener('load', animateCounters);

  /* ---------- CONTACT FORM (no backend, just UX) ---------- */
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent (Demo)';
      btn.disabled = true;
      setTimeout(function () {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        form.reset();
      }, 2500);
    });
  }
})();
