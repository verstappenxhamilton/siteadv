(() => {
  const root = document.documentElement;
  function update(e) {
    const x = e.clientX ?? (e.touches && e.touches[0].clientX);
    const y = e.clientY ?? (e.touches && e.touches[0].clientY);
    if (x != null && y != null) {
      root.style.setProperty('--bg-x', (x / window.innerWidth) * 100 + '%');
      root.style.setProperty('--bg-y', (y / window.innerHeight) * 100 + '%');
    }
  }
  window.addEventListener('mousemove', update);
  window.addEventListener('touchmove', update);
  window.addEventListener('touchstart', update);
})();
