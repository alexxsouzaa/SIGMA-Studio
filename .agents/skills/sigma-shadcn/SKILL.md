# SIGMA Studio — shadcn/ui Skill

## Quando usar esta skill

Acione esta skill **antes de gerar qualquer código de UI** para o SIGMA Studio.
Isso inclui: criar páginas, criar componentes, adicionar formulários,
modificar o layout, adicionar gráficos, criar diálogos, tabelas,
badges de status, ou qualquer elemento visual do painel.

Não assuma nada sobre o projeto sem ler esta skill primeiro.
O SIGMA Studio tem convenções específicas que divergem do padrão
genérico do shadcn/ui — ignorá-las produz código inconsistente.

---

## Stack exata (não inferir — usar estes valores)

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | React | 19 |
| Build | Vite | 8 |
| Linguagem | TypeScript | 6 |
| Roteamento | react-router-dom | 7 |
| Estado global | Zustand | 5 |
| Server state | TanStack Query | 5 (instalado, pouco usado) |
| Formulários | React Hook Form + Zod | 7 + 4 |
| CSS | Tailwind CSS | **4** |
| UI Base | shadcn/ui (Radix) | — |
| Ícones | lucide-react | 1 |
| Gráficos | Recharts | 3 |
| Toast | sonner | 2 |

> **Tailwind 4 não usa `tailwind.config.js`.**
> Configuração vive no `index.css`. Não gerar config files do Tailwind 3.

---

## Estrutura de diretórios

```
apps/web/src/
├── components/        ← componentes da aplicação
│   ├── ui/            ← shadcn registry (gerado pelo CLI)
│   ├── app-sidebar.tsx
│   ├── ProtectedRoute.tsx
│   └── ...
├── features/          ← cada feature = pasta própria
│   ├── auth/
│   ├── dashboard/
│   └── ...
├── layouts/
│   └── AppLayout.tsx
├── stores/
│   ├── authStore.ts
│   └── ...
└── index.css          ← tema + design tokens
```

### Regra de onde criar código novo

- **Página nova** → `apps/web/src/features/<nome>/index.tsx`
- **Componente reutilizável** → `apps/web/src/components/`
- **Componente específico de uma feature** → dentro da pasta da feature
- **Nunca** criar componente em `components/ui/` diretamente —
  essa pasta é gerenciada pelo CLI do shadcn

---

## Sistema de tema

### Variáveis disponíveis (oklch, Tailwind 4)

Usar sempre classes semânticas, nunca cores hardcoded:

```css
/* Fundos */
bg-background      /* página */
bg-card            /* cards e widgets */
bg-muted           /* áreas secundárias, inputs desabilitados */
bg-sidebar         /* sidebar */

/* Texto */
text-foreground        /* texto principal */
text-muted-foreground  /* texto secundário, labels */
text-card-foreground   /* texto dentro de cards */

/* Bordas */
border-border      /* bordas padrão */
border-input       /* bordas de inputs */

/* Primária */
bg-primary         /* botões primários, destaques */
text-primary-foreground

/* Status */
text-success       /* --color-success */
text-warning       /* --color-warning */
text-destructive   /* erros */
```

### Regras do tema

- **Nunca** usar `bg-white`, `text-black`, `bg-gray-*` — quebra o dark mode.
- **Nunca** usar `hsl(var(--...))` exceto em casos isolados que espelham
  a referência sidebar-07 no Dashboard.
- Valores numéricos (medições, contadores, dados de sensor) usam
  a classe `tabular-nums` sempre.
- `gap-6` é o ritmo vertical padrão entre seções de uma página.

---

## Componentes disponíveis em sigma-ui

Antes de criar qualquer componente do zero, verificar se já existe
em `packages/ui/src/`. Componentes confirmados:

| Componente | Uso |
|-----------|-----|
| `Widget` | Container padrão para seções de página (fora do Dashboard) |
| `Metric` | Exibir uma métrica com label + valor + unidade |
| `StatusBadge` | Badge de status com variantes (ok, warn, crit, offline) |
| `Field` | Wrapper de campo de formulário com label e mensagem de erro |
| `Card` (raw shadcn) | Usado **apenas** no Dashboard para espelhar sidebar-07 |

