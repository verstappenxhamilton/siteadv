import React, { useEffect, useRef, useState } from 'react';

const createSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const getRandomByte = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      return crypto.getRandomValues(new Uint8Array(1))[0];
    }

    return Math.floor(Math.random() * 256);
  };

  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return template.replace(/[xy]/g, (character) => {
    const random = getRandomByte();
    const value = character === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'Olá! Como posso ajudar com seu caso imobiliário hoje?',
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAnchorRef = useRef(null);

  useEffect(() => {
    if (isOpen && !sessionId) {
      setSessionId(createSessionId());
      setMessages([INITIAL_MESSAGE]);
    }
  }, [isOpen, sessionId]);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }

    const userMessage = { role: 'user', content: trimmed };
    setMessages((previous) => [...previous, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: trimmed }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessages((previous) => [...previous, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content: 'Desculpe, não foi possível conectar ao servidor. Tente novamente mais tarde.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <button
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          className="bg-[#B98F58] text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-[#A07A4D] transition-all duration-300 transform hover:scale-110"
          aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          )}
        </button>
      </div>

      <div
        className={`fixed bottom-28 right-8 w-11/12 max-w-sm md:w-96 h-[60vh] bg-white rounded-xl shadow-2xl flex flex-col z-50 transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-gradient-to-r from-[#0D1B2A] to-[#1A2F4B] text-white p-4 rounded-t-xl flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">Assistente Virtual</h3>
            <p className="text-sm text-gray-300">Triagem de caso imobiliário</p>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`my-2 flex animate-fade-in-up ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs shadow ${
                  message.role === 'user' ? 'bg-[#B98F58] text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="my-2 flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2 max-w-xs shadow">
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollAnchorRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50 rounded-b-xl">
          <div className="flex">
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#B98F58] focus:border-transparent"
              placeholder="Digite sua mensagem..."
            />
            <button
              type="submit"
              className="bg-[#0D1B2A] text-white px-4 py-2 rounded-r-md hover:bg-[#1A2F4B] transition-colors disabled:opacity-50 flex items-center justify-center"
              disabled={!inputValue.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatWidget;
