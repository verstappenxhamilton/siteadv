// Utilitários para capturar mídia com mensagens claras e fallbacks
export async function getMediaWithFallback() {
  const constraintsBoth = { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: { echoCancellation: true, noiseSuppression: true } };
  try {
    const s = await navigator.mediaDevices.getUserMedia(constraintsBoth);
    return { stream: s, note: 'Vídeo e áudio ativos.' };
  } catch (eBoth) {
    // Tentar somente vídeo
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      return { stream: s, note: 'Somente vídeo ativo (áudio indisponível).' };
    } catch (eVideo) {
      // Tentar somente áudio
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        return { stream: s, note: 'Somente áudio ativo (vídeo indisponível).' };
      } catch (eAudio) {
        throw eBoth; // priorizar o erro inicial (mais completo)
      }
    }
  }
}

export function explainGetUserMediaError(err) {
  const name = err && (err.name || err.toString());
  const details = [];
  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      details.push('Permissão negada.');
      details.push('Conceda acesso no navegador (cadeado na barra de endereço).');
      details.push('No Windows: Configurações > Privacidade > Câmera/Microfone.');
      break;
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      details.push('Nenhuma câmera/microfone detectado.');
      details.push('Verifique conexões físicas e drivers.');
      break;
    case 'NotReadableError':
    case 'TrackStartError':
      details.push('Dispositivo em uso por outro aplicativo.');
      details.push('Feche apps de videoconferência e tente novamente.');
      break;
    case 'OverconstrainedError':
      details.push('Configurações de mídia não suportadas pelo dispositivo.');
      details.push('Tente desconectar outros dispositivos e reiniciar o navegador.');
      break;
    case 'SecurityError':
      details.push('Contexto inseguro (HTTPS obrigatório fora de localhost).');
      details.push('Use http://localhost durante testes ou configure HTTPS.');
      break;
    case 'AbortError':
      details.push('Falha ao iniciar captura (AbortError).');
      details.push('Reinicie o navegador e tente novamente.');
      break;
    default:
      details.push('Erro ao acessar câmera/microfone.');
  }
  if (location.protocol === 'http:' && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) {
    details.push('Atenção: HTTP sem localhost pode bloquear a captura.');
  }
  return details.join(' ');
}

export function isPotentiallyInsecureContext() {
  return !(location.protocol === 'https:' || (location.protocol === 'http:' && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)));
}

