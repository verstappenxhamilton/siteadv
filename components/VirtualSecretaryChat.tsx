import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';

type ChatMessage = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

type CleanupFn = () => void;

const CHAT_PROMPT = `Você é um "Analista Jurídico Virtual". Seu objetivo é coletar dados para futuros advogados.

1) Seja EXTREMAMENTE breve (máx. 15 palavras).
2) Faça UMA pergunta por vez.
3) Quando possível, ofereça botões com ATÉ 10 opções curtas usando [[OPCOES: ...]] (inclua "Outro" como última opção).
4) Antes de solicitar texto livre, tente refinar a pergunta oferecendo menus sucessivos de opções relevantes.
5) Quando realmente precisar de resposta livre, avise: "Por favor, digite". Se for data ou período, utilize [[DATE: <período>]]; se for valor numérico, use [[NUMBER: <label>]].
6) Só peça documentos AO FINAL da coleta. Inicie dizendo: "Seguem os documentos necessários:" e então, para CADA documento que julgar relevante (sem limite de quantidade), mostre [[UPLOAD: <nome do documento>|accept=.pdf]]. Após listar todos, conclua: "Caso não possua algum, clique em 'Não possuo'".
7) Sempre inclua a opção "Não possuo" como botão rápido após cada solicitação de upload.
8) Nunca solicite upload antes dessa etapa final.
9) Quando todas as informações estiverem claras, encerre com: "Agradeço pelas informações. A coleta de dados está concluída. Nossos advogados entrarão em contato em breve. O atendimento por aqui está finalizado.".`;

const ANALYTICAL_PROMPT = `Você é um "Advogado Especialista em Análise de Casos". Sua tarefa é receber um histórico de chat e transformá-lo em um "Relatório de Análise Preliminar" estruturado e detalhado. O relatório deve ser em formato Markdown e seguir RIGOROSAMENTE a estrutura abaixo. Extraia as informações do chat e preencha cada seção apropriadamente. Se uma informação não foi fornecida, indique "Não informado".

# Relatório de Análise Preliminar

**ID do Relatório:** {{ID_DO_RELATORIO}}
**Data da Emissão:** {{DATA_ATUAL}}

## 1. Identificação do Cliente
(Extraia e liste aqui Nome Completo, CPF/CNPJ, e Contato do cliente a partir do histórico do chat.)

## 2. Classificação do Caso
- **Área do Direito:** (Identifique a área do direito.)
- **Tipo de Ação Proposta:** (Identifique o tipo de ação.)
- **Partes Envolvidas:** (Liste o cliente como "Requerente/Reclamante" e as outras partes.)

## 3. Resumo dos Fatos
(Faça um resumo narrativo claro e objetivo dos fatos apresentados pelo cliente no chat.)

## 4. Análise Preliminar da IA
(Com base nos fatos, faça uma breve análise técnica. Identifique os principais pontos de conflito e as possíveis teses jurídicas.)

## 5. Documentos Anexados
(Liste os nomes dos documentos que o sistema informou terem sido anexados.)

## 6. Próximos Passos Recomendados
(Sugira os próximos passos práticos, como "Agendar reunião", "Solicitar documentação complementar", etc.)`;

const END_CHAT_PHRASE = 'O atendimento por aqui está finalizado.';

