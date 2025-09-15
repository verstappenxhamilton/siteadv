document.addEventListener('DOMContentLoaded', () => {
    // Logic for Floating Chat
    const openBtn = document.getElementById('open-chat-btn');
    const closeBtn = document.getElementById('close-chat-btn');
    const minimizeBtn = document.getElementById('minimize-chat-btn');
    const chatWindow = document.getElementById('chat-window');
    const unreadBadge = document.getElementById('unread-badge');
    let unread = 0;
    openBtn.addEventListener('click', () => {
        chatWindow.classList.add('visible');
        openBtn.style.display = 'none';
        unread = 0;
        if (unreadBadge) { unreadBadge.textContent = '0'; unreadBadge.hidden = true; }
    });
    function hideChat() {
        chatWindow.classList.remove('visible');
        openBtn.style.display = 'flex';
    }
    closeBtn.addEventListener('click', hideChat);
    if (minimizeBtn) minimizeBtn.addEventListener('click', hideChat);

    // Unread counter when assistant replies while hidden
    document.addEventListener('assistant-message', () => {
      if (!chatWindow.classList.contains('visible')) {
        unread += 1;
        if (unreadBadge) { unreadBadge.textContent = String(unread); unreadBadge.hidden = false; }
      }
    });

    function adjustContactButton() {
      const contactLink = Array.from(document.querySelectorAll('a, button'))
        .find(el => {
          const href = (el.getAttribute('href') || '').toLowerCase();
          const txt = (el.innerText || el.textContent || '').toLowerCase();
          return href.includes('#contact') || href.includes('#contato') || txt.includes('contato');
        });
      if (contactLink && !contactLink.dataset.adjustedContact) {
        contactLink.dataset.adjustedContact = 'true';
        contactLink.classList.add('contact-button-adjust');
        if (contactLink.tagName.toLowerCase() === 'a') {
          contactLink.setAttribute('data-bs-toggle', 'modal');
          contactLink.setAttribute('data-bs-target', '#contactModal');
        }
        return true;
      }
      return false;
    }

    // Run immediately and keep watching for late renders
    adjustContactButton();
    const observer = new MutationObserver(() => { adjustContactButton(); });
    observer.observe(document.body, { childList: true, subtree: true });

    // Ensure modal close via X does not leave body locked
    const contactModalEl = document.getElementById('contactModal');
    if (contactModalEl) {
      contactModalEl.addEventListener('hidden.bs.modal', () => {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
      });
    }

    // Observe for primary CTA to append WhatsApp button under it
    function ensureWhatsAppBelowCTA() {
      const candidates = Array.from(document.querySelectorAll('a, button'));
      const normalize = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
      const text = (el) => normalize(el.innerText || el.textContent || '');
      const cta = candidates.find(el => {
        const t = text(el);
        return (t.includes('AGENDE') && t.includes('CONSULTA')) || t.includes('CONSULTA GRATUITA') || t.includes('AGENDE SUA CONSULTA');
      });
      if (document.getElementById('whatsapp-cta')) return true;
      if (!cta) return false;

      // Replace CTA with WhatsApp-only stack
      const phone = (document.body.getAttribute('data-whatsapp-number') || '').replace(/\D/g, '');
      const href = phone ? `https://wa.me/${phone}` : 'https://wa.me/';
      const container = document.createElement('div');
      container.className = 'cta-stack cta-stack-spaced';
      const parent = cta.parentNode;
      parent.replaceChild(container, cta);

      const wa = document.createElement('a');
      wa.href = href;
      wa.target = '_blank';
      wa.rel = 'noopener noreferrer';
      wa.id = 'whatsapp-cta';
      wa.className = 'btn btn-whatsapp cta-whatsapp-fixed';
      wa.innerHTML = '<i class="bi bi-whatsapp"></i> Fale no WhatsApp';
      container.appendChild(wa);
      return true;
    }

    // Center-align hero tagline paragraph precisely
    function alignHeroSubtitle() {
      const normalize = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
      const candidates = Array.from(document.querySelectorAll('p.max-w-3xl, p'));
      const target = candidates.find(el => {
        const t = normalize(el.innerText || el.textContent || '');
        return t.includes('SOLUCOES JURIDICAS COMPLETAS') && t.includes('PATRIMONIO');
      });
      if (!target || target.dataset.centeredSubtitle) return !!target;
      target.dataset.centeredSubtitle = 'true';
      // Inline styles to override any responsive text-left
      target.style.textAlign = 'center';
      target.style.display = 'block';
      target.style.marginLeft = 'auto';
      target.style.marginRight = 'auto';
      // Keep the existing max-width from Tailwind (max-w-3xl), but ensure centering within flex parents
      target.style.alignSelf = 'center';
      // Also try centering its immediate parent if it's a flex container
      const parent = target.parentElement;
      if (parent && getComputedStyle(parent).display.includes('flex')) {
        parent.style.justifyContent = 'center';
      }
      return true;
    }

    // Run immediately and keep watching for late renders
    ensureWhatsAppBelowCTA();
    const ctaObserver = new MutationObserver(() => { ensureWhatsAppBelowCTA(); });
    ctaObserver.observe(document.body, { childList: true, subtree: true });

    // Run subtitle centering now and on mutations
    alignHeroSubtitle();
    const subtitleObserver = new MutationObserver(() => { alignHeroSubtitle(); });
    subtitleObserver.observe(document.body, { childList: true, subtree: true });

    // Removido fallback de botão WhatsApp flutuante
});
