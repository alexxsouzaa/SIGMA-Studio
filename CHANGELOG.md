# Changelog

Todas as mudanças relevantes do SIGMA Studio são registradas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

### Added
- `POST /alerts/acknowledge-all`: confirma todos os alarmes ativos de uma vez (`AlertService.acknowledge_all`).
- `POST /users/{user_id}/reset-password`: gera e retorna senha temporária real (admin), sem simular envio de e-mail.
- `DELETE /logs/`: limpa todos os logs (somente admin) via `LogService.clear_logs`.
- `app/api/deps.py`: dependência compartilhada `require_admin` (movida de `users.py`).
- `RealtimeService` (`app/services/realtime_service.py`): consultas de polling para WebSocket (`recent_unacknowledged_alerts`, `new_alerts_since`, `new_samples_since` com filtro por `device_id`).
- WebSocket com dados reais e autenticação JWT obrigatória via `?token=`:
  - `/ws/telemetry`: emite samples de `Sample` (polling 2s), aceita filtro `device_id`; fecha com código `4401` se o token for inválido.
  - `/ws/alerts`: emite snapshots de alarmes não confirmados (polling 5s); fechamento por falta de confirmação no `open` (4401).
- Fail-fast de segredos: `settings._validate_settings()` lança `RuntimeError` se `SIGMA_JWT_SECRET`/`SIGMA_ADMIN_PASSWORD` estiverem em default sem `SIGMA_DEBUG`; `SIGMA_ADMIN_PASSWORD` documentado no `.env.example`.
- `TelemetryPage`: telemetria real via WS (temperatura, vibração X/Y/Z, RMS), filtro por dispositivo, exportação CSV real e empty state honesto (sem curva fake).
- `TelemetryChart` (dashboard): consome `/ws/telemetry` com token JWT, não conecta sem `access_token` e mostra empty state quando não há dados.
- `DevicesPage` (painel de detalhes): telemetria real por `device_id` via WS; curva sintética removida.
- `liveAlerts.ts`: envia token JWT na URL do WS e não reconecta após o código `4401`.
- AlarmsPage: botões Confirmar e Silenciar todos conectados à API com estados de carregamento.
- DevicesPage: modal de Adicionar/Editar (POST/PUT em `/devices/`) e Remover com confirmação (DELETE).
- FirmwarePage: painel de Detalhes com dados reais de status do firmware.
- LogsPage: Limpar conectado à API com confirmação em dois passos.
- UsersPage: Redefinir senha conectado à API (exibe a senha temporária gerada).
- Testes backend: `acknowledge_all`/`clear_logs` (4) e `RealtimeService` (4) — 21 no total.

### Fixed
- `main.py`: seed do admin usa `settings.admin_password` (senha hardcoded `"admin123"` removida).
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

### Changed
- `settings.py`: `_validate_settings()` com fail-fast em modo produção (logs warning em debug).
- WebSockets deixaram de ser anônimos: `/ws/telemetry` e `/ws/alerts` exigem `access_token` válido.
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
