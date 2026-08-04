# Roadmap — SIGMA Studio

> **Documento:** Roadmap | **Versão:** 0.9.0 | **Status:** Vigente

## Fase 1 — Dashboard com dados reais ✅ (em curso)

Conectar todos os widgets do dashboard a dados reais da API.

- [x] MQTT manager: contador de mensagens + `get_message_rate()`
- [x] Schemas Pydantic de dashboard (`app/schemas/dashboard.py`)
- [x] Service: `get_protocols()`, `get_gateway_summary()`, `get_ai_insights()`
- [x] Endpoints `GET /dashboard/protocols`, `/gateways`, `/ai-insights`
- [x] Widgets do frontend consumindo a API (`KpiCards`, `GatewayStatus`, `ProtocolDistribution`, `AiInsights`)
- [ ] Conectar MQTT manager ao startup (`app/main.py`) → msgs/min real

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

## Além do roadmap

- Docker + deploy
- PostgreSQL
- Alertas externos (e-mail/WhatsApp)
- Treinamento de modelos na plataforma
- App mobile
