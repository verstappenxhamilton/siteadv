(() => {
  // Tema (Home): aplica preferência salva sem adicionar seletor
  const THEME_CLASSES = ['theme-a','theme-b','theme-c','theme-d', 'theme-e', 'theme-f', 'theme-g'];
  const themeMeta = document.querySelector('meta#themeColor');
  const THEME_COLOR = {
    'theme-a': '#F8FAFC',
    'theme-b': '#0A66C2',
    'theme-c': '#8B5E3C',
    'theme-d': '#0B1220',
    'theme-e': '#F0FDFA',
    'theme-f': '#1C1917',
    'theme-g': '#FFFBEB'
  };
  function applyTheme(theme) {
    const b = document.body;
    THEME_CLASSES.forEach(t => b.classList.remove(t));
    if (THEME_CLASSES.includes(theme)) b.classList.add(theme);
    if (themeMeta && THEME_COLOR[theme]) themeMeta.setAttribute('content', THEME_COLOR[theme]);
  }
  try {
    const saved = localStorage.getItem('ui.theme');
    if (saved && THEME_CLASSES.includes(saved)) applyTheme(saved);
  } catch {}
  // Reveal sections on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // Contact form submission
  const form = document.querySelector('.contact-form');
  const statusEl = document.getElementById('formStatus');
  if (form && statusEl) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      statusEl.textContent = 'Enviando...';
      statusEl.classList.remove('hidden', 'success', 'error');
      try {
        const data = Object.fromEntries(new FormData(form).entries());
        const res = await fetch('/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          statusEl.textContent = 'Mensagem enviada com sucesso!';
          statusEl.classList.add('success');
          form.reset();
        } else {
          throw new Error('Request failed');
        }
      } catch (err) {
        statusEl.textContent = 'Erro ao enviar. Tente novamente.';
        statusEl.classList.add('error');
      }
    });
  }

  // Video Background Logic
  const videoElement = document.querySelector('.hero-video');
  const videoOverlay = document.querySelector('.hero-overlay');
  let videoFiles = [];
  let currentVideoIndex = 0;
  const videoTransitionDuration = 1000; // 1 second for fade effect

  async function fetchVideoFiles() {
    try {
      const response = await fetch('/api/videos');
      const files = await response.json();
      if (files.length > 0) {
        videoFiles = files;
        currentVideoIndex = 0; // Start with the first video
        // Load and play the first video immediately without fade-out
        videoElement.src = videoFiles[currentVideoIndex];
        videoElement.load();
        videoElement.play().catch(error => console.error('Video playback error:', error));
      } else {
        console.warn('No video files found in /public/videos/.');
        if (videoElement) videoElement.style.display = 'none'; // Hide video if no files
        if (videoOverlay) videoOverlay.style.display = 'none'; // Hide overlay if no files
      }
    } catch (error) {
      console.error('Error fetching video files:', error);
      if (videoElement) videoElement.style.display = 'none';
      if (videoOverlay) videoOverlay.style.display = 'none';
    }
  }

  // This function is now only for transitioning to the NEXT video
  function transitionToNextVideo() {
    if (!videoElement || videoFiles.length === 0) return;

    videoElement.classList.add('fade-out'); // Start fade-out

    setTimeout(() => {
      currentVideoIndex = (currentVideoIndex + 1) % videoFiles.length;
      const nextVideoSrc = videoFiles[currentVideoIndex];

      videoElement.src = nextVideoSrc;
      videoElement.load();
      videoElement.play().catch(error => console.error('Video playback error:', error));
      videoElement.classList.remove('fade-out'); // Fade in
    }, videoTransitionDuration);
  }

  let isFadingOut = false;

  function playNextVideo() {
    currentVideoIndex = (currentVideoIndex + 1) % videoFiles.length;
    const nextVideoSrc = videoFiles[currentVideoIndex];
    videoElement.src = nextVideoSrc;
    videoElement.load();
    videoElement.play().catch(error => console.error('Video playback error:', error));
    videoElement.classList.remove('fade-out'); // Ensure it fades in
    isFadingOut = false; // Reset fade state
  }

  if (videoElement) {
    videoElement.addEventListener('timeupdate', () => {
      if (videoElement.duration && !isNaN(videoElement.duration)) {
        const remainingTime = videoElement.duration - videoElement.currentTime;
        // Start fading out when remaining time is less than or equal to transition duration
        if (remainingTime <= videoTransitionDuration / 1000 && !isFadingOut) {
          videoElement.classList.add('fade-out');
          isFadingOut = true;
        }
      }
    });

    videoElement.addEventListener('ended', () => {
      playNextVideo();
    });

    // Initial fetch of video files
    fetchVideoFiles();
  }
})();