### Quando usar `Widget` vs `Card`

- **Dashboard** → `Card` raw do shadcn (padrão do bloco sidebar-07)
- **Todas as outras páginas** → `Widget` do sigma-ui
- Nunca misturar os dois na mesma página

---

## Padrão de página

Toda página nova segue este padrão exato:

```tsx
// apps/web/src/features/<nome>/index.tsx
import { useState, useEffect } from 'react'
import { Widget } from 'sigma-ui'
import { Skeleton } from '@/components/ui/skeleton'

// Dados mock FORA do componente (não inline no JSX)
const MOCK_DATA = [...]

export default function NomeDaPagina() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* conteúdo */}
    </div>
  )
}
```

### Estado vazio

Quando filtro ou busca retorna vazio, nunca retornar lista vazia silenciosa:

```tsx
{items.length === 0 && (
  <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
    <IconeRelevante className="size-8" />
    <p className="text-sm">Nenhum [item] encontrado.</p>
  </div>
)}
```

---

## Formulários (React Hook Form + Zod)

### Padrão obrigatório

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Schema Zod — fora do componente
const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  valor: z.number({ invalid_type_error: 'Informe um número' }).min(0),
})

type FormData = z.infer<typeof schema>

export function MeuFormulario() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => { /* ... */ }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Field label="Nome" error={errors.nome?.message}>
        <input
          id="nome"
          {...register('nome')}
          className="..."
        />
      </Field>

      {/* Campos numéricos: valueAsNumber, NÃO z.coerce.number() */}
      <Field label="Valor" error={errors.valor?.message}>
        <input
          id="valor"
          type="number"
          {...register('valor', { valueAsNumber: true })}
          className="..."
        />
      </Field>
    </form>
  )
}
```

### Regras críticas de formulário

- Sempre `z.number()` + `{ valueAsNumber: true }` para campos numéricos.
  **Nunca** `z.coerce.number()`.
- Sempre `htmlFor` + `id` correspondente para acessibilidade.
- Usar `Field` do sigma-ui para wrapper (label + erro).
- Validação de erros do servidor via `setError` do RHF, não via estado local.

---

## Toast (sonner)

```tsx
import { toast } from 'sonner'

// Sucesso
toast.success('Configuração salva.')

// Erro
toast.error('Falha ao salvar. Tente novamente.')

// Loading + promise
toast.promise(salvarAsync(), {
  loading: 'Salvando...',
  success: 'Salvo com sucesso.',
  error: 'Erro ao salvar.',
})
```

Nunca usar `alert()`, `console.error` visível ao usuário, ou outro
mecanismo de toast. Toda notificação ao usuário passa pelo `sonner`.

---

## Gráficos (Recharts 3)

```tsx
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

// Sempre dentro de ResponsiveContainer com height fixo
<ResponsiveContainer width="100%" height={240}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
    <XAxis dataKey="timestamp" className="text-muted-foreground text-xs" />
    <YAxis className="text-muted-foreground text-xs" />
    <Tooltip
      contentStyle={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '6px',
      }}
    />
    <Line
      type="monotone"
      dataKey="valor"
      stroke="var(--color-primary)"
      strokeWidth={2}
      dot={false}
    />
  </LineChart>
</ResponsiveContainer>
```

### Regras de gráfico

- Sempre `ResponsiveContainer` — nunca width/height fixo no chart.
- `stroke` usa variáveis CSS, nunca hex hardcoded.
- `dot={false}` em linhas com muitos pontos (> 50 amostras).
- `CartesianGrid` usa `className="stroke-border"` para respeitar tema.
- Tooltip com `contentStyle` usando variáveis CSS para dark mode.

---

## Sidebar e layout

### Estrutura do AppLayout

```
AppLayout.tsx
├── Sidebar (256px expandido / 56px colapsado)
│   ├── TeamSwitcher
│   ├── NavMain  (collapsíveis via useState<string | null>)
│   ├── NavProjects (retorna null quando collapsed)
│   └── NavUser  (dropdown flutuante, sem Radix DropdownMenu)
└── Main
    ├── Header (PanelLeft toggle + breadcrumb)
    └── <Outlet /> (conteúdo da rota)
