# Arquitetura — SIGMA Studio

> **Documento:** Architecture | **Versão:** 0.9.0 | **Status:** Vigente

Este documento descreve a arquitetura técnica do ecossistema SIGMA: camadas do backend, organização do frontend e o fluxo de dados ponta a ponta.

---

## Visão geral

```
+------------------+        REST / WebSocket         +------------------+
|   SIGMA Studio    |  <──────────────────────────>  |   FastAPI         |
|   (React SPA)     |                                |   apps/backend    |
+------------------+                                +------------------+
                                                         │
                                          ┌──────────────┼──────────────┐
                                          ▼              ▼              ▼
                                     +-----------+   +--------+    +---------+
                                     | SQLite    |   | MQTT   |    | Serial  |
                                     | (async)   |   | Broker |    | Firmware|
                                     +-----------+   +--------+    +---------+
```

A plataforma é **web-first**: o frontend é uma SPA React que conversa com a API REST para operações e com WebSocket para tempo real. O backend é a única porta de entrada para dados — nenhuma UI acessa banco ou fontes de dados diretamente.

---

## Backend (`apps/backend`)

### Camadas

| Camada | Pasta | Responsabilidade |
|---|---|---|
| **API** | `app/api/` | Endpoints REST + validação de rota. Prefijo `/api/v1`. |
| **Service** | `app/services/` | Regras de negócio. Única camada autorizada a orquestrar repositórios. |
| **Repository** | `app/repositories/` | Acesso a dados (SQLAlchemy async). |
| **Model** | `app/models/` | Mapeamento objeto-relacional (14 modelos). |
| **Schema** | `app/schemas/` | Contratos Pydantic de entrada/saída. |
| **Analytics** | `app/analytics/` | Cálculos e processamento de sinais. Nunca executado na UI. |
| **AI** | `app/ai/` | Modelos TinyML e inferência de manutenção preditiva. |
| **MQTT** | `app/mqtt/` | Cliente de ingestão de telemetria (Paho MQTT). |
| **Serial** | `app/serial/` | Comunicação com firmware via porta serial. |
| **WebSocket** | `app/websocket/` | Push em tempo real (alarmes, telemetria ao vivo). |
| **Config** | `app/config/` | `pydantic-settings` (variáveis de ambiente). |
| **Database** | `app/database/` | Sessão async + migrations Alembic. |
| **Utils** | `app/utils/` | Auth (JWT, bcrypt), helpers. |

### Regras arquiteturais

1. **Controllers nunca acessam banco** — passam pelo Service correspondente.
2. **UI nunca calcula** — todo cálculo pertence ao Analytics Engine.
3. **IA nunca consome dados brutos** — consome Features.
4. **REST para operações, WebSocket para tempo real** — responsabilidades separadas.
5. **`app/main.py`** registra o router global, CORS, criação de schema e seeds (roles, admin, organização padrão).

### Módulos principais

- **Dashboard** (`api/dashboard.py` + `services/dashboard_service.py`)
  - `GET /dashboard/summary` — KPIs agregados (dispositivos, alarmes, msgs/min).
  - `GET /dashboard/protocols` — distribuição por protocolo (GROUP BY com %).
  - `GET /dashboard/gateways` — status dos gateways mais recentes.
  - `GET /dashboard/ai-insights` — modelos de IA ativos.
- **Auth** — JWT + Google OAuth2 + RBAC por permissões por feature.
- **Multi-tenant** — organizações isolam dados por `organization_id` (org padrão do usuário autenticado).

### Fluxo de telemetria (alvo)

```
Firmware ──Serial──▶ Gateway ──MQTT──▶ mqtt/manager ──▶ Analytics ──▶ Dashboard/WebSocket
```

O `mqtt/manager` mantém um contador de mensagens exposto via `get_message_rate()` para o KPI de mensagens/min do dashboard.

---

## Frontend (`apps/web`)

### Stack

Vite 8 · React 19 · TypeScript 6 · Zustand 5 · React Hook Form + Zod · react-router-dom 7 · lucide-react · CSS custom (design system próprio) · oxlint

### Organização feature-based

```
src/
├── components/shared/    # StatusStates (Loading/Empty/Error), modais, toasts
├── features/<feature>/   # Cada feature: pages/, components/, lib/
├── lib/                  # hooks.tsx (useApi<T>), toastStore, API client
├── stores/               # Zustand (auth, theme)
└── types/
```

Features: `auth`, `dashboard`, `devices`, `alarms`, `telemetry`, `gateways`, `firmware`, `ia`, `logs`, `search`, `users`, `profile`, `settings`, `landing`, `client`, `errors`.

Páginas públicas: `/` (landing de vendas), `/area-cliente` (portal de acesso com login/criação de conta), `/login`, `/register`, `/google/callback`.

### Padrões

- **`useApi<T>(endpoint, { refreshInterval })`** — hook central que busca a API, retorna `{ data, isLoading, error, refetch }` e suporta auto-refresh para tempo quase real.
- **Rotas protegidas** — `App.tsx` valida sessão antes de montar o AppShell.
- **Acessibilidade** — componentes de formulário com `role` e `aria-*` adequados.
- **Design tokens** — cores definidas como CSS variables (`--accent`, `--info`, `--success`, `--warning`, `--danger`, `--fg*`, `--surface*`).
- **Tema** — claro/escuro persistente (Zustand + atributo no `index.html`).

---

## Dados

### Banco

SQLite via SQLAlchemy 2 async (`aiosqlite`). Migrations gerenciadas por Alembic (`apps/backend/alembic`). 14 modelos SQLAlchemy registrados (users, roles, organizations, members, devices, gateways, firmware, ai_models, alarmes, amostras, logs e outros).

### API

- Documentação interativa: `http://localhost:8000/docs` (Swagger).
- Contratos em `app/schemas/` — nenhum dado trafega sem schema Pydantic.

---

## Decisões relevantes

| Decisão | Motivo |
|---|---|
| Backend único (FastAPI) expõe REST + WebSocket | Isola a plataforma de dados da UI |
| Analytics/IA no backend | Cálculo e inferência nunca na interface |
| Workspaces npm para o frontend | Monorepo único, sem `packages/` próprio |
| SQLite no estágio atual | Simplicidade; caminho livre para PostgreSQL |
| JWT + RBAC por feature | Controle fino de acesso multi-tenant |
