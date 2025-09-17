import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../styles/floating-chat.css';

type Sender = 'user' | 'assistant';

type ChatMessage = {
  id: string;
  sender: Sender;
  content: string;
  html?: boolean;
};

type QuestionType = 'text' | 'email' | 'tel' | 'number' | 'date' | 'buttons' | 'checklist';

type Question = {
  id: string;
  question?: string;
  text?: string;
  type?: QuestionType;
  options?: string[];
};

type Stage = 'summary' | 'questions' | 'contact' | 'done';

type ContactData = {
  name: string;
  email: string;
  phone: string;
  cpf: string;
};

const INITIAL_ASSISTANT_MESSAGE = 'Ola! Sou a secretaria virtual. Descreva seu caso em poucas palavras para que eu possa ajudar.';
const SESSION_STORAGE_KEY = 'secretary.sessionId';

const ensureSessionId = () => {
  if (typeof window === 'undefined') {
    return `session_${Date.now()}`;
  }
  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;
  const fresh = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  window.localStorage.setItem(SESSION_STORAGE_KEY, fresh);
  return fresh;
};

const parseServerPayload = async (response: Response) => {
  const raw = await response.text();
  try {
    return JSON.parse(raw);
  } catch (error) {
    const fenced = raw.match(/```json\s*([\s\S]*?)\s*```/);
    if (fenced && fenced[1]) {
      return JSON.parse(fenced[1]);
    }
    throw new Error('Resposta invalida do servidor.');
  }
};

const FloatingChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'assistant-initial', sender: 'assistant', content: INITIAL_ASSISTANT_MESSAGE },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [stage, setStage] = useState<Stage>('summary');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [contact, setContact] = useState<ContactData>({ name: '', email: '', phone: '', cpf: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const sessionId = useRef<string>(ensureSessionId());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, questions, stage, scrollToBottom]);

  const pushMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
    if (message.sender === 'assistant' && !isOpen) {
      setUnread((prev) => prev + 1);
    }
  }, [isOpen]);

  const resetFlow = () => {
    setStage('summary');
    setQuestions([]);
    setAnswers({});
    setContact({ name: '', email: '', phone: '', cpf: '' });
    setFormMessage(null);
  };

  const appendAssistantReply = (text: string) => {
    pushMessage({ id: `assistant-${Date.now()}`, sender: 'assistant', content: text });
  };

  const handleSummarySubmit = async () => {
    if (!inputValue.trim() || (stage !== 'summary' && stage !== 'done')) return;
    const summary = inputValue.trim();
    setInputValue('');
    setFormMessage(null);

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, sender: 'user', content: summary };

    if (stage === 'done') {
      setMessages([
        { id: 'assistant-initial', sender: 'assistant', content: INITIAL_ASSISTANT_MESSAGE },
        userMessage,
      ]);
      setStage('summary');
      setQuestions([]);
      setAnswers({});
    } else {
      pushMessage(userMessage);
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId.current, summary }),
      });
      if (!response.ok) {
        throw new Error('Falha ao buscar perguntas');
      }
      const payload = await parseServerPayload(response);
      if (!Array.isArray(payload?.questions)) {
        throw new Error('Formato inesperado de perguntas');
      }
      setQuestions(payload.questions);
      setAnswers({});
      setStage('questions');
    } catch (error) {
      console.error(error);
      appendAssistantReply('Desculpe, ocorreu um erro inesperado. Tente novamente mais tarde.');
      resetFlow();
    } finally {
      setIsLoading(false);
    }
  };

  const allQuestionsAnswered = useMemo(() => {
    return questions.every((question) => {
      const value = answers[question.id];
      return typeof value === 'string' && value.trim().length > 0;
    });
  }, [answers, questions]);

  const handleAnswersSubmit = async () => {
    if (!allQuestionsAnswered) {
      setFormMessage('Responda a todas as perguntas antes de enviar.');
      return;
    }

    setIsLoading(true);
    setFormMessage(null);
    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId.current, answers }),
      });
      if (!response.ok) {
        throw new Error('Falha ao enviar respostas');
      }
      const payload = await parseServerPayload(response);
      if (payload?.reply) {
        appendAssistantReply(payload.reply);
      }
      if (Array.isArray(payload?.questions) && payload.questions.length > 0) {
        setQuestions(payload.questions);
        setAnswers({});
        setStage('questions');
      } else if (payload?.action === 'collect_contact_info') {
        setStage('contact');
      } else {
        setStage('done');
        setQuestions([]);
      }
    } catch (error) {
      console.error(error);
      appendAssistantReply('Nao foi possivel processar as respostas no momento.');
      resetFlow();
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contact.name || !contact.email || !contact.phone || !contact.cpf) {
      setFormMessage('Informe todos os campos para finalizar.');
      return;
    }
    setIsLoading(true);
    setFormMessage(null);
    try {
      const response = await fetch('/api/report-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId.current, ...contact }),
      });
      if (!response.ok) {
        throw new Error('Falha ao registrar contato');
      }
      appendAssistantReply('Obrigado! Suas informacoes foram registradas.');
      setStage('done');
    } catch (error) {
      console.error(error);
      appendAssistantReply('Nao foi possivel registrar seus dados agora. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessages = () =>
    messages.map((message) => (
      <div
        key={message.id}
        className={`chat-message chat-message-${message.sender}`}
        {...(message.html ? { dangerouslySetInnerHTML: { __html: message.content } } : {})}
      >
        {!message.html ? message.content : null}
      </div>
    ));

  const renderQuestions = () => {
    if (stage !== 'questions') return null;
    return (
      <div className="chat-question-block">
        {questions.map((question) => {
          const questionText = question.text ?? question.question ?? '';
          const answerValue = answers[question.id] ?? '';
          if (question.type === 'buttons') {
            return (
              <div key={question.id} className="question">
                <strong>{questionText}</strong>
                <div className="input-area">
                  {(question.options ?? []).map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`question-button ${answerValue === option ? 'selected' : ''}`}
                      onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option }))}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          if (question.type === 'checklist') {
            const currentValues = new Set((answers[question.id] ?? '').split(',').map((value) => value.trim()).filter(Boolean));
            return (
              <div key={question.id} className="question">
                <strong>{questionText}</strong>
                <div className="input-area checklist">
                  {(question.options ?? []).map((option) => {
                    const checked = currentValues.has(option);
                    return (
                      <label key={option} className="checklist-item">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            const next = new Set(currentValues);
                            if (event.target.checked) {
                              next.add(option);
                            } else {
                              next.delete(option);
                            }
                            setAnswers((prev) => ({
                              ...prev,
                              [question.id]: Array.from(next).join(', '),
                            }));
                          }}
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <div key={question.id} className="question">
              <strong>{questionText}</strong>
              <div className="input-area">
                <div className="text-input-wrapper">
                  <input
                    type={question.type ?? 'text'}
                    value={answerValue === 'Nao informado' ? '' : answerValue}
                    onChange={(event) => setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))}
                    placeholder="Sua resposta"
                  />
                  <button
                    type="button"
                    className="not-informed-btn"
                    onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: 'Nao informado' }))}
                  >
                    Nao sei informar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {formMessage && <div className="form-error">{formMessage}</div>}
        <button type="button" className="submit-answers" onClick={handleAnswersSubmit} disabled={isLoading}>
          Enviar respostas
        </button>
      </div>
    );
  };

  const renderContactForm = () => {
    if (stage !== 'contact') return null;
    return (
      <form className="chat-contact-form" onSubmit={handleContactSubmit}>
        <strong>Preencha os dados para que o advogado entre em contato:</strong>
        <label>
          Nome completo
          <input
            type="text"
            value={contact.name}
            onChange={(event) => setContact((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={contact.email}
            onChange={(event) => setContact((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </label>
        <label>
          Telefone
          <input
            type="tel"
            value={contact.phone}
            onChange={(event) => setContact((prev) => ({ ...prev, phone: event.target.value }))}
            required
          />
        </label>
        <label>
          CPF
          <input
            type="text"
            value={contact.cpf}
            onChange={(event) => setContact((prev) => ({ ...prev, cpf: event.target.value }))}
            required
          />
        </label>
        {formMessage && <div className="form-error">{formMessage}</div>}
        <button type="submit" className="submit-answers" disabled={isLoading}>
          Enviar dados
        </button>
      </form>
    );
  };

  const renderTyping = () =>
    isLoading ? (
      <div className="chat-message chat-message-assistant typing-indicator" aria-live="polite">
        <span />
        <span />
        <span />
      </div>
    ) : null;

  const inputDisabled = stage === 'questions' || stage === 'contact';

  return (
    <div className="floating-chat-container" aria-live="polite">
      <div className={`chat-window card shadow-lg ${isOpen ? 'visible' : ''}`} role="dialog" aria-modal={isOpen}>
        <div className="card-header bg-primary text-white d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span className="status-dot" aria-hidden="true" />
            <div>
              <h5 className="mb-0 fs-6">Secretaria Virtual</h5>
              <div className="small opacity-75">Responde em segundos</div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button type="button" className="btn btn-sm btn-light" aria-label="Minimizar chat" onClick={() => setIsOpen(false)}>
              <i className="bi bi-dash" />
            </button>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Fechar"
              onClick={() => {
                setIsOpen(false);
                resetFlow();
              }}
            />
          </div>
        </div>
        <div className="card-body d-flex flex-column">
          <div className="chat-scrollable" role="log" aria-live="polite">
            {renderMessages()}
            {renderQuestions()}
            {renderContactForm()}
            {renderTyping()}
            <div ref={messagesEndRef} />
          </div>
          <div className="input-group mt-3" role="group" aria-label="Entrada de mensagem">
            <input
              type="text"
              className="form-control"
              placeholder={
                stage === 'summary'
                  ? 'Descreva seu caso e pressione Enter'
                  : stage === 'done'
                  ? 'Envie uma nova mensagem'
                  : 'Complete as informacoes acima'
              }
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSummarySubmit();
                }
              }}
              disabled={inputDisabled || isLoading}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSummarySubmit}
              disabled={inputDisabled || isLoading || !inputValue.trim()}
            >
              <i className="bi bi-send-fill" />
            </button>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="btn btn-primary btn-lg rounded-circle shadow-lg open-chat-btn"
        aria-label="Abrir chat de assistencia"
        onClick={() => {
          setIsOpen(true);
          setUnread(0);
        }}
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <i className="bi bi-chat-dots-fill fs-3" />
        {unread > 0 && <span className="badge text-bg-danger unread-badge">{unread}</span>}
      </button>
    </div>
  );
};

export default FloatingChat;
