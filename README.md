# SiteAdv

Plataforma de triagem jurídica com chat e painel administrativo.

## Requisitos

- Node.js 20
- Variáveis de ambiente para as chaves dos provedores

## Desenvolvimento local

```bash
npm install
npm run dev
```

A aplicação será servida em `http://localhost:3000`.

## Deploy no Render

1. Faça push deste repositório para o Git.
2. Crie um novo serviço no Render com `render.yaml`.
3. As chaves de API devem ser definidas como variáveis de ambiente no painel do Render.

## Estrutura

```
app/              Páginas do Next.js
  api/            Rotas de API
  chat/           Interface do chat
  admin/          Painel administrativo
components/       Componentes de UI
lib/              Configuração e adaptadores
```

## Prompt padrão

Você é uma secretária jurídica especialista em triagem.
Conduza a conversa em blocos curtos, usando select/radio/date/file quando necessário.
Seja objetivo, máximo 5 bullets por resposta.
Priorize 1) prazos, 2) fatos essenciais, 3) documentos faltantes.
Quando tudo estiver completo, pergunte se pode encerrar.
Se sim, entregue resumo factual (5 bullets curtos), checklist de pendências e JSON final com todos os campos coletados.
