
import React, { useEffect, useMemo, useRef, useState } from 'react';

type Stage = 'summary' | 'questions' | 'contact' | 'done';

type Question = {
    id: string;
    text?: string;
    question?: string;
    type?: string;
    options?: string[];
};

type Message =
    | { id: string; sender: 'assistant' | 'user'; kind: 'text'; content: string }
    | { id: string; sender: 'assistant'; kind: 'questions'; questions: Question[] }
    | { id: string; sender: 'assistant'; kind: 'contact' };

const INITIAL_MESSAGE: Message = {
    id: 'welcome',
    sender: 'assistant',
    kind: 'text',
    content: 'Olá! Sou a secretária virtual. Por favor, descreva seu caso em poucas palavras para que eu possa ajudar.'
};

const parseJsonResponse = async (response: Response) => {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (err) {
        const match = text.match(/```json\s*([\s\S]*?)```/i);
        if (match && match[1]) {
            return JSON.parse(match[1]);
        }
        throw err;
    }
};

const VirtualSecretaryChat: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [stage, setStage] = useState<Stage>('summary');
    const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
    const [formAnswers, setFormAnswers] = useState<Record<string, string | string[]>>({});
    const [disabledInputs, setDisabledInputs] = useState<string[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [contactData, setContactData] = useState({ name: '', email: '', phone: '', cpf: '' });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isInputVisible = stage === 'summary';

    useEffect(() => {
        if (isOpen) {
            setSessionId(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
            setMessages([INITIAL_MESSAGE]);
            setInputValue('');
            setStage('summary');
            setCurrentQuestions([]);
            setFormAnswers({});
            setDisabledInputs([]);
            setAnswers({});
            setFormError(null);
            setContactData({ name: '', email: '', phone: '', cpf: '' });
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const addMessage = (message: Message) => {
        setMessages(prev => [...prev, message]);
    };

    const handleSendSummary = async () => {
        if (inputValue.trim() === '') return;

        const text = inputValue.trim();
        addMessage({
            id: `user-${Date.now()}`,
            sender: 'user',
            kind: 'text',
            content: text
        });
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, summary: text })
            });
            if (!response.ok) {
                throw new Error('Falha ao buscar perguntas.');
            }

            const data = await parseJsonResponse(response);
            const questions: Question[] = data.questions || [];
            setCurrentQuestions(questions);
            setFormAnswers({});
            setDisabledInputs([]);
            setStage('questions');
            addMessage({
                id: `questions-${Date.now()}`,
                sender: 'assistant',
                kind: 'questions',
                questions
            });
        } catch (error) {
            console.error('Error fetching questions:', error);
            addMessage({
                id: `error-${Date.now()}`,
                sender: 'assistant',
                kind: 'text',
                content: 'Desculpe, ocorreu um erro. Por favor, tente novamente mais tarde.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = () => {
        if (stage === 'summary') {
            void handleSendSummary();
        }
    };

    const handleOptionSelect = (questionId: string, value: string) => {
        setFormAnswers(prev => ({ ...prev, [questionId]: value }));
        setFormError(null);
    };

    const handleCheckboxToggle = (questionId: string, option: string) => {
        setFormAnswers(prev => {
            const current = Array.isArray(prev[questionId]) ? (prev[questionId] as string[]) : [];
            if (current.includes(option)) {
                return { ...prev, [questionId]: current.filter(item => item !== option) };
            }
            return { ...prev, [questionId]: [...current, option] };
        });
        setFormError(null);
    };

    const handleInputChange = (questionId: string, value: string) => {
        setFormAnswers(prev => ({ ...prev, [questionId]: value }));
        setDisabledInputs(prev => prev.filter(id => id !== questionId));
        setFormError(null);
    };

    const handleNotInformed = (questionId: string) => {
        setFormAnswers(prev => ({ ...prev, [questionId]: 'Não informado' }));
        setDisabledInputs(prev => (prev.includes(questionId) ? prev : [...prev, questionId]));
        setFormError(null);
    };

    const handleSubmitAnswers = async () => {
        if (isLoading) return;
        if (!currentQuestions.length) return;

        let missing = false;
        const normalizedAnswers: Record<string, string> = { ...answers };

        currentQuestions.forEach(question => {
            const key = question.id;
            const rawValue = formAnswers[key];
            if (question.type === 'checklist') {
                const values = Array.isArray(rawValue) ? rawValue : [];
                normalizedAnswers[key] = values.length > 0 ? values.join(', ') : 'Nenhum item selecionado';
            } else if (typeof rawValue === 'string' && rawValue.trim() !== '') {
                normalizedAnswers[key] = rawValue;
            } else if (typeof rawValue === 'string' && rawValue === 'Não informado') {
                normalizedAnswers[key] = rawValue;
            } else {
                missing = true;
            }
        });

        if (missing) {
            setFormError('Por favor, responda a todas as perguntas antes de enviar.');
            return;
        }

        setIsLoading(true);
        setFormError(null);

        try {
            const response = await fetch('/api/answers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, answers: normalizedAnswers })
            });
            if (!response.ok) {
                throw new Error('Falha ao enviar respostas.');
            }

            const data = await parseJsonResponse(response);
            setAnswers(normalizedAnswers);

            if (Array.isArray(data.questions) && data.questions.length > 0) {
                setCurrentQuestions(data.questions);
                setFormAnswers({});
                setDisabledInputs([]);
                setStage('questions');
                addMessage({
                    id: `questions-${Date.now()}`,
                    sender: 'assistant',
                    kind: 'questions',
                    questions: data.questions
                });
            } else if (data.action === 'collect_contact_info') {
                if (data.reply) {
                    addMessage({
                        id: `reply-${Date.now()}`,
                        sender: 'assistant',
                        kind: 'text',
                        content: data.reply
                    });
                }
                setStage('contact');
                addMessage({ id: `contact-${Date.now()}`, sender: 'assistant', kind: 'contact' });
            } else if (data.reply) {
                addMessage({
                    id: `reply-${Date.now()}`,
                    sender: 'assistant',
                    kind: 'text',
                    content: data.reply
                });
                setStage('done');
            }
        } catch (error) {
            console.error('Error finishing intake:', error);
            addMessage({
                id: `error-${Date.now()}`,
                sender: 'assistant',
                kind: 'text',
                content: 'Desculpe, ocorreu um erro ao processar suas respostas.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleContactSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!contactData.name || !contactData.email || !contactData.phone || !contactData.cpf) {
            setFormError('Por favor, preencha todos os campos antes de enviar.');
            return;
        }

        setIsLoading(true);
        setFormError(null);

        try {
            await fetch('/api/report-contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, ...contactData })
            });
            addMessage({
                id: `contact-response-${Date.now()}`,
                sender: 'assistant',
                kind: 'text',
                content: 'Obrigado! Suas informações foram recebidas. Entraremos em contato em breve.'
            });
            setStage('done');
        } catch (error) {
            console.error('Failed to save contact info:', error);
            setFormError('Não foi possível enviar seus dados. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderQuestionInput = (question: Question) => {
        const id = question.id;
        const label = question.text || question.question || '';
        const type = question.type || 'text';

        if (type === 'buttons') {
            return (
                <div className="flex flex-wrap gap-2 mt-2">
                    {(question.options || []).map(option => {
                        const isSelected = formAnswers[id] === option;
                        return (
                            <button
                                key={option}
                                type="button"
                                className={`px-3 py-2 rounded border transition ${isSelected ? 'bg-[#B98F58] border-[#B98F58] text-white' : 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'}`}
                                onClick={() => handleOptionSelect(id, option)}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            );
        }

        if (type === 'checklist') {
            const values = Array.isArray(formAnswers[id]) ? (formAnswers[id] as string[]) : [];
            return (
                <div className="space-y-2 mt-2">
                    {(question.options || []).map(option => {
                        const checked = values.includes(option);
                        return (
                            <label key={option} className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    className="form-checkbox text-[#B98F58]"
                                    checked={checked}
                                    onChange={() => handleCheckboxToggle(id, option)}
                                />
                                <span>{option}</span>
                            </label>
                        );
                    })}
                </div>
            );
        }

        const inputType = type === 'textarea' ? undefined : type;
        const commonClasses = 'w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-[#B98F58]';
        const value = typeof formAnswers[id] === 'string' ? (formAnswers[id] as string) : '';
        const isDisabled = disabledInputs.includes(id);

        return (
            <div className="space-y-2 mt-2">
                {type === 'textarea' ? (
                    <textarea
                        className={`${commonClasses} resize-none`}
                        rows={3}
                        value={value}
                        disabled={isDisabled}
                        onChange={(event) => handleInputChange(id, event.target.value)}
                    />
                ) : (
                    <input
                        type={inputType || 'text'}
                        className={commonClasses}
                        value={value}
                        disabled={isDisabled}
                        onChange={(event) => handleInputChange(id, event.target.value)}
                    />
                )}
                <button
                    type="button"
                    className="text-xs text-gray-300 hover:text-white underline"
                    onClick={() => handleNotInformed(id)}
                >
                    Não sei informar
                </button>
            </div>
        );
    };

    const questionMessages = useMemo(() => messages.filter(message => message.kind === 'questions') as Extract<Message, { kind: 'questions' }>[], [messages]);

    return isOpen ? (
        <div className="fixed bottom-20 right-4 w-96 bg-gray-900 text-white rounded-lg shadow-lg flex flex-col z-50">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-lg">Secretária Virtual</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl" aria-label="Fechar chat">
                    &times;
                </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto h-96 bg-gray-800 space-y-3">
                {messages.map(message => {
                    if (message.kind === 'text') {
                        return (
                            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-lg px-4 py-2 ${message.sender === 'user' ? 'bg-[#B98F58] text-white' : 'bg-gray-700 text-white'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        );
                    }

                    if (message.kind === 'questions') {
                        return (
                            <div key={message.id} className="bg-gray-700 rounded-lg px-4 py-3 text-sm space-y-4">
                                {message.questions.map(question => (
                                    <div key={question.id}>
                                        <strong className="block text-sm">{question.text || question.question}</strong>
                                        {renderQuestionInput(question)}
                                    </div>
                                ))}
                                {formError && questionMessages[questionMessages.length - 1]?.id === message.id && (
                                    <p className="text-xs text-red-300">{formError}</p>
                                )}
                                {questionMessages[questionMessages.length - 1]?.id === message.id && (
                                    <button
                                        type="button"
                                        className="w-full mt-2 bg-[#B98F58] text-white font-semibold py-2 rounded hover:bg-[#a37d4b]"
                                        onClick={handleSubmitAnswers}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Enviando...' : 'Enviar Respostas'}
                                    </button>
                                )}
                            </div>
                        );
                    }

                    if (message.kind === 'contact') {
                        return (
                            <form key={message.id} className="bg-gray-700 rounded-lg px-4 py-3 space-y-3" onSubmit={handleContactSubmit}>
                                <p className="text-sm">Para finalizar, por favor, preencha seus dados:</p>
                                <input
                                    type="text"
                                    placeholder="Nome completo"
                                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-sm"
                                    value={contactData.name}
                                    onChange={(event) => setContactData(prev => ({ ...prev, name: event.target.value }))}
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-sm"
                                    value={contactData.email}
                                    onChange={(event) => setContactData(prev => ({ ...prev, email: event.target.value }))}
                                />
                                <input
                                    type="tel"
                                    placeholder="Telefone"
                                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-sm"
                                    value={contactData.phone}
                                    onChange={(event) => setContactData(prev => ({ ...prev, phone: event.target.value }))}
                                />
                                <input
                                    type="text"
                                    placeholder="CPF"
                                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-sm"
                                    value={contactData.cpf}
                                    onChange={(event) => setContactData(prev => ({ ...prev, cpf: event.target.value }))}
                                />
                                {formError && <p className="text-xs text-red-300">{formError}</p>}
                                <button
                                    type="submit"
                                    className="w-full bg-[#B98F58] text-white font-semibold py-2 rounded hover:bg-[#a37d4b]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Enviando...' : 'Enviar Dados'}
                                </button>
                            </form>
                        );
                    }

                    return null;
                })}
                {isLoading && (
                    <div className="text-xs text-gray-300">Secretária digitando...</div>
                )}
                <div ref={messagesEndRef} />
            </div>
            {isInputVisible ? (
                <div className="p-4 border-t border-gray-700">
                    <div className="flex">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(event) => setInputValue(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#B98F58] transition-colors"
                            placeholder="Digite seu resumo..."
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            className="px-6 py-3 bg-[#B98F58] text-white font-bold rounded-r-md hover:bg-[#a37d4b] transition-colors disabled:opacity-60"
                            disabled={isLoading}
                            type="button"
                        >
                            Enviar
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    ) : null;
};

export default VirtualSecretaryChat;
