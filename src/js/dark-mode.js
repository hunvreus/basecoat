(() => {
  document.body.addEventListener('click', (event) => {
    const toggleButton = event.target.closest('[data-action="toggle-dark-mode"]');

    if (!toggleButton) return;
    
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark ? 'dark' : 'light');
  });
})();