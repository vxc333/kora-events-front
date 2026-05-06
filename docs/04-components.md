# Componentes

Catálogo de todos os componentes reutilizáveis da aplicação.

---

## Layout / Shell

### `AppShell`
**Arquivo:** `src/components/AppShell.tsx`

Layout padrão das páginas privadas. Envolve todas as rotas autenticadas (exceto check-in e certificate-editor).

**Estrutura:**
- Sidebar colapsável (desktop) / drawer (mobile).
- Navegação: Dashboard, Eventos, Check-in, Financeiro.
- Rodapé da sidebar: avatar do usuário, nome, e-mail + botão logout.
- CTA "Criar evento" fixo na sidebar.
- Área de conteúdo principal com `<Outlet />`.

---

### `PrivateRoute`
**Arquivo:** `src/components/PrivateRoute.tsx`

HOC de proteção de rota. Verifica `localStorage.getItem('accessToken')`. Se ausente, redireciona para `/login`. Caso contrário, renderiza `<Outlet />`.

---

## Componentes Públicos

### `QrScanner`
**Arquivo:** `src/components/QrScanner.tsx`

Scanner de QR Code por câmera, baseado na biblioteca `jsqr`.

**Props:**
```tsx
{
  onScan: (data: string) => void;  // chamado quando um QR é detectado
  onError?: (error: string) => void;
}
```

Solicita permissão de câmera automaticamente. Processa frames via `requestAnimationFrame`. Para de escanear quando desmontado.

---

### `PlacesAutocomplete`
**Arquivo:** `src/components/PlacesAutocomplete.tsx`

Input de localização com autocomplete do Google Places.

**Props:**
```tsx
{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

**Comportamento:**
- Se `VITE_GOOGLE_MAPS_API_KEY` estiver definida → carrega a API do Google Maps e exibe sugestões.
- Se não → renderiza um `<input>` simples (sem autocomplete).

---

### `BlockRenderers`
**Arquivo:** `src/components/BlockRenderers.tsx`

Renderiza os blocos do page builder na `PublicEventPage`.

Cada tipo de bloco tem seu próprio sub-renderer:

| Tipo de bloco | O que renderiza |
|---|---|
| `agenda` | Programação do evento em lista |
| `speakers` | Cards de palestrantes com foto e bio |
| `faq` | Accordion de perguntas e respostas |
| `gallery` | Grid de imagens |
| `sponsors` | Logos dos patrocinadores |
| `text` | Texto rico / HTML |
| `video` | Player de vídeo embed |
| `countdown` | Contagem regressiva até o evento |

**Props:**
```tsx
{
  blocks: PageBlock[];
  settings: PageSettings;
}
```

---

## Modais de Formulário

Todos os modais seguem a mesma interface:
```tsx
{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TInput) => void;
  isPending: boolean;
  item?: TEntity; // se presente, modo edição
}
```

### `TicketFormModal`
**Arquivo:** `src/components/TicketFormModal.tsx`

Cria ou edita um ingresso. Campos: nome, descrição, quantidade, datas de início/fim das vendas.

### `CouponFormModal`
**Arquivo:** `src/components/CouponFormModal.tsx`

Cria ou edita um cupom. Campos: código, tipo de desconto (PERCENTAGE/FIXED), valor, limite de usos, data de expiração.

### `ParticipantFormModal`
**Arquivo:** `src/components/ParticipantFormModal.tsx`

Cria ou edita um participante manualmente. Campos: nome, e-mail, CPF, telefone, ingresso (select), status.

Props extras:
```tsx
{ tickets: Ticket[] }  // para popular o select de ingressos
```

### `PartnerFormModal`
**Arquivo:** `src/components/PartnerFormModal.tsx`

Cria ou edita um parceiro/patrocinador. Campos: nome, ordem de exibição.

### `SignerFormModal`
**Arquivo:** `src/components/SignerFormModal.tsx`

Cria ou edita um assinante do certificado. Campos: nome, cargo/título, ordem de exibição.

### `BlockPaletteModal`
**Arquivo:** `src/components/BlockPaletteModal.tsx`

Modal de seleção de tipo de bloco para adicionar ao page builder. Exibe os tipos disponíveis com ícone e descrição (via `BLOCK_META`).

### `BlockEditModal`
**Arquivo:** `src/components/BlockEditModal.tsx` (~292 linhas)

Modal de edição de conteúdo de um bloco do page builder. Renderiza formulário específico de acordo com o tipo do bloco:
- `agenda` → lista de itens com horário + descrição
- `speakers` → lista de palestrantes com nome, bio, foto (URL)
- `faq` → pares pergunta/resposta
- `gallery` → lista de URLs de imagens
- `sponsors` → lista de logos com nome e URL
- `text` → textarea de HTML/texto
- `video` → URL de vídeo embed
- `countdown` → data alvo

---

## Componentes de Check-in

### `CheckinPage` / `CheckinScannerPage`
Documentados na seção de Páginas (ver [03-pages.md](03-pages.md)).

---

## Primitivos de UI (`src/components/ui/`)

Componentes base do design system, inspirados no shadcn/ui com customizações do projeto.

### `Button`
```tsx
<Button
  variant="primary" | "secondary" | "ghost" | "danger"
  size="sm" | "md" | "lg"
  loading={boolean}
  disabled={boolean}
>
  Texto
</Button>
```

### `Input`
```tsx
<Input
  label="Nome"
  placeholder="Digite seu nome"
  error="Campo obrigatório"
  {...register('name')}
/>
```
Componente com `label` integrado e exibição de `error` abaixo do campo.

### `DarkInput`
Variante do `Input` com tema escuro, usada nas telas de autenticação (login, registro).

### `Textarea`
Idêntico ao `Input` mas com `<textarea>` internamente. Aceita `label` e `error`.

### `Dialog`
Wrapper do `@radix-ui/react-dialog` com estilização padrão do projeto.

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
    </DialogHeader>
    {/* conteúdo */}
  </DialogContent>
</Dialog>
```

### `Badge`
```tsx
<Badge variant="success" | "warning" | "danger" | "default">
  Texto
</Badge>
```

### `Card`
```tsx
<Card>
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### `Table`
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>João</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### `Skeleton`
Placeholder de carregamento animado.
```tsx
<Skeleton className="h-4 w-32" />
```

### `Label`
Label HTML estilizado, para uso com inputs customizados.

### `DropdownMenu`
Menu contextual com suporte a itens, separadores e submenus. Baseado no Radix UI.

### `Sonner` (Toast)
Wrapper do `sonner` para notificações globais. Instanciado uma vez em `main.tsx`.

Uso:
```tsx
import { toast } from 'sonner';

toast.success('Evento criado com sucesso!');
toast.error('Erro ao salvar.');
```

---

## `useConfirm`
**Arquivo:** `src/hooks/useConfirm.tsx`

Hook que fornece um modal de confirmação baseado em Promise — evita ter que gerenciar estado de modal para cada ação destrutiva.

```tsx
const { confirm, ConfirmDialog } = useConfirm();

// No JSX:
<ConfirmDialog />

// Na função:
const handleDelete = async () => {
  const ok = await confirm({
    title: 'Cancelar inscrição?',
    description: 'Esta ação não pode ser desfeita.',
    confirmLabel: 'Cancelar inscrição',
    variant: 'danger',
  });
  if (ok) await cancelParticipant(id);
};
```
