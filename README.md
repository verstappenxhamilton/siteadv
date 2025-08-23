# Sistema de triagem jurídica

Aplicação em Next.js que conduz triagem jurídica em blocos com suporte a múltiplos provedores de IA.

## Requisitos

- Node.js 18
- Variáveis de ambiente com as chaves dos provedores (mantidas no servidor).

## Uso local

```bash
npm install
npm run dev
```

Abra <http://localhost:3000> e use `/chat` para o fluxo de triagem ou `/admin` para configurar o provedor, parâmetros e prompt.

## Deploy no Render

1. Faça push do repositório para o GitHub.
2. Crie um serviço *Web Service* no Render apontando para o repositório.
3. O Render utilizará o `Dockerfile` e o `render.yaml` incluídos.
4. Defina as variáveis de ambiente no painel do Render.

## Estrutura

- `app/chat/page.tsx`: interface do chat.
- `app/admin/page.tsx`: painel administrativo.
- `app/api/*`: rotas server-side.
- `lib/adapters`: adaptadores para provedores de IA.
- `lib/schema.ts`: validação com Zod.
- `components/*`: componentes reutilizáveis.