const initializeVirtualSecretaryChat = (container: HTMLElement): CleanupFn => {
    const messageContainer = container.querySelector('#message-container') as HTMLElement;
    const formContainer = container.querySelector('#form-container') as HTMLElement;
    const userInput = container.querySelector('#user-input') as HTMLTextAreaElement;
    const sendButton = container.querySelector('#send-button') as HTMLButtonElement;
    const fileUploadLabel = container.querySelector('#file-upload-label') as HTMLLabelElement;
    const fileUploadInput = container.querySelector('#file-upload-input') as HTMLInputElement;
    const restartButton = container.querySelector('#restart-button') as HTMLButtonElement;
    const newChatBtn = container.querySelector('#new-chat-btn') as HTMLButtonElement;

    if (!messageContainer || !formContainer || !userInput || !sendButton || !fileUploadLabel || !fileUploadInput || !restartButton || !newChatBtn) {
        throw new Error('Estrutura do chat não encontrada.');
    }

    let messages: ChatMessage[] = [];
    let currentReportId: string | null = null;
    let chatFinished = false;
    let typingIndicator: HTMLDivElement | null = null;
    let pendingUploads = 0;

    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        });
    };

    const showButtonLoading = (button: HTMLButtonElement, show: boolean, fallbackHtml?: string) => {
        if (show) {
            button.disabled = true;
            if (!button.dataset.originalContent) {
                button.dataset.originalContent = button.innerHTML;
            }
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else {
            button.disabled = false;
            const original = button.dataset.originalContent;
            button.innerHTML = fallbackHtml || original || button.innerHTML;
        }
    };

    const showTypingIndicator = () => {
        if (typingIndicator) return;
        typingIndicator = document.createElement('div');
        typingIndicator.className = 'message assistant flex items-center gap-2 text-sm text-gray-600';
        typingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span> Digitando...</span>';
        messageContainer.appendChild(typingIndicator);
        scrollToBottom();
    };

    const hideTypingIndicator = () => {
        if (!typingIndicator) return;
        typingIndicator.remove();
        typingIndicator = null;
    };

    const sendLocalUpdate = async () => {
        try {
            await fetch('/api/relatorios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportId: currentReportId,
                    chatHistory: messages,
                    systemPrompt: '__SKIP__'
                })
            });
        } catch (error) {
            console.warn('Falha ao atualizar histórico parcial:', error);
        }
    };

    const createQuickOptionButton = (label: string) => {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.type = 'button';
        btn.className = 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition text-sm';
        btn.addEventListener('click', () => {
            const normalized = label.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
            if (normalized === 'outro' || normalized === 'outra') {
                userInput.focus();
                return;
            }
            userInput.value = label;
            handleSendMessage();
        });
        return btn;
    };

    const appendInteractiveSendButton = (wrapper: HTMLElement, getValue: () => string | null) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = 'Enviar';
        btn.className = 'self-start mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm';
        btn.addEventListener('click', () => {
            const value = getValue();
            if (value) {
                userInput.value = value;
                handleSendMessage();
            }
        });
        wrapper.appendChild(btn);
    };

    const handleUploadResolved = () => {
        pendingUploads = Math.max(pendingUploads - 1, 0);
        if (pendingUploads === 0) {
            userInput.value = 'Todos os documentos respondidos';
            handleSendMessage();
            fileUploadLabel.classList.add('hidden');
        }
    };

    const addMessage = (role: ChatMessage['role'], content: string, isHtml = false) => {
        messages.push({ role, content });

        if (role === 'assistant') {
            userInput.disabled = false;
        }

        if (role !== 'system') {
            let cleanContent = content || '';
            const optionRegex = /\[\[OPCOES:(.*?)\]\]/i;
            const quickOptionsMatch = cleanContent.match(optionRegex);
            const quickOptions = quickOptionsMatch ? quickOptionsMatch[1].split(/\||,/).map((opt) => opt.trim()).filter(Boolean) : [];
            if (quickOptionsMatch) {
                cleanContent = cleanContent.replace(quickOptionsMatch[0], '').trim();
            }

            const interactiveWrapper = document.createElement('div');
            interactiveWrapper.className = 'flex flex-col gap-2 mt-2';

            const inputRegex = /\[\[INPUT:\s*(.*?)\]\]/i;
            const selectRegex = /\[\[SELECT:\s*(.*?)\]\]/i;
            const textareaRegex = /\[\[TEXTAREA:\s*(.*?)\]\]/i;
            const formRegex = /\[\[FORM:\s*(.*?)\]\]/i;
            const dateRegex = /\[\[DATE:\s*(.*?)\]\]/i;
            const numberRegex = /\[\[NUMBER:\s*(.*?)\]\]/i;
            const uploadRegexGlobal = /\[\[UPLOAD:\s*([^|\]]+)\|?(.*?)\]\]/gi;

            const applyInput = (match: RegExpMatchArray | null, type: 'input' | 'textarea' | 'select' | 'form' | 'date' | 'number') => {
                if (!match) return;
                cleanContent = cleanContent.replace(match[0], '').trim();
                switch (type) {
                    case 'input': {
                        const label = match[1];
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.placeholder = label;
                        input.className = 'border p-2 rounded w-full';
                        interactiveWrapper.appendChild(input);
                        appendInteractiveSendButton(interactiveWrapper, () => `${label}: ${input.value}`);
                        break;
                    }
                    case 'textarea': {
                        const label = match[1];
                        const textarea = document.createElement('textarea');
                        textarea.rows = 4;
                        textarea.placeholder = label;
                        textarea.className = 'border p-2 rounded w-full';
                        interactiveWrapper.appendChild(textarea);
                        appendInteractiveSendButton(interactiveWrapper, () => `${label}: ${textarea.value}`);
                        break;
                    }
                    case 'select': {
                        const parts = match[1].split(/\||,/).map((p) => p.trim()).filter(Boolean);
                        const label = parts.shift() || 'Selecione';
                        const select = document.createElement('select');
                        select.className = 'border p-2 rounded w-full';
                        parts.forEach((opt) => {
                            const option = document.createElement('option');
                            option.value = opt;
                            option.textContent = opt;
                            select.appendChild(option);
                        });
                        interactiveWrapper.appendChild(select);
                        appendInteractiveSendButton(interactiveWrapper, () => `${label}: ${select.value}`);
                        break;
                    }
                    case 'form': {
                        const fields = match[1].split(/[,|]/).map((f) => f.trim()).filter(Boolean);
                        const inputs: { label: string; element: HTMLInputElement }[] = [];
                        fields.forEach((field) => {
                            const input = document.createElement('input');
                            input.type = 'text';
                            input.placeholder = field;
                            input.className = 'border p-2 rounded w-full';
                            interactiveWrapper.appendChild(input);
                            inputs.push({ label: field, element: input });
                        });
                        appendInteractiveSendButton(interactiveWrapper, () => inputs.map(({ label, element }) => `${label}: ${element.value}`).join('\n'));
                        break;
                    }
                    case 'date': {
                        const label = match[1];
                        const input = document.createElement('input');
                        input.type = 'date';
                        input.className = 'border p-2 rounded w-full';
                        interactiveWrapper.appendChild(input);
                        appendInteractiveSendButton(interactiveWrapper, () => `${label}: ${input.value}`);
                        break;
                    }
                    case 'number': {
                        const label = match[1];
                        const input = document.createElement('input');
                        input.type = 'number';
                        input.placeholder = label;
                        input.className = 'border p-2 rounded w-full';
                        interactiveWrapper.appendChild(input);
                        appendInteractiveSendButton(interactiveWrapper, () => `${label}: ${input.value}`);
                        break;
                    }
                }
            };

            applyInput(cleanContent.match(inputRegex), 'input');
            applyInput(cleanContent.match(textareaRegex), 'textarea');
            applyInput(cleanContent.match(selectRegex), 'select');
            applyInput(cleanContent.match(formRegex), 'form');
            applyInput(cleanContent.match(dateRegex), 'date');
            applyInput(cleanContent.match(numberRegex), 'number');

            let uploadMatch: RegExpExecArray | null;
            const docLabels: string[] = [];
            pendingUploads = 0;
            const uploadElements: HTMLElement[] = [];

            while ((uploadMatch = uploadRegexGlobal.exec(cleanContent)) !== null) {
                const label = uploadMatch[1].trim();
                const accept = (uploadMatch[2] || '').replace('accept=', '').trim();
                const row = document.createElement('div');
                row.className = 'flex flex-wrap items-center gap-2 mt-2 p-2 border rounded-md bg-gray-50';

                const lbl = document.createElement('span');
                lbl.className = 'text-sm font-medium flex-1';
                lbl.textContent = label;

                const chooseBtn = document.createElement('button');
                chooseBtn.type = 'button';
                chooseBtn.textContent = 'Selecionar arquivo';
                chooseBtn.className = 'bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm';

                const noDocBtn = document.createElement('button');
                noDocBtn.type = 'button';
                noDocBtn.textContent = 'Não possuo';
                noDocBtn.className = 'bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm';

                const fileName = document.createElement('span');
                fileName.className = 'text-xs text-gray-600 italic';
                fileName.textContent = 'Nenhum arquivo';

                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = accept;
                fileInput.className = 'hidden';

                chooseBtn.addEventListener('click', () => fileInput.click());
                fileInput.addEventListener('change', () => {
                    if (fileInput.files && fileInput.files.length > 0) {
                        const file = fileInput.files[0];
                        fileName.textContent = file.name;
                        handleFileUpload(file);
                        chooseBtn.disabled = true;
                        noDocBtn.disabled = true;
                        row.classList.add('opacity-60');
                        handleUploadResolved();
                    }
                });

                noDocBtn.addEventListener('click', () => {
                    chooseBtn.disabled = true;
                    noDocBtn.disabled = true;
                    row.classList.add('opacity-60');
                    fileName.textContent = 'Marcado como Não Possuo';
                    handleUploadResolved();
                });

                row.append(lbl, chooseBtn, noDocBtn, fileName, fileInput);
                interactiveWrapper.appendChild(row);
                uploadElements.push(row);
                docLabels.push(label);
            }

            if (uploadElements.length > 0) {
                pendingUploads = uploadElements.length;
                fileUploadLabel.classList.remove('hidden');
                cleanContent = cleanContent.replace(uploadRegexGlobal, '').trim();
                if (docLabels.length > 0) {
                    cleanContent += `\n\n**Documentos solicitados:**\n${docLabels.map((doc) => `- ${doc}`).join('\n')}`;
                }
            }

            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${role} max-w-full`;
            messageDiv.innerHTML = isHtml ? cleanContent : marked.parse(cleanContent);
            messageContainer.appendChild(messageDiv);

            if (role === 'assistant' && quickOptions.length > 0) {
                const btnWrapper = document.createElement('div');
                btnWrapper.className = 'flex flex-wrap gap-2 mb-4';
                quickOptions.forEach((opt) => btnWrapper.appendChild(createQuickOptionButton(opt)));
                messageContainer.appendChild(btnWrapper);
            }

            if (interactiveWrapper.childElementCount > 0) {
                messageContainer.appendChild(interactiveWrapper);
                userInput.disabled = true;
            } else {
                userInput.disabled = chatFinished;
            }

            if (role === 'assistant' && content.includes('utilize o botão de anexo')) {
                fileUploadLabel.classList.remove('hidden');
                const lowerOpts = quickOptions.map((opt) => opt.toLowerCase());
                if (!lowerOpts.includes('não possuo') && !lowerOpts.includes('não possuo este documento')) {
                    const noDocBtn = document.createElement('button');
                    noDocBtn.type = 'button';
                    noDocBtn.textContent = 'Não possuo este documento';
                    noDocBtn.className = 'bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition mt-2 self-start text-sm';
                    noDocBtn.addEventListener('click', () => {
                        userInput.value = 'Não possuo este documento';
                        handleSendMessage();
                        fileUploadLabel.classList.add('hidden');
                    });
                    messageContainer.appendChild(noDocBtn);
                }
            }

            scrollToBottom();
        }
    };

    const renderInitialForm = () => {
        formContainer.innerHTML = `
            <form id="initial-info-form" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700">Nome Completo</label>
                        <input type="text" id="name" name="name" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-800 focus:border-blue-800" />
                    </div>
                    <div>
                        <label for="cpf" class="block text-sm font-medium text-gray-700">CPF</label>
                        <input type="text" id="cpf" name="cpf" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-800 focus:border-blue-800" />
                    </div>
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" name="email" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-800 focus:border-blue-800" />
                    </div>
                    <div>
                        <label for="phone" class="block text-sm font-medium text-gray-700">Telefone</label>
                        <input type="tel" id="phone" name="phone" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-800 focus:border-blue-800" />
                    </div>
                </div>
                <button type="submit" id="start-chat-btn" class="w-full bg-blue-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-900 transition-all flex items-center justify-center">
                    Iniciar Consulta
                </button>
            </form>
        `;
        const form = formContainer.querySelector('#initial-info-form') as HTMLFormElement | null;
        if (form) {
            form.addEventListener('submit', handleInitialFormSubmit);
        }
    };

    const handleInitialFormSubmit = async (event: Event) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        if (!currentReportId) {
            currentReportId = `CLIENT-${crypto.randomUUID()}`;
            localStorage.setItem('currentReportId', currentReportId);
            try {
                fetch('/api/relatorios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        reportId: currentReportId,
                        chatHistory: [],
                        systemPrompt: '__SKIP__'
                    })
                }).catch((error) => console.error('Falha criar caso:', error));
            } catch (error) {
                console.error('Falha na criação inicial do caso:', error);
            }
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const summary = Object.entries(data)
            .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
            .join('<br>');

        addMessage('user', `Iniciando atendimento com os seguintes dados:<br>${summary}`, true);
        messages.push({ role: 'system', content: `DADOS_CLIENTE|Nome:${data.name}|CPF:${data.cpf}|Email:${data.email}|Telefone:${data.phone}` });

        formContainer.classList.add('hidden');
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.placeholder = 'Digite sua mensagem...';
        userInput.classList.remove('bg-gray-100');
        userInput.focus();

        showButtonLoading(sendButton, true, '<i class="fas fa-paper-plane"></i>');
        showTypingIndicator();

        try {
            const provider = localStorage.getItem('provider') || 'openrouter';
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-provider': provider
                },
                body: JSON.stringify({
                    messages: messages.slice(-10),
                    prompt: CHAT_PROMPT
                })
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'Falha na comunicação com a IA.');
            }
            const dataResponse = await response.json();
            hideTypingIndicator();
            addMessage('assistant', dataResponse.choices[0].message.content);
            await sendLocalUpdate();
        } catch (error) {
            console.error('Erro no início do chat:', error);
            hideTypingIndicator();
            addMessage('assistant', 'Desculpe, ocorreu um erro de comunicação. Por favor, recarregue a página e tente novamente.');
        } finally {
            showButtonLoading(sendButton, false, '<i class="fas fa-paper-plane"></i>');
        }
    };

    const finalizeChat = async () => {
        userInput.disabled = true;
        sendButton.disabled = true;
        userInput.placeholder = 'Atendimento finalizado.';
        chatFinished = true;
        localStorage.setItem('chatFinished', '1');
        const provider = localStorage.getItem('provider') || 'openrouter';
        try {
            await fetch('/api/relatorios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-provider': provider
                },
                body: JSON.stringify({
                    reportId: currentReportId,
                    chatHistory: messages,
                    systemPrompt: ANALYTICAL_PROMPT
                })
            });
        } catch (error) {
            console.error('Falha ao solicitar relatório final:', error);
        }
        localStorage.removeItem('chatMessages');
        localStorage.removeItem('currentReportId');
        localStorage.removeItem('chatFinished');
        newChatBtn.classList.remove('hidden');
    };

    const handleSendMessage = async () => {
        const message = userInput.value.trim();
        if (!message || chatFinished) return;

        addMessage('user', message);
        userInput.value = '';
        userInput.style.height = 'auto';

        showButtonLoading(sendButton, true, '<i class="fas fa-paper-plane"></i>');
        showTypingIndicator();

        try {
            const provider = localStorage.getItem('provider') || 'openrouter';
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-provider': provider
                },
                body: JSON.stringify({
                    messages: messages.slice(-10),
                    prompt: CHAT_PROMPT
                })
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'Falha na comunicação com a IA.');
            }
            const dataResponse = await response.json();
            hideTypingIndicator();
            addMessage('assistant', dataResponse.choices[0].message.content);
            await sendLocalUpdate();
            if (dataResponse.choices[0].message.content.includes(END_CHAT_PHRASE)) {
                await finalizeChat();
            }
        } catch (error) {
            console.error('Erro:', error);
            hideTypingIndicator();
            addMessage('assistant', 'Desculpe, ocorreu um erro de comunicação. Você pode tentar reiniciar o chat.');
            newChatBtn.classList.remove('hidden');
        } finally {
            showButtonLoading(sendButton, false, '<i class="fas fa-paper-plane"></i>');
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!currentReportId) {
            currentReportId = `CLIENT-${crypto.randomUUID()}`;
            localStorage.setItem('currentReportId', currentReportId);
        }
        showButtonLoading(sendButton, true, '<i class="fas fa-paper-plane"></i>');
        showTypingIndicator();
        addMessage('user', `(Enviando o arquivo: ${file.name})`);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const provider = localStorage.getItem('provider') || 'openrouter';
            const response = await fetch(`/api/relatorios/${currentReportId}/attachments`, {
                method: 'POST',
                body: formData,
                headers: { 'x-provider': provider }
            });
            if (!response.ok) throw new Error('Falha no upload do arquivo.');
            const result = await response.json();
            const feedback = `(O usuário enviou o arquivo ${result.fileName}. O conteúdo inicial é: "${result.snippet}". Confirme o recebimento e continue a entrevista.)`;
            addMessage('system', feedback);
            const history = messages.filter((m) => m.role !== 'system');
            const aiResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-provider': provider },
                body: JSON.stringify({ messages: [...history, { role: 'user', content: feedback }], prompt: CHAT_PROMPT })
            });
            if (!aiResponse.ok) throw new Error('Falha na comunicação com a IA após upload.');
            const dataResponse = await aiResponse.json();
            hideTypingIndicator();
            addMessage('assistant', dataResponse.choices[0].message.content);
        } catch (error) {
            console.error('Erro:', error);
            hideTypingIndicator();
            addMessage('assistant', 'Desculpe, ocorreu um erro ao processar o arquivo. Por favor, tente novamente.');
        } finally {
            showButtonLoading(sendButton, false, '<i class="fas fa-paper-plane"></i>');
            fileUploadInput.value = '';
            fileUploadLabel.classList.add('hidden');
        }
    };

    const resetChat = () => {
        chatFinished = false;
        messages = [];
        currentReportId = null;
        pendingUploads = 0;
        messageContainer.innerHTML = '';
        formContainer.innerHTML = '';
        formContainer.classList.remove('hidden');
        userInput.value = '';
        userInput.disabled = true;
        sendButton.disabled = true;
        userInput.placeholder = 'Preencha o formulário acima para iniciar a conversa.';
        fileUploadLabel.classList.add('hidden');
        restartButton.classList.add('hidden');
        newChatBtn.classList.add('hidden');
        localStorage.removeItem('chatMessages');
        localStorage.removeItem('currentReportId');
        localStorage.removeItem('chatFinished');
        renderInitialForm();
    };

    const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
        if (!chatFinished && messages.length > 0) {
            event.preventDefault();
            event.returnValue = '';
        }
    };

    const keydownHandler = (event: KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    sendButton.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keydown', keydownHandler);
    const handleFileInputChange = () => {
        if (fileUploadInput.files && fileUploadInput.files.length > 0) {
            handleFileUpload(fileUploadInput.files[0]);
        }
    };
    const handleRestartClick = () => {
        newChatBtn.click();
    };
    const handleNewChatClick = () => {
        resetChat();
    };

    fileUploadInput.addEventListener('change', handleFileInputChange);
    restartButton.addEventListener('click', handleRestartClick);
    newChatBtn.addEventListener('click', handleNewChatClick);
    window.addEventListener('beforeunload', beforeUnloadHandler);

    resetChat();

    return () => {
        sendButton.removeEventListener('click', handleSendMessage);
        userInput.removeEventListener('keydown', keydownHandler);
        fileUploadInput.removeEventListener('change', handleFileInputChange);
        restartButton.removeEventListener('click', handleRestartClick);
        newChatBtn.removeEventListener('click', handleNewChatClick);
        window.removeEventListener('beforeunload', beforeUnloadHandler);
    };
};

const VirtualSecretaryChat: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen || !containerRef.current) return;
        let cleanup: CleanupFn | undefined;
        try {
            cleanup = initializeVirtualSecretaryChat(containerRef.current);
        } catch (error) {
            console.error(error);
        }
        return () => {
            if (cleanup) cleanup();
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
            <div className="relative z-10 w-full max-w-4xl mx-4">
                <div ref={containerRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                    <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Consulta Virtual Preliminar</h3>
                        <div className="flex items-center gap-3">
                            <button id="new-chat-btn" className="hidden bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-sm">Novo Atendimento</button>
                            <button onClick={onClose} className="text-xl leading-none hover:text-red-300">&times;</button>
                        </div>
                    </div>
                    <div className="flex flex-col h-[70vh]">
                        <div id="message-container" className="flex-1 p-6 overflow-y-auto flex flex-col gap-3 bg-gray-50"></div>
                        <div id="form-container" className="p-6 border-t border-gray-200 bg-white"></div>
                        <div id="chat-footer" className="p-4 border-t border-gray-200 bg-white">
                            <div className="flex items-center gap-2">
                                <textarea
                                    id="user-input"
                                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-gray-100"
                                    placeholder="Preencha o formulário acima para iniciar a conversa."
                                    rows={1}
                                    disabled
                                ></textarea>
                                <label htmlFor="file-upload-input" id="file-upload-label" className="cursor-pointer text-gray-500 hover:text-blue-800 p-3 hidden">
                                    <i className="fas fa-paperclip text-xl"></i>
                                </label>
                                <input type="file" id="file-upload-input" className="hidden" accept=".pdf,.txt,.doc,.docx" />
                                <button id="restart-button" className="bg-red-600 text-white rounded-lg p-3 hover:bg-red-700 transition hidden" title="Reiniciar Chat">
                                    <i className="fas fa-rotate-right"></i>
                                </button>
                                <button id="send-button" className="bg-blue-800 text-white rounded-lg p-3 hover:bg-blue-900 transition flex items-center justify-center w-12 h-12" disabled>
                                    <i className="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VirtualSecretaryChat;
