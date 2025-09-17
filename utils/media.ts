
export const getMediaWithFallback = async (mode: 'video' | 'audio') => {
    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: mode === 'video', 
            audio: true 
        });
        return { stream, note: 'Success' };
    } catch (e) {
        console.warn('getUserMedia error:', e);
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: false, 
                audio: true 
            });
            return { stream, note: 'Video failed, using audio only' };
        } catch (e2) {
            console.error('Falling back to audio only also failed', e2);
            throw e2;
        }
    }
};

export const explainGetUserMediaError = (err: any) => {
    if (err.name === 'NotAllowedError') return 'Você precisa permitir o acesso à câmera/microfone.';
    if (err.name === 'NotFoundError') return 'Nenhuma câmera/microfone encontrado.';
    if (err.name === 'NotReadableError') return 'Seu dispositivo está bloqueando a câmera/microfone.';
    return `Erro de mídia: ${err.message}`;
};

export const isPotentiallyInsecureContext = () => {
    return window.location.protocol === 'http:' && window.location.hostname !== 'localhost';
};
