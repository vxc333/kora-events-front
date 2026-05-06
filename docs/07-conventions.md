# Convenções e Padrões de Código

Guia de padrões adotados no projeto para manter consistência ao contribuir.

---

## Estrutura de um Módulo de Feature

Cada funcionalidade de negócio é organizada em 3 camadas:

```
Serviço (services/)   →  Hook (hooks/)   →  Componente/Página (pages/ ou components/)
```

**Regra:** componentes nunca chamam `services/` diretamente — sempre usam um hook.

---

## Aliases de Importação

Use `@/` para importações absolutas (configurado no Vite e TypeScript):

```typescript
// ✅ Correto
import { Button } from '@/components/ui/button';
import { useEvent } from '@/hooks/useEvent';
import type { EventDetail } from '@/types/events';

// ❌ Evitar
import { Button } from '../../../components/ui/button';
```

---

## Hooks com React Query

### Padrão de `useQuery`
```typescript
// hooks/useTickets.ts
export function useTickets(eventId: string) {
  return useQuery({
    queryKey: ['tickets', eventId],
    queryFn: () => getTickets(eventId),
    enabled: !!eventId,
  });
}
```

### Padrão de `useMutation` com invalidação de cache
```typescript
export function useCreateTicket(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketInput) => createTicket(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', eventId] });
      toast.success('Ingresso criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar ingresso.');
    },
  });
}
```

### Query Keys (convenção)

| Entidade | Query Key |
|---|---|
| Eventos | `['events', { page, limit, status }]` |
| Evento único | `['event', id]` |
| Ingressos | `['tickets', eventId]` |
| Participantes | `['participants', eventId, params]` |
| Cupons | `['coupons', eventId]` |
| Parceiros | `['partners', eventId]` |
| Assinantes | `['signers', eventId]` |
| Usuário atual | `['me']` |
| Financeiro | `['financeiro']` |
| Checkin stats | `['checkin-stats', eventId]` |

---

## Formulários

Use **React Hook Form** + **Zod** para todos os formulários:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  quantity: z.number().min(1, 'Mínimo 1'),
});

type FormData = z.infer<typeof schema>;

function MyForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input label="Nome" error={errors.name?.message} {...register('name')} />
    </form>
  );
}
```

---

## Componentes de UI

### Usar os primitivos existentes
Sempre use os componentes de `@/components/ui/` antes de criar novos:

- Botão → `<Button variant="primary">`
- Input → `<Input label="..." error={...}>`
- Modal → `<Dialog open={...} onOpenChange={...}>`
- Toast → `toast.success('...')` / `toast.error('...')`
- Confirmação destrutiva → `useConfirm()`

### Adicionar novos primitivos
Se precisar de um novo primitivo não existente:
1. Adicione em `src/components/ui/`.
2. Baseie-se nos primitivos Radix UI quando possível.
3. Use CSS variables do design system (não values hardcoded).

---

## Estilização

Use **Tailwind CSS** com classes utilitárias. Para valores dinâmicos:

```typescript
// ✅ Use a função cn() para mesclar classes condicionalmente
import { cn } from '@/lib/utils';

<div className={cn('base-class', isActive && 'active-class', className)} />
```

**Nunca** use `style={{ color: '#ff0000' }}` para cores que existem no design system. Use as classes Tailwind correspondentes.

### Tokens de design
Os tokens ficam em `src/design-system/tokens.css` como CSS custom properties:

```css
:root {
  --color-primary: #...;
  --color-background: #...;
  --radius-md: 8px;
  /* ... */
}

.dark {
  --color-background: #...;
  /* overrides dark mode */
}
```

---

## Upload de Arquivos

Para upload de imagens em formulários:

```typescript
// No componente — input file
<input type="file" accept="image/*" onChange={(e) => {
  const file = e.target.files?.[0];
  if (file) uploadMutation.mutate(file);
}} />

// No hook
export function useUploadPartnerLogo(eventId: string) {
  return useMutation({
    mutationFn: ({ partnerId, file }: { partnerId: string; file: File }) =>
      uploadPartnerLogo(eventId, partnerId, file),
  });
}

// No serviço — use FormData
export async function uploadPartnerLogo(eventId: string, partnerId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/events/${eventId}/partners/${partnerId}/logo`, formData);
}
```

Para resolver a URL de uma imagem recebida do backend:
```typescript
import { getMediaUrl } from '@/lib/utils';

<img src={getMediaUrl(partner.logoUrl)} alt={partner.name} />
// '/uploads/foto.jpg' → 'http://localhost:3333/uploads/foto.jpg'
```

---

## Tratamento de Erros da API

Os erros do Axios têm a estrutura:
```typescript
error.response?.data?.message  // string ou string[]
```

Padrão nos hooks:
```typescript
onError: (error: AxiosError<{ message: string | string[] }>) => {
  const message = error.response?.data?.message;
  toast.error(Array.isArray(message) ? message[0] : message ?? 'Erro inesperado.');
}
```

---

## Testes

### Stack
- **Vitest** como test runner (compatível com Jest API).
- **@testing-library/react** para testes de componentes.
- **@testing-library/user-event** para simular interações.
- Setup em `src/test/setup.ts` (importa `@testing-library/jest-dom`).

### Onde ficam os testes
```
src/
├── pages/
│   ├── DashboardPage.tsx
│   └── DashboardPage.test.tsx   ← mesmo diretório
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts
├── services/
│   ├── events.ts
│   └── events.test.ts
└── lib/
    ├── api.ts
    └── api.test.ts
```

### Exemplo de teste de componente
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TicketFormModal } from '@/components/TicketFormModal';

describe('TicketFormModal', () => {
  it('calls onSubmit with form data', async () => {
    const onSubmit = vi.fn();
    render(
      <TicketFormModal open onClose={vi.fn()} onSubmit={onSubmit} isPending={false} />
    );

    await userEvent.type(screen.getByLabelText('Nome'), 'Lote 1');
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Lote 1' }));
  });
});
```

### Executar testes
```bash
npm run test        # modo watch
npm run test:run    # CI / uma execução
```

---

## Nomenclatura

| Artefato | Convenção | Exemplo |
|---|---|---|
| Componentes | PascalCase | `EventDetailPage`, `TicketFormModal` |
| Hooks | camelCase com `use` | `useEvent`, `useCheckinQueue` |
| Serviços | camelCase | `getMyEvents`, `createTicket` |
| Tipos/Interfaces | PascalCase | `EventDetail`, `CreateTicketInput` |
| Arquivos de componente | PascalCase `.tsx` | `AppShell.tsx` |
| Arquivos de hook | camelCase `.ts` | `useAuth.ts` |
| Arquivos de serviço | camelCase `.ts` | `events.ts` |
| Arquivos de tipo | camelCase `.ts` | `events.ts`, `participants.ts` |
| Testes | mesmo nome + `.test.tsx/.ts` | `useAuth.test.ts` |

---

## Linting

```bash
npm run lint
```

Configurado com ESLint + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`.

Regras importantes:
- Hooks devem seguir as [Regras dos Hooks](https://react.dev/warnings/invalid-hook-call-warning) (lint automático).
- Componentes devem ser funções (não classes).
- Sem `any` explícito (TypeScript strict).
