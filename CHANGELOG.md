# Changelog

Todas as mudanças relevantes do SIGMA Studio são registradas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

## [0.9.1] — FortifiedCore

### Security
- Remediação completa dos achados **CRITICAL** e **HIGH** da auditoria de segurança:
  - **Segredos**: `SIGMA_JWT_SECRET` (≥ 32 chars, sem default público) e `SIGMA_ADMIN_PASSWORD` (≥ 10 chars) obrigatórios — `settings._validate_settings()` falha rápido e impede o boot com valores padrão; senha `admin123` do admin é migrada automaticamente no startup para a definida no `.env`.
  - **RBAC no servidor**: `require_permission`/`require_admin` validam permissões reais (antes só frontend). Aplicado em devices, gateways, alerts, firmware, ai_models, logs, dashboard, search, sites, projects, organizations e users.
  - **Isolamento multi-tenant**: `org_scope` + `can_access_org` filtram todas as rotas e WebSockets pela organização do usuário (IDOR fechado).
  - **OAuth Google**: `state` aleatório em cookie httpOnly validado com `compare_digest`; tokens nunca mais na URL.
  - **Rate limiting**: `slowapi` (login 10/min, register 5/min, refresh 30/min, global 120/min) com handler `429`.
  - **Tokens em cookies httpOnly** (`samesite=lax`): login/register/refresh/Google; frontend parou de usar `localStorage` para tokens.
  - **WebSocket autenticado por cookie** `access_token` (sem token na query string) e filtrado por escopo do usuário.

### Added
- `POST /alerts/acknowledge-all`: confirma todos os alarmes ativos de uma vez (`AlertService.acknowledge_all`).
- `POST /users/{user_id}/reset-password`: gera e retorna senha temporária real (admin), sem simular envio de e-mail.
- `DELETE /logs/`: limpa todos os logs (somente admin) via `LogService.clear_logs`.
- `app/api/rate_limit.py`: instância compartilhada do `Limiter` (slowapi).
- `app/api/deps.py`: `require_admin`, `require_permission(permission)`, `org_scope`, `get_user_scope`, `can_access_org`.
- `RealtimeService` com filtro por `organization_ids` em `recent_unacknowledged_alerts`, `new_alerts_since` e `new_samples_since`.
- WebSocket com dados reais: `/ws/telemetry` (polling 2s, filtro `device_id`) e `/ws/alerts` (polling 5s), com códigos `4401` (não autenticado) e `4403` (fora do escopo).
- `escapeHTML` em `lib/export.ts`: exportação PDF sanitiza `title` e dados interpolados (XSS mitigado).
- Testes backend: `test_settings_security.py` (9) e `test_security_rbac.py` (10) — cobrem 401/403, isolamento por org, rate-limit `429` e rejeição de state OAuth inválido. **39 no total.**

### Fixed
- `main.py`: seed do admin usa `settings.admin_password` (senha hardcoded `"admin123"` removida); migração automática do valor legado.
- Botões mortos do frontend removidos ou tornados honestos (sem ações simuladas):
  - `DevicesPage` Importar e Reiniciar: desabilitados com tooltip (sem endpoint no backend).
  - `FirmwarePage` OTA: desabilitado com tooltip (sem endpoint de atualização).
  - `LandingCTA` "Agendar demonstração": agora abre o cliente de e-mail (`mailto:`) com assunto pré-preenchido.
- `main.py`: versão da API lida do arquivo raiz `VERSION` (antes `settings.app_name`).
- `users.py`: `require_admin` aceita apenas admin ou role com permissão `"*"`.
- `SettingsPage`: aba "Segurança" (`activeTab === "seguranca"`) passou a renderizar; erro real de preferências exibido.
- `.gitignore` reescrito (env, `.pytest_cache`, logs, `.env.*` com exceção de `.env.example`).
- `seed_devices.py`: import morto removido; confirmação interativa antes de re-semear.
- Documentação: stack real (Zustand) e contagem de modelos corrigidas no README/ARCHITECTURE.
- `auth_service.get_current_user`: aceita Bearer **ou** cookie `access_token` (necessário para WebSocket).
- `exportPDF`: valores de dados (`alarm_type`, `level`, etc.) escapados antes de `document.write`.

### Changed
- `settings.py`: fail-fast rigoroso (sem gating por `SIGMA_DEBUG`); `debug` passa a ser `False` por padrão.
- WebSockets deixaram de ser anônimos e deixaram de exigir token na query string: autenticação via cookie httpOnly + escopo por organização.
- Frontend (`api.ts`, `authStore`, `GoogleCallbackPage`, WS consumers): tokens em `localStorage` substituídos por cookies httpOnly.
- `TelemetryPage` e `TelemetryChart` deixaram de exibir dados fabricados no cliente.

## [0.9.0] — RealData

### Added
- Suite de testes:
  - Backend (pytest + pytest-asyncio): auth utils e `DashboardService` — 13 testes.
  - Frontend (Vitest + jsdom): `permissions`, `cn`, exportação CSV/JSON — 19 testes.
  - `testpaths` do `pyproject.toml` corrigido para `tests`.
- Dashboard agora consome dados reais da API:
  - `KpiCards` usa `messages_per_minute` real do backend (contador no MQTT manager).
  - `GatewayStatus` renderiza gateways via `GET /api/v1/dashboard/gateways`.
  - `ProtocolDistribution` renderiza protocolos via `GET /api/v1/dashboard/protocols`.
  - `AiInsights` renderiza modelos de IA via `GET /api/v1/dashboard/ai-insights`.
- Novos endpoints: `GET /dashboard/protocols`, `GET /dashboard/gateways`, `GET /dashboard/ai-insights`.
- Novos schemas Pydantic: `dashboard.py` (ProtocolSummary, GatewaySummary, AiInsightResponse, DashboardSummary).

### Fixed
- `UsersPage`: removido fallback de senha hardcoded `temp123`; adicionada validação client-side (mín. 6 caracteres).
- `GatewaysPage`: `organization_id` agora vem do usuário autenticado (`current_organization_id`), não hardcoded.
- `TelemetryPage`: URL do WebSocket usa `import.meta.env.BASE_URL`.
- `pyproject.toml`: `httpx` movido para dependência de runtime; `alembic` duplicado removido de dev.
- `AlarmsTable`: confirmar alarme agora exibe toast de erro em vez de falha silenciosa.
- `FormControls`: Toggle com `role="switch"` e `aria-checked` para acessibilidade.

### Changed
- Versão raiz sincronizada para `0.8.0` em `package.json`.
- Removidos componentes mortos `Topbar.tsx` e `Sidebar.tsx`.
- Web dashboard redesenhado com visual "Precision Instrument" (accent `#38BDF8`).

---

## [0.8.0] — RBAC

### Added
- Logs reais, IA/TinyML, telemetria ao vivo, dashboard customizável, detalhes de dispositivo e multi-tenant.
- Sistema RBAC com roles: admin, engineer, technician, operator, visitor.

---

## [0.4.0] — Auth

### Added
- Sistema completo de autenticação JWT.

---

## [0.3.2] — Database

### Added
- Alembic, migrations e 10 tabelas do banco.

---

## [0.3.1] — Services

### Added
- Camada Service, schemas Pydantic e CRUD completo de devices.

---

## [0.3.0] — Monorepo

### Changed
- Reestruturação do projeto para monorepo com `apps/` e `packages/` (v0.3.0.S01).

---

## [0.2.0] — SEF

### Added
- `VERSION` e regra de versionamento obrigatório do SIGMA Engineering Framework.
