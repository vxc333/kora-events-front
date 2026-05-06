# Getting Started

Guia completo para configurar e rodar o frontend do **Kora Events** localmente.

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 20.x |
| npm | 10.x |

---

## 1. Instalar dependências

```bash
cd frontend
npm install
```

---

## 2. Variáveis de ambiente

```bash
cp .env.example .env
```

### Referência do `.env`

| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_API_URL` | URL base da API backend | `http://localhost:3333/api/v1` |
| `VITE_GOOGLE_MAPS_API_KEY` | Chave da API Google Places (opcional) | `AIzaSy...` |

> Sem `VITE_GOOGLE_MAPS_API_KEY`, o campo de localização do evento cai para um input de texto simples (sem autocomplete).

---

## 3. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173`.

> O backend precisa estar rodando. Siga o `backend/README.md` para iniciá-lo.

---

## 4. Build de produção

```bash
npm run build
```

Os arquivos gerados ficam em `dist/`. Para testar localmente:

```bash
npm run preview
```

---

## Estrutura de pastas

```
frontend/
├── src/
│   ├── pages/              # Páginas e componentes de página
│   ├── components/         # Componentes reutilizáveis
│   │   └── ui/             # Primitivos de UI (Button, Input, Dialog...)
│   ├── design-system/      # Tokens de design (CSS variables)
│   ├── hooks/              # React Query hooks por domínio
│   ├── services/           # Funções de chamada de API (axios)
│   ├── types/              # Interfaces e tipos TypeScript
│   ├── lib/                # Utilitários (axios instance, cn, uuid)
│   ├── App.tsx             # Tabela de rotas
│   └── main.tsx            # Bootstrap da aplicação
├── public/                 # Assets estáticos
├── vite.config.ts          # Configuração Vite + PWA
├── components.json         # Configuração shadcn/ui
├── .env.example            # Modelo de variáveis de ambiente
└── tsconfig.app.json       # Configuração TypeScript
```

---

## Comandos úteis

```bash
# Linting
npm run lint

# Testes unitários em modo watch
npm run test

# Testes em modo CI (uma única execução)
npm run test:run
```

---

## PWA / Modo offline

O app é configurado como **Progressive Web App** com suporte offline para a funcionalidade de check-in.

- A URL de start do PWA é `/checkin`.
- Chamadas para `/api/*` são cacheadas com estratégia `NetworkFirst`.
- O hook `useCheckinQueue` persiste check-ins pendentes no **IndexedDB** quando offline e os sincroniza quando a rede volta.

Para instalar como PWA, acesse a URL em Chrome/Edge e clique em "Instalar aplicativo".
