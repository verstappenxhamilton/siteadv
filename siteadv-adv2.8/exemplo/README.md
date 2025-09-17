# Advocacia Futura IA

Landing page SPA para escritório de advocacia imobiliária com assistente virtual de IA e painel de relatórios.

## Funcionalidades
- **Assistente Virtual IA**: Chat automatizado para pré-consulta, coleta de dados e geração de relatório.
- **Painel de Relatórios**: Visualização de todos os atendimentos realizados, com histórico e resumo.
- **Design Moderno**: Layout responsivo, visual limpo e profissional.
- **Integração com Firebase**: Armazenamento dos relatórios e autenticação anônima.
- **Pronto para automações (n8n)**: Estrutura de dados organizada para futuras integrações.

## Tecnologias Utilizadas
- HTML5, Tailwind CSS, Font Awesome, Google Fonts (Inter)
- JavaScript ES6+ (inline, módulos via `<script type="module">`)
- Firebase (Firestore e Auth)
- Google Gemini API (modelo gemini-2.0-flash)

## Como rodar o projeto
1. **Clone ou baixe este repositório.**
2. **Abra o arquivo `index.html` em seu navegador.**

## Configuração das Credenciais

### 1. Firebase
- Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
- Ative o Firestore Database e a autenticação anônima.
- No painel do Firebase, acesse "Configurações do Projeto" > "Suas apps" > "Configuração do Firebase SDK".
- Copie o objeto de configuração e substitua no arquivo `index.html`:

```js
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};
```

- Substitua também `SEU_APP_ID` nos caminhos do Firestore pelo valor do seu `appId`.

### 2. Google Gemini API
- Gere uma API KEY para o modelo Gemini em [Google AI Studio](https://aistudio.google.com/app/apikey).
- No arquivo `index.html`, substitua:

```js
const GEMINI_API_KEY = "SUA_GEMINI_API_KEY";
```

## Observações
- O projeto é totalmente client-side, não requer backend próprio.
- O painel de relatórios é apenas para demonstração, sem autenticação de administrador.
- Para produção, recomenda-se proteger o acesso ao painel e às credenciais.

## Estrutura dos Dados (Firestore)
Coleção: `artifacts/{appId}/public/data/clientReports`

Exemplo de documento:
```json
{
  "reportId": "string",
  "userId": "string",
  "clientName": "string",
  "timestamp": "Firebase.Timestamp",
  "summary": "string",
  "conversation": [
    { "role": "model", "parts": [{ "text": "Mensagem da IA" }] },
    { "role": "user", "parts": [{ "text": "Mensagem do utilizador" }] }
  ],
  "status": "string"
}
```

## Personalização
- Edite textos, ícones e imagens diretamente no `index.html`.
- Para adicionar novos serviços, basta duplicar os cards na seção "Nossos Serviços".

## Suporte
Dúvidas ou sugestões? Abra uma issue ou entre em contato!

## Como rodar o backend local (Node.js + SQLite)

1. Certifique-se de ter o Node.js instalado ([baixar aqui](https://nodejs.org/)).
2. No terminal, navegue até a pasta do projeto e execute:

   ```bash
   npm install
   npm start
   ```

3. O backend estará rodando em http://localhost:3001

4. O frontend (index.html) pode ser adaptado para consumir a API local em `/api/relatorios`. 