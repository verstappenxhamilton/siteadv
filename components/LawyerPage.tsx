import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

type CleanupFn = () => void;

const initializeLawyerAdmin = (root: HTMLElement): CleanupFn => {
    const toastContainer = root.querySelector('#toast-container') as HTMLElement | null;
    const welcomeScreen = root.querySelector('#welcome-screen') as HTMLElement | null;
    const chatView = root.querySelector('#chat-view') as HTMLElement | null;
    const reportView = root.querySelector('#report-view') as HTMLElement | null;
    const caseList = root.querySelector('#case-list') as HTMLElement | null;
    const messageContainer = root.querySelector('#message-container') as HTMLElement | null;
    const userInput = root.querySelector('#user-input') as HTMLTextAreaElement | null;
    const sendButton = root.querySelector('#send-button') as HTMLButtonElement | null;
    const fileUploadLabel = root.querySelector('#file-upload-label') as HTMLLabelElement | null;
    const fileUploadInput = root.querySelector('#file-upload-input') as HTMLInputElement | null;
    const endChatBtn = root.querySelector('#end-chat-btn') as HTMLButtonElement | null;
    const reportIdDisplay = root.querySelector('#report-id-display') as HTMLElement | null;
    const reportContentDiv = root.querySelector('#report-content') as HTMLElement | null;
    const attachmentsList = root.querySelector('#attachments-list') as HTMLElement | null;
    const chatHistoryDiv = root.querySelector('#chat-history-content') as HTMLElement | null;
    const pieceContent = root.querySelector('#piece-content') as HTMLElement | null;
    const generatePieceBtn = root.querySelector('#generate-piece-btn') as HTMLButtonElement | null;
    const exportPdfBtn = root.querySelector('#export-pdf-btn') as HTMLButtonElement | null;
    const exportDocxBtn = root.querySelector('#export-docx-btn') as HTMLButtonElement | null;
    const pieceSection = root.querySelector('#piece-section') as HTMLDetailsElement | null;
    const openSettingsBtn = root.querySelector('#open-settings-btn') as HTMLButtonElement | null;
    const settingsModal = root.querySelector('#settings-modal') as HTMLElement | null;
    const closeSettingsBtn = root.querySelector('#close-settings-btn') as HTMLButtonElement | null;
    const providerSelect = root.querySelector('#provider-select') as HTMLSelectElement | null;
    const apikeyInput = root.querySelector('#apikey-input') as HTMLInputElement | null;
    const saveApikeyBtn = root.querySelector('#save-apikey-btn') as HTMLButtonElement | null;
    const testPrompt = root.querySelector('#test-prompt') as HTMLTextAreaElement | null;
    const testResponse = root.querySelector('#test-response') as HTMLPreElement | null;
    const testIaBtn = root.querySelector('#test-ia-btn') as HTMLButtonElement | null;
    const promptPiece = root.querySelector('#prompt-piece') as HTMLTextAreaElement | null;
    const savePromptsBtn = root.querySelector('#save-prompts-btn') as HTMLButtonElement | null;
    const newCaseBtn = root.querySelector('#new-case-btn') as HTMLButtonElement | null;

    if (!toastContainer || !welcomeScreen || !chatView || !reportView || !caseList || !messageContainer || !userInput || !sendButton || !fileUploadLabel || !fileUploadInput || !endChatBtn || !reportIdDisplay || !reportContentDiv || !attachmentsList || !chatHistoryDiv || !pieceContent || !generatePieceBtn || !exportPdfBtn || !exportDocxBtn || !pieceSection || !openSettingsBtn || !settingsModal || !closeSettingsBtn || !providerSelect || !apikeyInput || !saveApikeyBtn || !testPrompt || !testResponse || !testIaBtn || !promptPiece || !savePromptsBtn || !newCaseBtn) {
        throw new Error('Estrutura do painel de advogado incompleta.');
    }

    let messages: ChatMessage[] = [];
    let currentReportId: string | null = null;
    let activeCaseId: string | null = null;
    let refreshTimer: number | null = null;

    const prompts = {
        chatAnalista: `Você é um "Analista Jurídico Virtual". Objetivo: coletar informações para ação.
1) Perguntas breves (máx. 15 palavras), uma por vez.
2) Sempre que puder, ofereça até 4 botões [[OPCOES: ...]] incluindo "Outro".
3) Solicite documentos somente quando necessários e use a frase exata: "Entendido. Por favor, utilize o botão de anexo para me enviar este documento.".
4) Quando tudo estiver claro, finalize com: "Agradeço pelas informações. A coleta de dados está concluída. Nosso sistema agora vai compilar o relatório para análise da equipe."`,
        relatorioAnalitico: `Você é um "Advogado Especialista em Análise de Casos". Sua tarefa é receber um histórico de chat e transformá-lo em um "Relatório de Análise Preliminar" estruturado e detalhado. O relatório deve ser em formato Markdown e seguir RIGOROSAMENTE a estrutura abaixo. Extraia as informações do chat e preencha cada seção apropriadamente. Se uma informação não foi fornecida, indique "Não informado".

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
(Sugira os próximos passos práticos, como "Agendar reunião", "Solicitar documentação complementar", etc.)`
    };

    const showView = (view: 'welcome-screen' | 'chat-view' | 'report-view') => {
        welcomeScreen.classList.add('hidden');
        chatView.classList.add('hidden');
        reportView.classList.add('hidden');
        const target = root.querySelector(`#${view}`) as HTMLElement | null;
        if (target) {
            target.classList.remove('hidden');
        }
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
        toast.className = `toast ${bgColor} text-white font-bold py-2 px-4 rounded-lg shadow-lg`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    };

    const showButtonLoading = (button: HTMLButtonElement, show: boolean) => {
        const icon = button.querySelector('i');
        if (show) {
            button.disabled = true;
            if (icon) {
                icon.dataset.originalClass = icon.className;
            }
            button.dataset.originalText = button.textContent || '';
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else {
            button.disabled = false;
            if (icon && icon.dataset.originalClass) {
                button.innerHTML = `<i class="${icon.dataset.originalClass}"></i> ${button.dataset.originalText || ''}`.trim();
            } else if (button.dataset.originalText) {
                button.textContent = button.dataset.originalText;
            }
        }
    };

    const beautifyReport = () => {
        const markdownRaw = reportContentDiv.querySelector('#markdown-raw');
        if (!markdownRaw) return;
        const nodes = Array.from(markdownRaw.childNodes);
        const newContainer = document.createElement('div');
        newContainer.className = 'grid gap-4';
        let currentCard: HTMLElement | null = null;
        let sectionIndex = 0;
        const icons: Record<number, string> = { 1: '👤', 2: '⚖️', 3: '📝', 4: '💡', 5: '📄', 6: '🚀' };

        nodes.forEach((node) => {
            if ((node as HTMLElement).tagName === 'H2' || (node as HTMLElement).tagName === 'H3') {
                sectionIndex += 1;
                const details = document.createElement('details');
                details.className = 'border rounded-lg shadow-sm';
                details.open = true;
                const summary = document.createElement('summary');
                summary.className = 'px-4 py-3 bg-gray-100 hover:bg-gray-200 cursor-pointer font-semibold flex items-center gap-2';
                summary.innerHTML = `<span>${icons[sectionIndex] || '📌'}</span><span>${(node as HTMLElement).textContent}</span>`;
                const contentWrap = document.createElement('div');
                contentWrap.className = 'px-4 py-3 space-y-2';
                details.append(summary, contentWrap);
                newContainer.appendChild(details);
                currentCard = contentWrap;
            } else if (currentCard) {
                currentCard.appendChild(node);
            }
        });
        markdownRaw.replaceWith(newContainer);
    };

    const addMessage = (role: 'user' | 'assistant' | 'system', content: string) => {
        if (role !== 'system') {
            messages.push({ role, content });
            const optionRegex = /\[\[OPCOES:(.*?)\]\]/i;
            const optionMatch = (content || '').match(optionRegex);
            let cleanContent = content || '';
            const quickOptions = optionMatch ? optionMatch[1].split(/\||,/).map((opt) => opt.trim()).filter(Boolean) : [];
            if (optionMatch) {
                cleanContent = cleanContent.replace(optionMatch[0], '').trim();
            }

            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${role}`;
            messageDiv.innerHTML = marked.parse(cleanContent);
            messageContainer.appendChild(messageDiv);

            if (role === 'assistant' && quickOptions.length > 0) {
                const btnWrapper = document.createElement('div');
                btnWrapper.className = 'flex flex-wrap gap-2 mb-4';
                quickOptions.forEach((opt) => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.textContent = opt;
                    btn.className = 'bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full hover:bg-indigo-200 transition';
                    btn.addEventListener('click', () => {
                        const normalized = opt.toLowerCase();
                        if (normalized.startsWith('outro')) {
                            userInput.focus();
                        } else {
                            userInput.value = opt;
                            void handleSendMessage();
                        }
                    });
                    btnWrapper.appendChild(btn);
                });
                messageContainer.appendChild(btnWrapper);
            }
        }

        if (role === 'assistant' && content.includes('utilize o botão de anexo')) {
            fileUploadLabel.classList.remove('hidden');
        }

        messageContainer.scrollTop = messageContainer.scrollHeight;
    };

    const startNewChat = () => {
        messages = [];
        currentReportId = `DRAFT-${crypto.randomUUID()}`;
        activeCaseId = null;
        messageContainer.innerHTML = '';
        showView('chat-view');
        const welcomeMessage = 'Olá! Sou seu analista jurídico virtual. Para começarmos, por favor, informe seu nome completo e CPF/CNPJ.';
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'message assistant';
        welcomeDiv.innerHTML = marked.parse(welcomeMessage);
        messageContainer.appendChild(welcomeDiv);
        messageContainer.scrollTop = messageContainer.scrollHeight;
        userInput.value = '';
        fileUploadLabel.classList.add('hidden');
        fetchAndRenderCases();
    };

    const fetchAndRenderCases = async () => {
        try {
            const response = await fetch('/api/relatorios');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Falha ao buscar relatórios: ${errorText}`);
            }
            const reports = await response.json();
            caseList.innerHTML = '';
            if (!Array.isArray(reports) || reports.length === 0) {
                caseList.innerHTML = '<p class="text-center text-gray-500 p-4">Nenhum caso encontrado.</p>';
                return;
            }
            reports.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            reports.forEach((report: any) => {
                const item = document.createElement('a');
                item.href = '#';
                const isActive = report.reportId === activeCaseId;
                item.className = `case-item block p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${isActive ? 'bg-indigo-50 border-r-4 border-indigo-500 font-semibold' : ''}`;
                item.dataset.id = report.reportId;
                const isClientChat = typeof report.reportId === 'string' && report.reportId.startsWith('CLIENT-');
                let title = 'Caso sem título';
                if (isClientChat) {
                    const nameMatch = (report.summary || '').match(/Nome:\s*(.*)/);
                    title = nameMatch ? nameMatch[1].trim() : 'Novo Cliente';
                } else if (typeof report.reportId === 'string') {
                    title = report.reportId.replace('DRAFT-', 'Rascunho: ');
                }
                const status = report.status || (isClientChat ? 'Pendente' : 'Rascunho');
                const statusColor = status === 'Finalizado' ? 'bg-green-100 text-green-800' : status === 'Pendente' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800';
                item.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="font-semibold text-gray-800">${title.substring(0, 30)}...</div>
                            <div class="text-sm text-gray-500">${new Date(report.timestamp).toLocaleString()}</div>
                            <span class="mt-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}">${status}</span>
                        </div>
                        <button title="Excluir" class="delete-case text-red-600 hover:text-red-800" data-id="${report.reportId}"><i class="fas fa-trash"></i></button>
                    </div>`;
                caseList.appendChild(item);
            });
        } catch (error: any) {
            console.error('Erro ao renderizar casos:', error);
            showToast(error.message || 'Falha ao carregar casos.', 'error');
        }
    };

    const populateReportView = (report: any, reportId: string) => {
        reportIdDisplay.textContent = `${reportId.substring(0, 15)}...`;
        const safeSummary = report.summary || 'Sem resumo disponível.';
        reportContentDiv.innerHTML = `<div id="markdown-raw" class="prose max-w-none">${marked.parse(safeSummary)}</div>`;
        beautifyReport();

        if (report.legalPiece) {
            pieceContent.innerHTML = marked.parse(report.legalPiece || '');
            exportPdfBtn.disabled = false;
            exportDocxBtn.disabled = false;
            pieceSection.open = true;
        } else {
            pieceContent.innerHTML = '<p class="text-gray-500">Nenhuma minuta cadastrada. Clique em "Gerar Minuta" abaixo.</p>';
            exportPdfBtn.disabled = true;
            exportDocxBtn.disabled = true;
            pieceSection.open = false;
        }

        attachmentsList.innerHTML = '';
        if (Array.isArray(report.attachments) && report.attachments.length > 0) {
            report.attachments.forEach((att: any) => {
                const link = document.createElement('a');
                link.href = att.url;
                link.target = '_blank';
                link.className = 'flex flex-col items-center text-indigo-600 hover:text-indigo-800 w-20';
                link.innerHTML = `<i class="fas fa-file-alt fa-2x"></i><span class="text-xs break-all mt-1">${(att.name || '').substring(0, 20)}...</span>`;
                attachmentsList.appendChild(link);
            });
        } else {
            attachmentsList.innerHTML = '<li class="text-gray-500 list-none">Nenhum documento anexado.</li>';
        }

        chatHistoryDiv.innerHTML = '';
        let history: ChatMessage[] = [];
        try {
            history = JSON.parse(report.chatHistory || '[]');
        } catch (err) {
            console.error('Erro ao parsear chatHistory', err);
        }
        if (Array.isArray(history) && history.length > 0) {
            history.forEach((msg) => {
                const div = document.createElement('div');
                const roleLabel = msg.role === 'user' ? 'Cliente' : 'IA';
                const roleClass = msg.role === 'user' ? 'text-blue-700' : 'text-gray-700';
                div.innerHTML = `<strong class="${roleClass}">${roleLabel}:</strong> ${msg.content}`;
                chatHistoryDiv.appendChild(div);
            });
        } else {
            chatHistoryDiv.innerHTML = '<p class="text-gray-500">Nenhum histórico disponível.</p>';
        }
    };

    const selectCase = async (reportId: string | null) => {
        if (!reportId) return;
        activeCaseId = reportId;
        currentReportId = reportId;
        await fetchAndRenderCases();
        try {
            const response = await fetch(`/api/relatorios/${reportId}`);
            if (!response.ok) throw new Error('Falha ao carregar detalhes do caso.');
            const report = await response.json();
            populateReportView(report, reportId);
            showView('report-view');
        } catch (error: any) {
            console.error('Erro:', error);
            showToast(error.message || 'Não foi possível carregar o caso.', 'error');
        }
    };

    const finalizeChatAndGenerateReport = async () => {
        if (!currentReportId) return;
        showToast('Coleta de dados finalizada. Gerando relatório...', 'success');
        try {
            const response = await fetch('/api/relatorios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-provider': localStorage.getItem('provider') || 'openrouter'
                },
                body: JSON.stringify({
                    reportId: currentReportId,
                    chatHistory: messages,
                    systemPrompt: prompts.relatorioAnalitico
                })
            });
            if (!response.ok) throw new Error('Falha ao criar relatório no backend.');
            showToast('Relatório gerado com sucesso!', 'success');
            await fetchAndRenderCases();
            await selectCase(currentReportId);
        } catch (error: any) {
            console.error('Erro ao gerar relatório:', error);
            showToast(error.message || 'Erro ao gerar relatório.', 'error');
        }
    };

    const handleSendMessage = async () => {
        const message = userInput.value.trim();
        if (!message) return;
        addMessage('user', message);
        userInput.value = '';
        userInput.style.height = 'auto';
        showButtonLoading(sendButton, true);
        try {
            const provider = localStorage.getItem('provider') || 'openrouter';
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-provider': provider },
                body: JSON.stringify({ messages, prompt: prompts.chatAnalista })
            });
            if (!response.ok) throw new Error('Falha na comunicação com a IA.');
            const data = await response.json();
            const aiMessage = data.choices?.[0]?.message?.content || '';
            addMessage('assistant', aiMessage);
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
                await fetchAndRenderCases();
            } catch (err) {
                console.warn('Falha ao atualizar histórico parcial:', err);
            }
            if (aiMessage.includes('A coleta de dados está concluída.')) {
                await finalizeChatAndGenerateReport();
            }
        } catch (error: any) {
            console.error('Erro:', error);
            showToast(error.message || 'Erro ao enviar mensagem.', 'error');
        } finally {
            showButtonLoading(sendButton, false);
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!currentReportId) {
            currentReportId = `DRAFT-${crypto.randomUUID()}`;
        }
        addMessage('user', `(Enviando o arquivo: ${file.name})`);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch(`/api/relatorios/${currentReportId}/attachments`, { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Falha no upload do arquivo.');
            const result = await response.json();
            const snippet = (result.snippet || '').substring(0, 100);
            const feedback = `Documento "${result.fileName}" recebido. O sistema extraiu o seguinte trecho: "${snippet}...". Confirme o recebimento e continue a entrevista.`;
            addMessage('system', feedback);
            const provider = localStorage.getItem('provider') || 'openrouter';
            const aiResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-provider': provider },
                body: JSON.stringify({ messages, prompt: prompts.chatAnalista })
            });
            if (!aiResponse.ok) throw new Error('Falha na comunicação com a IA após upload.');
            const data = await aiResponse.json();
            addMessage('assistant', data.choices?.[0]?.message?.content || '');
        } catch (error: any) {
            console.error('Erro:', error);
            showToast(error.message || 'Erro ao processar arquivo.', 'error');
        } finally {
            fileUploadInput.value = '';
            fileUploadLabel.classList.add('hidden');
        }
    };

    const handleCaseListClick = async (event: Event) => {
        const target = event.target as HTMLElement;
        if (target.closest('.delete-case')) {
            event.preventDefault();
            const deleteBtn = target.closest('.delete-case') as HTMLElement;
            const delId = deleteBtn.dataset.id;
            if (delId && window.confirm('Deseja realmente excluir este caso?')) {
                try {
                    const resp = await fetch(`/api/relatorios/${delId}`, { method: 'DELETE' });
                    if (!resp.ok) throw new Error('Falha ao excluir.');
                    if (activeCaseId === delId) {
                        activeCaseId = null;
                        showView('welcome-screen');
                    }
                    await fetchAndRenderCases();
                    showToast('Caso excluído com sucesso.', 'success');
                } catch (error: any) {
                    showToast(error.message || 'Erro ao excluir caso.', 'error');
                }
            }
            return;
        }
        const caseItem = target.closest('.case-item') as HTMLElement | null;
        if (caseItem?.dataset.id) {
            event.preventDefault();
            await selectCase(caseItem.dataset.id);
        }
    };

    const handleReportActions = async (event: Event) => {
        const target = event.target as HTMLElement;
        const button = target.closest('button') as HTMLButtonElement | null;
        if (!activeCaseId || !button) return;
        if (button.id === 'generate-piece-btn') {
            if (!window.confirm('Isso irá acionar a IA para gerar uma minuta de petição, o que pode incorrer em custos. Deseja continuar?')) return;
            showButtonLoading(generatePieceBtn, true);
            try {
                const provider = localStorage.getItem('provider') || 'openrouter';
                const response = await fetch(`/api/relatorios/${activeCaseId}/gerar-peticao`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-provider': provider
                    }
                });
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'Falha ao gerar petição.');
                }
                await selectCase(activeCaseId);
                showToast('Petição gerada com sucesso!', 'success');
            } catch (error: any) {
                showToast(error.message || 'Erro ao gerar petição.', 'error');
            } finally {
                showButtonLoading(generatePieceBtn, false);
                generatePieceBtn.textContent = 'Gerar Minuta';
            }
        } else if (button.id === 'export-pdf-btn' || button.id === 'export-docx-btn') {
            const format = button.id === 'export-pdf-btn' ? 'pdf' : 'docx';
            const htmlContent = pieceContent.innerHTML;
            if (!htmlContent || htmlContent.includes('Nenhuma minuta')) {
                showToast('Não há conteúdo para exportar.', 'error');
                return;
            }
            showButtonLoading(button, true);
            try {
                const response = await fetch(`/api/relatorios/${activeCaseId}/export/${format}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ htmlContent: `<html><head><meta charset="UTF-8"></head><body>${htmlContent}</body></html>` })
                });
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || `Falha ao exportar para ${format}.`);
                }
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `minuta_${activeCaseId}.${format}`;
                link.click();
                window.URL.revokeObjectURL(url);
            } catch (error: any) {
                showToast(error.message || 'Erro na exportação.', 'error');
            } finally {
                showButtonLoading(button, false);
                button.innerHTML = `<i class="fas fa-file-${format === 'pdf' ? 'pdf' : 'word'} mr-1"></i> ${format.toUpperCase()}`;
            }
        }
    };

    const handleOpenSettings = async () => {
        settingsModal.classList.remove('hidden');
        const savedProvider = localStorage.getItem('provider') || 'openrouter';
        providerSelect.value = savedProvider;
        promptPiece.value = prompts.relatorioAnalitico;
        await handleProviderChange();
    };

    const handleCloseSettings = () => {
        settingsModal.classList.add('hidden');
    };

    const handleProviderChange = async () => {
        const selectedProvider = providerSelect.value;
        try {
            const resp = await fetch('/api/config/apikey');
            if (!resp.ok) throw new Error('Falha ao buscar chaves.');
            const data = await resp.json();
            apikeyInput.value = data.keys && data.keys[selectedProvider] ? data.keys[selectedProvider] : '';
        } catch (error: any) {
            showToast(error.message || 'Erro ao carregar chaves.', 'error');
            apikeyInput.value = '';
        }
    };

    const handleSaveApiKey = async () => {
        const key = apikeyInput.value.trim();
        const provider = providerSelect.value;
        if (!key) {
            showToast('Informe a chave.', 'error');
            return;
        }
        try {
            const resp = await fetch('/api/config/apikey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider, apiKey: key })
            });
            if (!resp.ok) throw new Error('Falha ao salvar a chave');
            localStorage.setItem('provider', provider);
            showToast('Chave salva com sucesso!', 'success');
        } catch (error: any) {
            showToast(error.message || 'Erro ao salvar chave.', 'error');
        }
    };

    const handleTestIA = async () => {
        const prompt = testPrompt.value.trim();
        if (!prompt) return;
        testResponse.textContent = 'Consultando IA...';
        try {
            const provider = localStorage.getItem('provider') || 'openrouter';
            const resp = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-provider': provider },
                body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], prompt: 'You are a helpful assistant' })
            });
            if (!resp.ok) throw new Error('Falha na IA');
            const data = await resp.json();
            testResponse.textContent = data.choices?.[0]?.message?.content || '';
        } catch (error: any) {
            testResponse.textContent = error.message || 'Erro ao consultar IA.';
        }
    };

    const handleSavePrompts = () => {
        prompts.relatorioAnalitico = promptPiece.value;
        showToast('Prompts atualizados.', 'success');
    };

    const handleUserInputKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void handleSendMessage();
        }
    };

    const handleEndChat = () => {
        if (window.confirm('Tem certeza que deseja finalizar o atendimento? O relatório será gerado com as informações atuais.')) {
            void finalizeChatAndGenerateReport();
        }
    };

    const handleFileInputChange = () => {
        if (fileUploadInput.files && fileUploadInput.files.length > 0) {
            void handleFileUpload(fileUploadInput.files[0]);
        }
    };

    caseList.addEventListener('click', handleCaseListClick);
    sendButton.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keydown', handleUserInputKeydown);
    endChatBtn.addEventListener('click', handleEndChat);
    fileUploadInput.addEventListener('change', handleFileInputChange);
    reportView.addEventListener('click', handleReportActions);
    openSettingsBtn.addEventListener('click', handleOpenSettings);
    closeSettingsBtn.addEventListener('click', handleCloseSettings);
    providerSelect.addEventListener('change', handleProviderChange);
    saveApikeyBtn.addEventListener('click', handleSaveApiKey);
    testIaBtn.addEventListener('click', handleTestIA);
    savePromptsBtn.addEventListener('click', handleSavePrompts);
    newCaseBtn.addEventListener('click', startNewChat);

    void (async () => {
        await fetchAndRenderCases();
        const firstCase = caseList.querySelector('.case-item') as HTMLElement | null;
        if (firstCase?.dataset.id) {
            await selectCase(firstCase.dataset.id);
        } else {
            showView('welcome-screen');
        }
    })();

    refreshTimer = window.setInterval(async () => {
        await fetchAndRenderCases();
        if (activeCaseId) {
            const currentEl = caseList.querySelector(`.case-item[data-id="${activeCaseId}"]`);
            if (currentEl) {
                await selectCase(activeCaseId);
            }
        }
    }, 15000);

    return () => {
        caseList.removeEventListener('click', handleCaseListClick);
        sendButton.removeEventListener('click', handleSendMessage);
        userInput.removeEventListener('keydown', handleUserInputKeydown);
        endChatBtn.removeEventListener('click', handleEndChat);
        fileUploadInput.removeEventListener('change', handleFileInputChange);
        reportView.removeEventListener('click', handleReportActions);
        openSettingsBtn.removeEventListener('click', handleOpenSettings);
        closeSettingsBtn.removeEventListener('click', handleCloseSettings);
        providerSelect.removeEventListener('change', handleProviderChange);
        saveApikeyBtn.removeEventListener('click', handleSaveApiKey);
        testIaBtn.removeEventListener('click', handleTestIA);
        savePromptsBtn.removeEventListener('click', handleSavePrompts);
        newCaseBtn.removeEventListener('click', startNewChat);
        if (refreshTimer) {
            clearInterval(refreshTimer);
        }
    };
};