```

### Regras do sidebar

- `collapsed: boolean` sempre como prop nos componentes de nav.
- `NavProjects` retorna `null` quando `collapsed === true`.
- `NavUser` usa dropdown posicionado com
  `bottom-[calc(100%+4px)]` — não usar Radix `DropdownMenu` aqui.
- `NavMain` usa `"use client"` no topo e `useState<string | null>`
  para controlar qual item collapsível está aberto.
- Transição: `transition-all duration-200` na sidebar.

### Breadcrumb

Header sempre exibe: `Sigma Studio / {Nome da Página Atual}`
Usar o componente `Breadcrumb` do shadcn.

---

## Adicionar componente shadcn

```bash
# Requer shadcn.json na raiz de apps/web
# Se não existir, recriar antes:
npx shadcn@latest init

# Adicionar componente
npx shadcn@latest add <nome>
```

Componentes gerados vão para `apps/web/src/components/ui/`.
Se o componente for reutilizado em múltiplas features, mover para
`packages/ui/src/` e re-exportar via `components/ui/`.

---

## Rotas disponíveis

| Path | Página | Feature folder |
|------|--------|---------------|
| `/login` | Login | `features/auth/` |
| `/` | Dashboard | `features/dashboard/` |
| `/monitoring` | Monitoring | `features/monitoring/` |
| `/analytics` | Analytics | `features/analytics/` |
| `/history` | History | `features/history/` |
| `/devices` | Devices | `features/devices/` |
| `/configuration` | Configuration | `features/configuration/` |
| `/diagnosis` | Diagnosis | `features/diagnosis/` |
| `/logs` | Logs | `features/logs/` |

Toda rota protegida passa por `ProtectedRoute` no `App.tsx`.

---

## Zustand — stores disponíveis

```ts
// authStore — usuário autenticado
import { useAuthStore } from '@/stores/authStore'
const { user, token, login, logout } = useAuthStore()

// themeStore — light/dark
import { useThemeStore } from '@/stores/themeStore'
const { theme, setTheme } = useThemeStore()

// deviceStore — dispositivos/máquinas
import { useDeviceStore } from '@/stores/deviceStore'
const { devices, selectedDevice, setSelectedDevice } = useDeviceStore()
```

---

## API e dados

- Base URL: `http://localhost:8000/api/v1`
- Auth: Bearer JWT — interceptor automático em `sigma-services`
- Não chamar `fetch` diretamente — usar o client de `sigma-services`
- Dados mock: definir como `const MOCK_DATA = [...]` fora do componente

### TanStack Query (quando disponível)

```tsx
import { useQuery } from '@tanstack/react-query'

const { data, isLoading, error } = useQuery({
  queryKey: ['devices'],
  queryFn: () => devicesService.list(),
})
```

Quando a API ainda não estiver implementada, usar o padrão
`useState + useEffect + setTimeout(600ms)` com mock estático.

---

## Problemas conhecidos (não introduzir)

| Problema | Não fazer |
|----------|-----------|
| `shadcn.json` pode não existir | Não assumir que `npx shadcn add` funciona sem verificar |
| Versões desincronizadas | Não alterar `package.json` de versão sem instrução explícita |
| `framer-motion` instalado mas não usado | Não usar animações com framer-motion |
| Radix deps duplicados | Não adicionar Radix diretamente — usar via shadcn |
| TanStack Query pouco usado | Preferir mock + query key quando a página for nova |

---

## Checklist antes de entregar código

```
[ ] Importações de componentes shadcn vêm de @/components/ui/ ?
[ ] Classes de cor usam tokens semânticos (bg-card, text-foreground)?
[ ] Nenhum bg-white, text-black ou gray-* hardcoded?
[ ] Campos numéricos usam z.number() + valueAsNumber (não coerce)?
[ ] Labels têm htmlFor + id correspondente?
[ ] Dados mock definidos fora do componente?
[ ] Página tem isLoading + Skeleton + estado vazio?
[ ] Gráficos dentro de ResponsiveContainer?
[ ] Toasts via sonner, não alert()?
[ ] Widget em páginas normais, Card só no Dashboard?
[ ] tabular-nums em valores numéricos?
[ ] Novo arquivo criado no caminho correto da estrutura?
```

Se qualquer item for "não", corrigir antes de entregar.
