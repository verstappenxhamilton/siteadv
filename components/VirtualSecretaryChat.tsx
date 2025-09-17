
import React, { useState, useEffect, useRef } from 'react';

const VirtualSecretaryChat: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<{ text: string; sender: string; type: 'text' | 'html' }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [intakeState, setIntakeState] = useState({
        summary: '',
        questions: [],
        answers: {},
        stage: 'summary'
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setSessionId(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
            setMessages([{ text: 'Olá! Sou a secretária virtual. Por favor, descreva seu caso em poucas palavras para que eu possa ajudar.', sender: 'assistant', type: 'text' }]);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (inputValue.trim() === '') return;

        const userMessage = { text: inputValue, sender: 'user', type: 'text' as 'text' };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        if (intakeState.stage === 'summary') {
            setIntakeState(prev => ({ ...prev, summary: inputValue }));
            // Show typing indicator
            setMessages(prev => [...prev, { text: '...', sender: 'assistant', type: 'text' }]);
            try {
                const response = await fetch('/api/questions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId, summary: inputValue })
                });
                const data = await response.json();
                setIntakeState(prev => ({ ...prev, questions: data.questions, stage: 'questions' }));
                setMessages(prev => prev.slice(0, -1)); // Remove typing indicator
                displayQuestions(data.questions);
            } catch (error) {
                console.error('Error fetching questions:', error);
                setMessages(prev => [...prev.slice(0, -1), { text: 'Desculpe, ocorreu um erro. Por favor, tente novamente mais tarde.', sender: 'assistant', type: 'text' }]);
            }
        }
    };

    const displayQuestions = (questions: any[]) => {
        const formHtml = questions.map(q => {
            let inputHtml = '';
            const questionText = q.text || q.question;
            switch (q.type) {
                case 'buttons':
                    inputHtml = q.options.map((opt: string) => `<button class="question-button" data-question-id="${q.id}" value="${opt}">${opt}</button>`).join('');
                    break;
                case 'checklist':
                    inputHtml = q.options.map((opt: string) => `
                        <label class="checklist-item">
                            <input type="checkbox" name="${q.id}" value="${opt}">
                            <span>${opt}</span>
                        </label>
                    `).join('');
                    break;
                case 'date':
                    inputHtml = `<input type="date" id="${q.id}" name="${q.id}">`;
                    break;
                default:
                    inputHtml = `
                        <div class="text-input-wrapper">
                            <input type="${q.type || 'text'}" id="${q.id}" name="${q.id}" placeholder="Sua resposta...">
                            <button class="not-informed-btn" data-question-id="${q.id}">Não sei informar</button>
                        </div>
                    `;
            }
            return `<div class="question"><strong>${questionText}</strong><div class="input-area">${inputHtml}</div></div>`;
        }).join('');

        const formContainer = { text: formHtml, sender: 'assistant', type: 'html' as 'html' };
        setMessages(prev => [...prev, formContainer]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-20 right-4 w-96 bg-gray-900 text-white rounded-lg shadow-lg flex flex-col z-50">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-lg">Secretária Virtual</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto h-96 bg-gray-800">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-[#B98F58] text-white' : 'bg-gray-700 text-white'}`}>
                            {msg.type === 'html' ? (
                                <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                            ) : (
                                <p>{msg.text}</p>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-700">
                <div className="flex">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#B98F58] transition-colors"
                        placeholder="Digite sua mensagem..."
                    />
                    <button
                        onClick={handleSendMessage}
                        className="px-6 py-3 bg-[#B98F58] text-white font-bold rounded-r-md hover:bg-[#a37d4b] transition-colors"
                    >
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VirtualSecretaryChat;