const LawyerPage: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        let cleanup: CleanupFn | undefined;
        try {
            cleanup = initializeLawyerAdmin(containerRef.current);
        } catch (error) {
            console.error(error);
        }
        return () => {
            if (cleanup) cleanup();
        };
    }, []);

    return (
        <div ref={containerRef} className="bg-gray-50 text-gray-800 min-h-screen">
            <div id="toast-container" className="fixed top-5 right-5 z-50 space-y-2"></div>
            <div className="flex h-screen bg-white">
                <aside className="w-full md:w-1/3 max-w-sm border-r border-gray-200 flex flex-col">
                    <header className="p-4 border-b border-gray-200 flex-shrink-0 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Painel de Casos</h1>
                            <p className="text-sm text-gray-500">Seus atendimentos jurídicos.</p>
                        </div>
                        <div className="flex gap-4 items-center">
                            <a href="/" title="Página Inicial" className="text-gray-500 hover:text-blue-700">
                                <i className="fas fa-home fa-lg"></i>
                            </a>
                            <button id="open-settings-btn" title="Configurações" className="text-gray-500 hover:text-blue-700">
                                <i className="fas fa-cog fa-lg"></i>
                            </button>
                        </div>
                    </header>
                    <nav id="case-list" className="flex-grow overflow-y-auto"></nav>
                    <div className="p-4 border-t border-gray-200">
                        <button id="new-case-btn" className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition">
                            Iniciar Novo Caso
                        </button>
                    </div>
                </aside>
                <main id="main-content" className="flex-1 flex flex-col">
                    <div id="welcome-screen" className="h-full flex flex-col items-center justify-center text-center p-8">
                        <i className="fas fa-gavel fa-4x text-gray-300 mb-4"></i>
                        <h2 className="text-2xl font-semibold text-gray-700">Bem-vindo à Advocacia Inteligente</h2>
                        <p className="text-gray-500 mt-2">Selecione um caso na lista à esquerda ou inicie um novo atendimento.</p>
                    </div>
                    <div id="chat-view" className="hidden h-full flex flex-col">
                        <header className="p-4 border-b border-gray-200 flex-shrink-0 flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Chat do Caso</h3>
                            <button id="end-chat-btn" className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition">
                                Finalizar Atendimento
                            </button>
                        </header>
                        <div id="message-container" className="flex-1 p-6 overflow-y-auto flex flex-col"></div>
                        <footer className="p-4 border-t border-gray-200 bg-white">
                            <div className="flex items-center gap-2">
                                <textarea id="user-input" className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Digite sua mensagem..." rows={1}></textarea>
                                <label htmlFor="file-upload-input" id="file-upload-label" className="cursor-pointer text-gray-500 hover:text-indigo-600 p-3 hidden">
                                    <i className="fas fa-paperclip text-xl"></i>
                                </label>
                                <input type="file" id="file-upload-input" className="hidden" accept=".pdf,.txt,.doc,.docx" />
                                <button id="send-button" className="bg-indigo-600 text-white rounded-lg p-3 hover:bg-indigo-700 transition">
                                    <i className="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </footer>
                    </div>
                    <div id="report-view" className="hidden h-full flex flex-col">
                        <header className="p-4 border-b border-gray-200 flex-shrink-0">
                            <h3 className="text-lg font-semibold">Detalhes do Caso: <span id="report-id-display" className="font-mono text-indigo-600"></span></h3>
                        </header>
                        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 gap-6">
                            <div className="prose max-w-none p-4 border rounded-lg bg-gray-50/80 space-y-6">
                                <h4 className="text-xl font-bold">Relatório Analítico da IA</h4>
                                <div id="report-content"></div>
                                <h4 className="text-xl font-bold border-t pt-4">Documentos Anexados</h4>
                                <ul id="attachments-list" className="flex flex-wrap gap-4"></ul>
                                <h4 className="text-xl font-bold border-t pt-4">Histórico do Chat</h4>
                                <div id="chat-history-content" className="space-y-2 max-h-80 overflow-y-auto"></div>
                            </div>
                            <details id="piece-section" className="border rounded-lg">
                                <summary className="px-4 py-3 bg-gray-100 hover:bg-gray-200 flex justify-between items-center cursor-pointer select-none">
                                    <span className="text-xl font-bold">Minuta da Petição</span>
                                </summary>
                                <div className="p-4 space-y-4">
                                    <div id="piece-content" className="prose max-w-none whitespace-pre-wrap max-h-[70vh] overflow-y-auto"></div>
                                    <div id="action-buttons" className="flex flex-wrap items-center gap-2 not-prose">
                                        <button id="generate-piece-btn" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition">Gerar Minuta</button>
                                        <button id="export-pdf-btn" className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400" disabled>
                                            <i className="fas fa-file-pdf mr-1"></i> PDF
                                        </button>
                                        <button id="export-docx-btn" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400" disabled>
                                            <i className="fas fa-file-word mr-1"></i> Word
                                        </button>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>
                </main>
            </div>
            <div id="settings-modal" className="fixed inset-0 bg-black/50 hidden items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold">Configurações da IA</h2>
                        <button id="close-settings-btn" className="text-gray-500 hover:text-gray-700">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <label className="block text-sm font-medium text-gray-700">Selecione o Provedor</label>
                    <select id="provider-select" className="w-full border p-2 rounded mb-2">
                        <option value="openrouter">OpenRouter</option>
                        <option value="openai">OpenAI</option>
                        <option value="gemini">Gemini</option>
                        <option value="deepseek">DeepSeek</option>
                    </select>
                    <input type="text" id="apikey-input" className="w-full border p-2 rounded" placeholder="Cole a chave do provedor escolhido" />
                    <button id="save-apikey-btn" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Salvar Chave</button>
                    <hr />
                    <label className="block text-sm font-medium text-gray-700">Teste Rápido com a IA</label>
                    <textarea id="test-prompt" className="w-full border p-2 rounded" rows={3} placeholder="Digite algo para testar..."></textarea>
                    <button id="test-ia-btn" className="bg-green-600 text-white py-2 rounded hover:bg-green-700">Enviar e Testar</button>
                    <pre id="test-response" className="bg-gray-100 p-3 rounded overflow-y-auto max-h-64 text-sm"></pre>
                    <hr />
                    <label className="block text-sm font-medium text-gray-700 mt-2">Prompt da Petição (modelo de peça)</label>
                    <textarea id="prompt-piece" className="w-full border p-2 rounded" rows={4}></textarea>
                    <button id="save-prompts-btn" className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700 mt-2">Salvar Prompts</button>
                </div>
            </div>
        </div>
    );
};

export default LawyerPage;
