import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { getMediaWithFallback, explainGetUserMediaError, isPotentiallyInsecureContext } from '../utils/media';
import AIConfig from './AIConfig';
import Reports from './Reports';
import ContentEditor from './ContentEditor';

type ChatMessage = { sender: 'lawyer' | 'client'; text: string; timestamp: number };
type AiMessage = { sender: 'assistant' | 'lawyer' | 'error'; text: string; timestamp: number };

const QUICK_REPLIES = [
    'Olá, como posso ajudar?',
    'Poderia fornecer mais detalhes?',
    'Vamos agendar uma reunião para discutir melhor?',
    'Estou analisando seu caso e retornarei em breve.'
];

const THEME_OPTIONS = [
    { value: 'theme-d', label: 'Escuro (Atual)', color: '#0B1220' },
    { value: 'theme-a', label: 'Claro Minimal', color: '#F8FAFC' },
    { value: 'theme-b', label: 'Corporate Blue', color: '#0A66C2' },
    { value: 'theme-c', label: 'Warm Earth', color: '#8B5E3C' },
    { value: 'theme-e', label: 'Oceanic', color: '#0f766e' },
    { value: 'theme-f', label: 'Crimson', color: '#b91c1c' },
    { value: 'theme-g', label: 'Royal', color: '#78350f' }
];

const THEME_CLASSES = ['theme-a', 'theme-b', 'theme-c', 'theme-d', 'theme-e', 'theme-f', 'theme-g'];

const AI_ERROR_MESSAGES: Record<string, string> = {
    missing_api_key: 'Chave de API ausente.',
    limit_reached: 'Limite de uso atingido.',
    msg_too_long: 'Mensagem muito longa.',
    session_closed: 'Sessão encerrada.'
};

