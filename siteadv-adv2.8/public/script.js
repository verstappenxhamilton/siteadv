document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('open-chat-btn');
  const chatWindow = document.getElementById('chat-window');
  const closeBtn = document.getElementById('close-chat-btn');
  const minimizeBtn = document.getElementById('minimize-chat-btn');
  const unreadBadge = document.getElementById('unread-badge');
  const aiInput = document.getElementById('aiInput');

  if (!openBtn || !chatWindow) {
    return;
  }

  let unread = 0;

  function resetUnread() {
    unread = 0;
    if (unreadBadge) {
      unreadBadge.textContent = '0';
      unreadBadge.hidden = true;
    }
  }

  function showChat() {
    chatWindow.classList.add('visible');
    openBtn.style.display = 'none';
    resetUnread();
    setTimeout(() => aiInput?.focus(), 150);
  }

  function hideChat() {
    chatWindow.classList.remove('visible');
    openBtn.style.display = 'flex';
  }

  openBtn.addEventListener('click', showChat);
  closeBtn?.addEventListener('click', hideChat);
  minimizeBtn?.addEventListener('click', hideChat);

  document.addEventListener('assistant-message', () => {
    if (!chatWindow.classList.contains('visible')) {
      unread += 1;
      if (unreadBadge) {
        unreadBadge.textContent = String(unread);
        unreadBadge.hidden = false;
      }
    }
  });

  openBtn.style.display = chatWindow.classList.contains('visible') ? 'none' : 'flex';
});
