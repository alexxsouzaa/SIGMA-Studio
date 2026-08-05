# Roadmap — SIGMA Studio

> **Documento:** Roadmap | **Versão:** 0.9.0 | **Status:** Vigente

## Fase 1 — Dashboard com dados reais ✅ (em curso)

Conectar todos os widgets do dashboard a dados reais da API.

- [x] MQTT manager: contador de mensagens + `get_message_rate()`
- [x] Schemas Pydantic de dashboard (`app/schemas/dashboard.py`)
- [x] Service: `get_protocols()`, `get_gateway_summary()`, `get_ai_insights()`
- [x] Endpoints `GET /dashboard/protocols`, `/gateways`, `/ai-insights`
- [x] Widgets do frontend consumindo a API (`KpiCards`, `GatewayStatus`, `ProtocolDistribution`, `AiInsights`)
- [x] Conectar MQTT manager ao startup (`app/main.py`) → msgs/min real

## Fase 2 — Documentação ✅ (em curso)

- [x] README raiz
- [x] CHANGELOG (Keep a Changelog)
- [x] Arquitetura (`docs/ARCHITECTURE.md`)
- [x] PRD (`docs/PRD.md`)
- [x] Roadmap (`docs/ROADMAP.md`)

## Fase 3 — Testes ✅

- [x] Corrigir `testpaths` do `pyproject.toml` (apontava para `../../tests` inexistente)
- [x] Testes backend: `tests/test_utils_auth.py` (6) + `tests/test_dashboard_service.py` (7)
- [x] Testes frontend: `permissions.test.ts` + `utils.test.ts` + `export.test.ts` (19)
- [x] Runner: pytest (asyncio_mode auto) + Vitest (`npm run test -w apps/web`)

## Fase 4 — Limpeza final & release ✅

- [x] Removido `scripts/` vazio da raiz (`apps/backend/scripts/seed_devices.py` mantido como utilitário)
- [x] MQTT manager conectado ao startup (`app/main.py`) → `messages_per_minute` real no `/dashboard/summary`
- [x] `get_message_rate()` usado no endpoint de summary
- [x] Sincronizar versão (VERSION / package.json / pyproject.toml)
- [x] Commit Conventional + tag `v0.9.0`

### Decisão: `ALTER TABLE` ad-hoc em `app/main.py`
Os blocos `ALTER TABLE` no startup foram **mantidos**: são idempotentes (guardados por `try/except`) e garantem compatibilidade de bancos existentes. A migração completa via Alembic fica como trabalho futuro no backend.

## Fase 5 — Auditoria & correções (Lote A + B) ✅

Correções de segurança/estrutura e eliminação de botões mortos no frontend.

- [x] **Lote A — Limpeza segura**: `.gitignore` reescrito; `_API_VERSION` lido do `VERSION` raiz; `require_admin` restrito a admin/`"*"`; `SettingsPage` com aba Segurança renderizando; `seed_devices.py` com confirmação interativa; `.env.example`; `npm prune` (0 extraneous); docs corrigidos.
- [x] **Lote B — Botões mortos**: AlarmsPage (confirmar/silenciar), DevicesPage (adicionar/editar/remover via modal; importar/reiniciar desabilitados), FirmwarePage (OTA desabilitado, detalhes reais), UsersPage (redefinição de senha real), LogsPage (limpar via API), LandingCTA (mailto).
- [x] Endpoints novos: `POST /alerts/acknowledge-all`, `POST /users/{id}/reset-password`, `DELETE /logs/`.
- [x] Testes: backend 17 (4 novos), frontend 19.

## Fase 6 — Lote C: Segredos & WebSocket com dados reais ✅

Endurecimento de segurança e eliminação dos últimos dados fabricados (curvas fake).

- [x] **Segredos via env com fail-fast**: `SIGMA_JWT_SECRET` e `SIGMA_ADMIN_PASSWORD` lançam `RuntimeError` em produção se não configurados (`settings._validate_settings()`); `SIGMA_ADMIN_PASSWORD` no `.env.example`.
- [x] **Seed sem senha hardcoded**: `main.py` usa `hash_password(settings.admin_password)`.
- [x] **WebSocket autenticado e com dados reais**: `/ws/telemetry` (samples, polling 2s, filtro `device_id`) e `/ws/alerts` (snapshots de não confirmados) exigem JWT via `?token=`, fechando com `4401` se inválido.
- [x] **`RealtimeService`**: consultas de polling isoladas (`new_samples_since`, `new_alerts_since`, `recent_unacknowledged_alerts`).
- [x] **Frontend honesto**: `TelemetryPage`, `TelemetryChart` (dashboard) e painel de detalhes do dispositivo consomem o WS com token e mostram empty states; curva sintética removida; exportar CSV real; `liveAlerts.ts` sem reconexão em `4401`.
- [x] Testes: backend 21 (4 novos de `RealtimeService`), frontend 19, build e lint limpos.

## Além do roadmap

- Docker + deploy
- PostgreSQL
- Alertas externos (e-mail/WhatsApp)
- Treinamento de modelos na plataforma
- App mobile
