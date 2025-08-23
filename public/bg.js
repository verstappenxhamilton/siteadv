function update(e) {
  const x = e.clientX || (e.touches && e.touches[0].clientX);
  const y = e.clientY || (e.touches && e.touches[0].clientY);
  if (x != null && y != null) {
    document.documentElement.style.setProperty('--mx', x + 'px');
    document.documentElement.style.setProperty('--my', y + 'px');
  }
}
window.addEventListener('pointermove', update);
window.addEventListener('pointerdown', update);
window.addEventListener('touchmove', update);
window.addEventListener('touchstart', update);
