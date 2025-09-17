
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { getMediaWithFallback, explainGetUserMediaError } from '../utils/media';

const Contact: React.FC = () => {
    const [info, setInfo] = useState('Aguardando...');
    const [isOnline, setIsOnline] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const [inCall, setInCall] = useState(false);
    const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [mode, setMode] = useState('video'); // video or chat
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const pc = useRef<RTCPeerConnection | null>(null);
    const localStream = useRef<MediaStream | null>(null);
    const socket = useRef<any>(null);

    useEffect(() => {
        socket.current = io();
        socket.current.emit('identify', { role: 'client' });

        socket.current.on('lawyer-status', ({ online, busy }: { online: boolean, busy: boolean }) => {
            setIsOnline(online);
            setIsBusy(busy);
        });

        socket.current.on('call-accepted', async ({ lawyerId }: { lawyerId: string }) => {
            setInfo('Chamada aceita. Conectando...');
            pc.current = createPeerConnection(lawyerId);
            const { stream } = await getMediaWithFallback('video');
            localStream.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            stream.getTracks().forEach(track => pc.current?.addTrack(track, stream));
            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);
            socket.current.emit('webrtc-offer', { targetId: lawyerId, sdp: offer });
        });

        socket.current.on('webrtc-answer', async ({ sdp }: { sdp: any }) => {
            if (pc.current) {
                await pc.current.setRemoteDescription(new RTCSessionDescription(sdp));
                setInCall(true);
                setInfo('Conectado.');
            }
        });

        socket.current.on('webrtc-ice-candidate', ({ candidate }: { candidate: any }) => {
            if (pc.current && candidate) {
                pc.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        socket.current.on('chat-message', ({ message }: { message: string }) => {
            setMessages(prev => [...prev, { sender: 'lawyer', text: message }]);
        });

        socket.current.on('call-ended', () => {
            endCall('Chamada encerrada pelo advogado.');
        });

        return () => {
            socket.current.disconnect();
        };
    }, []);

    const createPeerConnection = (lawyerId: string) => {
        const peer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peer.onicecandidate = (e) => {
            if (e.candidate) {
                socket.current.emit('webrtc-ice-candidate', { targetId: lawyerId, candidate: e.candidate });
            }
        };

        peer.ontrack = (e) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = e.streams[0];
            }
        };

        peer.onconnectionstatechange = () => {
            if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
                endCall('Conexão perdida.');
            }
        };

        return peer;
    };

    const endCall = (message: string) => {
        if (pc.current) {
            pc.current.close();
            pc.current = null;
        }
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
            localStream.current = null;
        }
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        setInCall(false);
        setInfo(message);
    };

    const handleCall = () => {
        if (isOnline && !isBusy) {
            setInfo('Chamando...');
            socket.current.emit('request-call', { mode });
        }
    };

    const handleHangup = () => {
        socket.current.emit('end-call', {});
        endCall('Você encerrou a chamada.');
    };

    const handleSendChat = () => {
        if (chatInput.trim() === '') return;
        socket.current.emit('chat-message', { message: chatInput });
        setMessages(prev => [...prev, { sender: 'client', text: chatInput }]);
        setChatInput('');
    };

    return (
        <section id="contact" className="py-20 bg-gray-800 text-white">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl font-bold text-center mb-12">Contato Direto</h2>
                <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex rounded-md shadow-sm">
                            <button onClick={() => setMode('video')} className={`px-4 py-2 text-sm font-medium ${mode === 'video' ? 'bg-[#B98F58]' : 'bg-gray-700'} rounded-l-lg hover:bg-[#a37d4b]`}>
                                Vídeo Chamada
                            </button>
                            <button onClick={() => setMode('chat')} className={`px-4 py-2 text-sm font-medium ${mode === 'chat' ? 'bg-[#B98F58]' : 'bg-gray-700'} rounded-r-lg hover:bg-[#a37d4b]`}>
                                Chat
                            </button>
                        </div>
                    </div>

                    <div className="text-center mb-4">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${isOnline && !isBusy ? 'bg-green-500' : 'bg-red-500'}`}>
                            {isOnline && !isBusy ? 'Advogado Online' : (isOnline && isBusy ? 'Advogado Ocupado' : 'Advogado Offline')}
                        </span>
                    </div>

                    {mode === 'video' ? (
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <video ref={remoteVideoRef} autoPlay playsInline className="w-full bg-black rounded"></video>
                                <video ref={localVideoRef} autoPlay playsInline muted className="w-full bg-black rounded"></video>
                            </div>
                            <div className="flex justify-center space-x-4">
                                <button onClick={handleCall} disabled={!isOnline || isBusy || inCall} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                                    Ligar
                                </button>
                                <button onClick={handleHangup} disabled={!inCall} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                                    Encerrar
                                </button>
                            </div>
                            <div className="mt-4 text-center text-gray-400">{info}</div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-96">
                            <div className="flex-1 bg-gray-700 p-4 rounded-t-lg overflow-y-auto">
                                {messages.map((msg, index) => (
                                    <div key={index} className={`mb-2 ${msg.sender === 'client' ? 'text-right' : 'text-left'}`}>
                                        <span className={`inline-block p-2 rounded-lg ${msg.sender === 'client' ? 'bg-blue-500' : 'bg-gray-600'}`}>
                                            {msg.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                                    className="flex-1 p-2 bg-gray-600 border border-gray-500 rounded-bl-lg focus:outline-none focus:ring-2 focus:ring-[#B98F58] text-white"
                                    placeholder="Digite sua mensagem..."
                                    disabled={!isOnline}
                                />
                                <button
                                    onClick={handleSendChat}
                                    className="px-4 py-2 bg-[#B98F58] text-white font-bold rounded-br-lg hover:bg-[#a37d4b] transition-colors"
                                    disabled={!isOnline}
                                >
                                    Enviar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Contact;
