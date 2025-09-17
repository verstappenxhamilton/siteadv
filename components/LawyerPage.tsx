import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { getMediaWithFallback, explainGetUserMediaError } from '../utils/media';
import AIConfig from './AIConfig';
import Reports from './Reports';
import ContentEditor from './ContentEditor';

const LawyerPage: React.FC = () => {
    const [info, setInfo] = useState('Aguardando chamadas...');
    const [isBusy, setIsBusy] = useState(false);
    const [incomingCall, setIncomingCall] = useState<{ clientId: string; mode: string } | null>(null);
    const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const pc = useRef<RTCPeerConnection | null>(null);
    const localStream = useRef<MediaStream | null>(null);
    const socket = useRef<any>(null);
    const currentClientId = useRef<string | null>(null);

    useEffect(() => {
        socket.current = io();
        socket.current.emit('identify', { role: 'lawyer' });

        socket.current.on('incoming-call', ({ clientId, mode }: { clientId: string; mode: string }) => {
            setIncomingCall({ clientId, mode });
        });

        socket.current.on('webrtc-offer', async ({ from, sdp }: { from: string, sdp: any }) => {
            if (pc.current) {
                await pc.current.setRemoteDescription(new RTCSessionDescription(sdp));
                const answer = await pc.current.createAnswer();
                await pc.current.setLocalDescription(answer);
                socket.current.emit('webrtc-answer', { targetId: from, sdp: answer });
            }
        });

        socket.current.on('webrtc-ice-candidate', ({ candidate }: { candidate: any }) => {
            if (pc.current && candidate) {
                pc.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        socket.current.on('chat-message', ({ from, message }: { from: string, message: string }) => {
            setMessages(prev => [...prev, { sender: 'client', text: message }]);
            currentClientId.current = from;
        });

        socket.current.on('call-ended', () => {
            endCall('Cliente encerrou a chamada.');
        });

        return () => {
            socket.current.disconnect();
        };
    }, []);

    const createPeerConnection = (clientId: string) => {
        const peer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peer.onicecandidate = (e) => {
            if (e.candidate) {
                socket.current.emit('webrtc-ice-candidate', { targetId: clientId, candidate: e.candidate });
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
        setIsBusy(false);
        setInfo(message);
    };

    const handleAcceptCall = async () => {
        if (!incomingCall) return;

        try {
            const { stream } = await getMediaWithFallback(incomingCall.mode as any);
            localStream.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            pc.current = createPeerConnection(incomingCall.clientId);
            stream.getTracks().forEach(track => pc.current?.addTrack(track, stream));

            socket.current.emit('accept-call', { clientId: incomingCall.clientId });
            currentClientId.current = incomingCall.clientId;
            setIsBusy(true);
            setIncomingCall(null);
            setInfo('Chamada em andamento...');
        } catch (error) {
            console.error('Error accepting call:', error);
            setInfo(explainGetUserMediaError(error));
        }
    };

    const handleRejectCall = () => {
        if (!incomingCall) return;
        socket.current.emit('reject-call', { clientId: incomingCall.clientId });
        setIncomingCall(null);
    };

    const handleHangup = () => {
        if (currentClientId.current) {
            socket.current.emit('end-call', { targetId: currentClientId.current });
        }
        endCall('Você encerrou a chamada.');
    };

    const handleSendChat = () => {
        if (chatInput.trim() === '' || !currentClientId.current) return;
        socket.current.emit('chat-message', { targetId: currentClientId.current, message: chatInput });
        setMessages(prev => [...prev, { sender: 'lawyer', text: chatInput }]);
        setChatInput('');
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white p-8">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">Painel do Advogado</h1>
                    <div className="badge online">Você está online</div>
                </div>

                {incomingCall && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
                            <h2 className="text-xl font-bold mb-4">Chamada Recebida</h2>
                            <p className="mb-6">Um cliente está ligando em modo {incomingCall.mode}.</p>
                            <div className="flex justify-center space-x-4">
                                <button onClick={handleAcceptCall} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                                    Atender
                                </button>
                                <button onClick={handleRejectCall} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                                    Recusar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-xl font-bold mb-4">Vídeo Chamada</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <video ref={remoteVideoRef} autoPlay playsInline className="w-full bg-black rounded"></video>
                            <video ref={localVideoRef} autoPlay playsInline muted className="w-full bg-black rounded"></video>
                        </div>
                        <div className="mt-4 flex justify-center">
                            <button onClick={handleHangup} disabled={!isBusy} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                                Encerrar Chamada
                            </button>
                        </div>
                        <div className="mt-4 text-center text-gray-400">{info}</div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg flex flex-col">
                        <h2 className="text-xl font-bold mb-4">Chat</h2>
                        <div className="flex-1 bg-gray-700 p-4 rounded-t-lg overflow-y-auto h-64">
                            {messages.map((msg, index) => (
                                <div key={index} className={`mb-2 ${msg.sender === 'lawyer' ? 'text-right' : 'text-left'}`}>
                                    <span className={`inline-block p-2 rounded-lg ${msg.sender === 'lawyer' ? 'bg-blue-500' : 'bg-gray-600'}`}>
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
                            />
                            <button
                                onClick={handleSendChat}
                                className="px-4 py-2 bg-[#B98F58] text-white font-bold rounded-br-lg hover:bg-[#a37d4b] transition-colors"
                            >
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>
                <AIConfig />
                <Reports />
                <ContentEditor />
            </div>
        </div>
    );
};

export default LawyerPage;