const LawyerPage: React.FC = () => {
    const [info, setInfo] = useState('Aguardando chamadas...');
    const [incomingCall, setIncomingCall] = useState<{ clientId: string; mode: string } | null>(null);
    const [pendingMode, setPendingMode] = useState<'video' | 'audio'>('video');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
    const [aiInput, setAiInput] = useState('');
    const [theme, setTheme] = useState('theme-d');
    const [secureWarning, setSecureWarning] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const currentClientRef = useRef<string | null>(null);
    const chatClientRef = useRef<string | null>(null);
    const videoPanelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSecureWarning(isPotentiallyInsecureContext());
    }, []);

    const applyTheme = useCallback((nextTheme: string) => {
        const body = document.body;
        THEME_CLASSES.forEach(cls => body.classList.remove(cls));
        if (THEME_CLASSES.includes(nextTheme)) {
            body.classList.add(nextTheme);
        }
        const themeMeta = document.querySelector('meta[name="theme-color"]');
        if (themeMeta) {
            const found = THEME_OPTIONS.find(option => option.value === nextTheme);
            themeMeta.setAttribute('content', found?.color ?? '#0B1220');
        }
        try {
            window.localStorage.setItem('ui.theme', nextTheme);
        } catch (error) {
            console.warn('Failed to persist theme preference:', error);
        }
    }, []);

    useEffect(() => {
        let initial = 'theme-d';
        try {
            const stored = window.localStorage.getItem('ui.theme');
            if (stored && THEME_CLASSES.includes(stored)) {
                initial = stored;
            }
        } catch (error) {
            console.warn('Failed to read theme from storage:', error);
        }
        setTheme(initial);
        applyTheme(initial);
    }, [applyTheme]);

    useEffect(() => {
        const socket = io();
        socketRef.current = socket;
        setSocketInstance(socket);
        socket.emit('identify', { role: 'lawyer' });

        socket.on('incoming-call', ({ clientId, mode }: { clientId: string; mode: string }) => {
            setIncomingCall({ clientId, mode });
            setPendingMode(mode === 'audio' ? 'audio' : 'video');
        });

        socket.on('webrtc-offer', async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
            if (!pcRef.current || currentClientRef.current !== from) return;
            try {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
                const answer = await pcRef.current.createAnswer();
                await pcRef.current.setLocalDescription(answer);
                socket.emit('webrtc-answer', { targetId: from, sdp: answer });
                setInfo('Conectado.');
            } catch (error) {
                console.error('Failed to process WebRTC offer:', error);
            }
        });

        socket.on('webrtc-ice-candidate', async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
            if (!pcRef.current || currentClientRef.current !== from || !candidate) return;
            try {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.warn('Failed to add ICE candidate:', error);
            }
        });

        socket.on('chat-message', ({ from, message }: { from: string; message: string }) => {
            setMessages(prev => [...prev, { sender: 'client', text: `Cliente: ${message}`, timestamp: Date.now() }]);
            chatClientRef.current = from;
            void askAi(from, message);
        });

        socket.on('call-ended', () => {
            endCall('Cliente encerrou a chamada.');
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const createPeerConnection = useCallback((clientId: string) => {
        const socket = socketRef.current;
        if (!socket) return null;

        const peer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peer.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('webrtc-ice-candidate', { targetId: clientId, candidate: event.candidate });
            }
        };

        peer.ontrack = event => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        peer.onconnectionstatechange = () => {
            if (['failed', 'disconnected', 'closed'].includes(peer.connectionState)) {
                endCall('Conexão encerrada.');
            }
        };

        return peer;
    }, []);

    const endCall = useCallback((message: string) => {
        if (pcRef.current) {
            pcRef.current.getSenders().forEach(sender => {
                try {
                    sender.track?.stop();
                } catch (error) {
                    console.warn('Failed to stop track:', error);
                }
            });
            pcRef.current.close();
            pcRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        currentClientRef.current = null;
        chatClientRef.current = null;
        setInfo(message);
    }, []);

    const handleAcceptCall = async () => {
        if (!incomingCall || !socketRef.current) return;

        setInfo('Preparando mídia...');
        try {
            const { stream, note } = await getMediaWithFallback(pendingMode);
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            const peer = createPeerConnection(incomingCall.clientId);
            if (!peer) {
                throw new Error('Não foi possível criar a conexão WebRTC.');
            }
            pcRef.current = peer;
            stream.getTracks().forEach(track => peer.addTrack(track, stream));

            socketRef.current.emit('accept-call', { clientId: incomingCall.clientId });
            currentClientRef.current = incomingCall.clientId;
            setIncomingCall(null);
            setInfo(`Chamada em andamento... ${note || ''}`.trim());
        } catch (error) {
            console.error('Error accepting call:', error);
            setInfo(explainGetUserMediaError(error));
            socketRef.current.emit('reject-call', { clientId: incomingCall.clientId });
        }
    };

    const handleRejectCall = () => {
        if (!incomingCall || !socketRef.current) return;
        socketRef.current.emit('reject-call', { clientId: incomingCall.clientId });
        setIncomingCall(null);
    };

    const handleHangup = () => {
        if (currentClientRef.current && socketRef.current) {
            socketRef.current.emit('end-call', { targetId: currentClientRef.current });
        }
        endCall('Você encerrou a chamada.');
    };

    const sendChat = () => {
        const socket = socketRef.current;
        const targetId = chatClientRef.current;
        const text = chatInput.trim();
        if (!socket || !targetId || !text) return;
        socket.emit('chat-message', { targetId, message: text });
        setMessages(prev => [...prev, { sender: 'lawyer', text: `Você: ${text}`, timestamp: Date.now() }]);
        setChatInput('');
    };

    const sendQuickReply = (text: string) => {
        if (!chatClientRef.current || !socketRef.current) return;
        socketRef.current.emit('chat-message', { targetId: chatClientRef.current, message: text });
        setMessages(prev => [...prev, { sender: 'lawyer', text: `Você: ${text}`, timestamp: Date.now() }]);
    };

    const askAi = async (sessionId: string, message: string) => {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, message })
            });
            const data = await response.json();
            if (data.reply) {
                setAiMessages(prev => [...prev, { sender: 'assistant', text: `Sugestão: ${data.reply}`, timestamp: Date.now() }]);
            } else if (data.error) {
                setAiMessages(prev => [
                    ...prev,
                    {
                        sender: 'error',
                        text: `Erro IA: ${AI_ERROR_MESSAGES[data.error] || data.message || data.error}`,
                        timestamp: Date.now()
                    }
                ]);
            }
        } catch (error) {
            console.error('AI error', error);
            setAiMessages(prev => [...prev, { sender: 'error', text: 'Erro IA inesperado.', timestamp: Date.now() }]);
        }
    };

    const handleManualAiSend = () => {
        const text = aiInput.trim();
        if (!text) return;
        setAiMessages(prev => [...prev, { sender: 'lawyer', text: `Você: ${text}`, timestamp: Date.now() }]);
        setAiInput('');
        void askAi('lawyer-assistant', text);
    };

    const handleTestMedia = async () => {
        try {
            const { stream, note } = await getMediaWithFallback('video');
            setInfo(`Teste: ${note}`);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            setTimeout(() => {
                stream.getTracks().forEach(track => track.stop());
                if (localStreamRef.current) {
                    localVideoRef.current!.srcObject = localStreamRef.current;
                } else if (localVideoRef.current) {
                    localVideoRef.current.srcObject = null;
                }
                setInfo('Teste concluído.');
            }, 3000);
        } catch (error) {
            setInfo(explainGetUserMediaError(error));
        }
    };

    const toggleFullscreen = () => {
        if (!videoPanelRef.current) return;
        if (document.fullscreenElement) {
            void document.exitFullscreen();
        } else {
            void videoPanelRef.current.requestFullscreen();
        }
    };

    const orderedMessages = useMemo(() => [...messages].sort((a, b) => a.timestamp - b.timestamp), [messages]);
    const orderedAiMessages = useMemo(() => [...aiMessages].sort((a, b) => a.timestamp - b.timestamp), [aiMessages]);

    return (
        <div className="bg-gray-900 min-h-screen text-white p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Painel do Advogado</h1>
                        <p className="text-sm text-gray-300">Mantenha esta página aberta para receber chamadas e relatórios da secretária virtual.</p>
                        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-green-500 text-sm font-semibold text-white">
                            Você está online
                        </div>
                        {secureWarning && (
                            <p className="text-xs text-red-300 mt-2">Aviso: utilize HTTPS ou localhost para acesso a câmera e microfone.</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="theme-select" className="text-sm text-gray-300">
                            Tema
                        </label>
                        <select
                            id="theme-select"
                            value={theme}
                            onChange={event => {
                                setTheme(event.target.value);
                                applyTheme(event.target.value);
                            }}
                            className="theme-picker bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                        >
                            {THEME_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div ref={videoPanelRef} className="bg-gray-800 rounded-lg p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Vídeo chamada</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={toggleFullscreen}
                                    className="text-sm px-3 py-1 rounded border border-gray-600 hover:bg-gray-700"
                                >
                                    {isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                                </button>
                                <button
                                    onClick={handleTestMedia}
                                    className="text-sm px-3 py-1 rounded border border-gray-600 hover:bg-gray-700"
                                >
                                    Testar mídia
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-black rounded overflow-hidden min-h-[200px]">
                                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                <p className="text-xs text-gray-400 mt-1">Cliente</p>
                            </div>
                            <div className="bg-black rounded overflow-hidden min-h-[200px]">
                                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                <p className="text-xs text-gray-400 mt-1">Você (mudo)</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleHangup}
                                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 font-semibold disabled:opacity-50"
                                disabled={!currentClientRef.current}
                            >
                                Encerrar chamada
                            </button>
                        </div>
                        <p className="text-sm text-gray-300">{info}</p>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-5 flex flex-col gap-4">
                        <div>
                            <h2 className="text-xl font-semibold">Chat de texto</h2>
                            <p className="text-xs text-gray-400">Envie mensagens rápidas enquanto a IA sugere respostas inteligentes.</p>
                        </div>
                        <div className="flex-1 bg-gray-900 rounded-md p-4 h-64 overflow-y-auto space-y-2">
                            {orderedMessages.map(message => (
                                <div key={message.timestamp} className={`text-sm ${message.sender === 'lawyer' ? 'text-right' : 'text-left'}`}>
                                    <span className={`inline-block px-3 py-2 rounded-lg ${message.sender === 'lawyer' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-100'}`}>
                                        {message.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_REPLIES.map(reply => (
                                <button
                                    key={reply}
                                    onClick={() => sendQuickReply(reply)}
                                    className="px-3 py-1 rounded border border-gray-600 text-sm hover:bg-gray-700"
                                    type="button"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                        <div className="flex">
                            <input
                                type="text"
                                className="flex-1 rounded-l border border-gray-700 bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                                placeholder="Digite sua mensagem..."
                                value={chatInput}
                                onChange={event => setChatInput(event.target.value)}
                                onKeyDown={event => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        sendChat();
                                    }
                                }}
                            />
                            <button
                                onClick={sendChat}
                                className="px-4 py-2 rounded-r bg-[#B98F58] hover:bg-[#a37d4b] font-semibold"
                                type="button"
                            >
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-5 space-y-4">
                    <h2 className="text-xl font-semibold">Assistente de IA</h2>
                    <div className="bg-gray-900 rounded-md p-4 h-56 overflow-y-auto space-y-2">
                        {orderedAiMessages.length === 0 ? (
                            <p className="text-sm text-gray-400">As respostas inteligentes aparecerão aqui assim que o cliente enviar mensagens.</p>
                        ) : (
                            orderedAiMessages.map(message => (
                                <div key={message.timestamp} className={`text-sm ${message.sender === 'lawyer' ? 'text-right' : 'text-left'}`}>
                                    <span className={`inline-block px-3 py-2 rounded-lg ${message.sender === 'assistant' ? 'bg-gray-700 text-gray-100' : message.sender === 'error' ? 'bg-red-600 text-white' : 'bg-blue-500 text-white'}`}>
                                        {message.text}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="flex">
                        <input
                            type="text"
                            className="flex-1 rounded-l border border-gray-700 bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                            placeholder="Faça uma pergunta à IA"
                            value={aiInput}
                            onChange={event => setAiInput(event.target.value)}
                            onKeyDown={event => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleManualAiSend();
                                }
                            }}
                        />
                        <button
                            onClick={handleManualAiSend}
                            className="px-4 py-2 rounded-r bg-[#B98F58] hover:bg-[#a37d4b] font-semibold"
                            type="button"
                        >
                            Enviar
                        </button>
                    </div>
                </div>

                <AIConfig />
                <Reports socket={socketInstance} />
                <ContentEditor />
            </div>

            {incomingCall && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 space-y-4 w-full max-w-sm text-center">
                        <h2 className="text-xl font-semibold">Chamada recebida</h2>
                        <p className="text-sm text-gray-300">Um cliente está ligando agora ({incomingCall.mode}).</p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={handleAcceptCall}
                                className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 font-semibold"
                            >
                                Atender
                            </button>
                            <button
                                onClick={handleRejectCall}
                                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 font-semibold"
                            >
                                Recusar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LawyerPage;