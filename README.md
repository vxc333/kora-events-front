# Kora Events — Frontend

Interface web do **Kora Events**, plataforma de gerenciamento de eventos. SPA construída com **React 19** + **TypeScript** + **Vite**, com suporte a PWA para check-in offline.

---

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [docs/01-getting-started.md](docs/01-getting-started.md) | Setup local, variáveis de ambiente, comandos |
| [docs/02-architecture.md](docs/02-architecture.md) | Stack, estrutura de pastas, roteamento, fluxo de dados |
| [docs/03-pages.md](docs/03-pages.md) | Todas as páginas e suas rotas |
| [docs/04-components.md](docs/04-components.md) | Catálogo de componentes |
| [docs/05-hooks-and-services.md](docs/05-hooks-and-services.md) | Hooks React Query e camada de serviços (API) |
| [docs/06-types.md](docs/06-types.md) | Referência de tipos TypeScript |
| [docs/07-conventions.md](docs/07-conventions.md) | Padrões de código, testes e design system |

---

## Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# edite VITE_API_URL se necessário

# 3. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173`.

> O backend precisa estar rodando em `http://localhost:3333`.

---

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build de produção (`tsc` + Vite) |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Linting com ESLint |
| `npm run test` | Testes com Vitest (modo watch) |
| `npm run test:run` | Testes em modo CI (sem watch) |
