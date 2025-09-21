# Pavan & Associados – Landing Page

Aplicação em React com backend Express que fornece o chat inteligente, painel do advogado e demais integrações necessárias para o escritório.

## Desenvolvimento local

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor integrado (API + Vite):
   ```bash
   npm run dev
   ```
   Esse comando sobe o Express na porta `5173`, injeta o Vite em modo middleware e expõe todos os endpoints `/api/*` e `/admin/*`.
3. Acesse http://localhost:5173 para testar o site.
4. As configurações salvas pelo painel do advogado (configuração da IA e API Keys) ficam persistidas em arquivos dentro de `server-data/`.

## Build de produção

1. Gere o bundle:
   ```bash
   npm run build
   ```
2. Rode o servidor em modo preview (utiliza o bundle gerado):
   ```bash
   npm run preview
   ```
3. Para executar em produção após o build, use:
   ```bash
   npm run start
   ```

## Variáveis de ambiente

O backend lê as seguintes variáveis de ambiente, se definidas:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GROQ_API_KEY`
- `GEMINI_API_KEY`
- `SSL_KEY` e `SSL_CERT` para rodar com HTTPS localmente

Você também pode inserir as chaves diretamente no painel do advogado; elas são persistidas em `server-data/api-keys.json`.
