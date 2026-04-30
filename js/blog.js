(function () {
  'use strict';

  const buttons = document.querySelectorAll('[data-lang-switch]');
  const panels = document.querySelectorAll('.lang-panel[data-lang]');

  if (!buttons.length || !panels.length) return;

  function setLanguage(lang) {
    panels.forEach(function (panel) {
      panel.classList.toggle('is-active', panel.getAttribute('data-lang') === lang);
    });

    buttons.forEach(function (button) {
      const isActive = button.getAttribute('data-lang-switch') === lang;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
      window.MathJax.typesetPromise();
    }
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      setLanguage(button.getAttribute('data-lang-switch'));
    });
  });

  setLanguage('en');
})();
