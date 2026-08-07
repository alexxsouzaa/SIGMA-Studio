# SIGMA Studio

> **SIGMA Engineering Framework (SEF)** — Plataforma web de monitoramento de condição industrial (Condition Monitoring).

![Version](https://img.shields.io/badge/version-0.11.0-TelemetryIngest?style=flat-square)

A plataforma SIGMA monitora ativos industriais em tempo real: conecta gateways por múltiplos protocolos (MQTT, OPC-UA, Modbus TCP, BLE), processa telemetria, dispara alarmes, e executa inferência TinyML na borda para manutenção preditiva.

---

## Stack

| Camada | Tecnologia |
|---|---|
| **Frontend** | Vite 8 · React 19 · TypeScript 6 · react-router-dom 7 · Zustand 5 · RHF + Zod · lucide-react · CSS custom (design system próprio) |
| **Backend** | Python ≥3.13 · FastAPI · SQLAlchemy 2 · Alembic · Paho MQTT · PySerial |
| **Banco** | SQLite (aiosqlite) via SQLAlchemy async |
| **Auth** | JWT (python-jose) · bcrypt · OAuth2 Google · RBAC |

---

## Estrutura do monorepo

```
SIGMA-Studio/
├── apps/
│   ├── backend/          # FastAPI (API REST + WebSocket + MQTT + Analytics + IA)
│   └── web/              # SIGMA Studio (SPA React)
├── .opencode/            # Configuração e skills dos agentes (não versionado)
├── AGENTS.md             # Regras obrigatórias do framework SEF
├── VERSION               # Versão + codename do projeto
├── package.json          # Workspace raiz (gerencia apps/web)
└── docs/                 # Documentação de arquitetura, PRD e roadmap
```

### Backend (`apps/backend`)

```
app/
├── api/          # Endpoints REST (dashboard, devices, alarms, gateways, auth, users...)
├── models/       # Modelos SQLAlchemy (14 modelos)
├── schemas/      # Schemas Pydantic (validação + contratos de API)
├── services/     # Camada de serviço (regras de negócio — nunca acessar DB na UI)
├── repositories/ # Acesso a dados
├── analytics/    # Analytics Engine (cálculos nunca na interface)
├── ai/           # IA / TinyML
├── mqtt/         # Cliente MQTT (ingestão de telemetria)
├── serial/       # Comunicação serial (firmware)
├── websocket/    # Tempo real (notificações, telemetria ao vivo)
├── database/     # Sessão + migrations Alembic
├── config/       # Configuração via pydantic-settings
└── utils/        # Auth, helpers
```

### Frontend (`apps/web`)

```
src/
├── components/shared/   # UI compartilhada (StatusStates, modais, toasts...)
├── features/            # Feature-based: auth, dashboard, devices, alarms,
│                        #   telemetry, gateways, firmware, ia, logs, search,
│                        #   users, profile, settings, landing, client, errors
├── lib/                 # hooks (useApi), API client, toastStore
├── stores/              # Zustand (auth, theme...)
└── types/               # Tipos compartilhados
```

---

## Como rodar

### Execução rápida (Windows)

Dê duplo clique em **`dev.cmd`** (raiz do repositório): valida o venv e o `node_modules`, sobe o backend (`:8000`) e o frontend (`:5173`) em janelas separadas e abre o navegador. Feche as janelas para encerrar.

### Pré-requisitos

- Node.js ≥ 20
- Python ≥ 3.13
- `npm` (workspaces) e `uv` ou `pip` para o backend

### Backend

```bash
cd apps/backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\Activate.ps1
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

- Docs interativas: `http://localhost:8000/docs`
- Usuário padrão: `admin` — senha definida via `SIGMA_ADMIN_PASSWORD` no `.env` do backend (sem senha pública)

### Frontend

```bash
npm install                        # na raiz (workspaces)
npm run dev                        # dev do SIGMA Studio
```

- Studio: `http://localhost:5173`

### Ambiente de produção

O frontend aponta para a API relativa via `import.meta.env.BASE_URL`. Para servidores distintos, ajuste a variável de ambiente da API.

---

## Scripts úteis

| Comando | Descrição |
|---|---|
| `dev.cmd` | Sobe backend + frontend com um clique (Windows) |
| `npm run dev` | Sobe o Studio (Vite) |
| `npm run build` | Build de produção (tsc + vite) |
| `npm run lint` | Lint (oxlint) |
| `python -m pytest` | Testes do backend |

---

## Features

- **Dashboard ao vivo** — KPIs, gateways, distribuição de protocolos, insights de IA
- **Telemetria em tempo real** — WebSocket + MQTT com auto-refresh
- **Alarmes** — detecção, confirmação e histórico com exportação CSV/PDF
- **Gateways** — CRUD completo com suporte a múltiplos protocolos
- **Dispositivos** — inventário e detalhes por dispositivo
- **Laboratório / Emulador** — seção dedicada (`/app/lab`) para dispositivos simulados do **SIGMA Emu**, isolados da frota real (organização `sigma-emu` + flag `is_emulated`) e com atalho para a UI do emulador (`VITE_EMU_WEB_URL`)
- **Firmware** — atualizações OTA
- **IA / TinyML** — modelos de manutenção preditiva
- **Usuários & RBAC** — roles (admin, engineer, technician, operator, visitor) com permissões por feature
- **Multi-tenant** — organizações com isolamento de dados
- **Auth** — JWT + Google OAuth2
- **Área do cliente** — portal de acesso (`/area-cliente`) com login e criação de conta para clientes existentes
- **Busca global** — pesquisa em dispositivos, alarmes, gateways e usuários
- **Tema** — claro/escuro persistente

---

## Padrões de engenharia

Este repositório segue o **SIGMA Engineering Framework (SEF)** descrito em `AGENTS.md`:

- `AGENTS.md` → Standards → Skills → Playbooks → Templates → Engineering Docs → Código
- Conventional Commits (`feat(studio):`, `fix(auth):`, ...)
- Versionamento em `VERSION` sincronizado com `package.json` e `pyproject.toml`
- Proibido `malloc/free` e containers dinâmicos no firmware (buffers estáticos)
- Banco acessado somente via Services; cálculos somente no Analytics Engine

---

## Documentação

- `docs/ARCHITECTURE.md` — visão técnica das camadas
- `docs/PRD.md` — requisitos de produto
- `docs/ROADMAP.md` — fases planejadas
- `CHANGELOG.md` — histórico de versões

## Licença

A definir.
