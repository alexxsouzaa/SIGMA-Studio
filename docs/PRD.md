# PRD — SIGMA Studio

> **Documento:** PRD | **Versão:** 0.9.0 | **Status:** Vigente

## 1. Objetivo

Entregar uma plataforma web de monitoramento de condição industrial (Condition Monitoring) que coleta telemetria de ativos via múltiplos protocolos, detecta alarmes em tempo real e oferece manutenção preditiva com IA/TinyML — tudo acessível por uma interface única, segura e multi-tenant.

## 2. Personas

| Persona | Perfil | Necessidade principal |
|---|---|---|
| Operador | Chão de fábrica | Visão rápida de alarmes e dashboard |
| Técnico | Manutenção | Telemetria ao vivo, detalhes de dispositivo |
| Engenheiro | Automação | Configurar gateways, firmware, análises |
| Administrador | TI/Planta | Usuários, roles, multi-tenant, auditoria |

## 3. Funcionalidades (por prioridade)

### P0 — Essencial (v0.9.0)
- [x] Autenticação JWT + Google OAuth2
- [x] RBAC (admin, engineer, technician, operator, visitor) com permissões por feature
- [x] Multi-tenant por organização
- [x] Dashboard ao vivo (KPIs, gateways, protocolos, insights de IA)
- [x] Telemetria em tempo real (WebSocket + MQTT)
- [x] Alarmes: detecção, confirmação, histórico, exportação CSV/PDF
- [x] CRUD de dispositivos, gateways e usuários
- [x] Busca global
- [x] Tema claro/escuro persistente

### P1 — Alta (próxima release)
- [x] Mensagens/min reais (MQTT manager ligado ao startup)
- [x] Ingestão de telemetria real (HTTP `POST /api/v1/telemetry` + MQTT `sigma/+/telemetry`)
- [x] Conjunto de testes automatizados (backend + frontend)
- [ ] CI com build, lint e testes

### P2 — Média
- [ ] Ingestão serial/firmware operacional
- [ ] Deployment containerizado (Docker)
- [ ] Migração para PostgreSQL
- [ ] Logs de auditoria avançados

### P3 — Futuro
- [ ] Alertas por e-mail/WhatsApp
- [ ] Dashboards por organização configuráveis
- [ ] Modelos TinyML treinados na plataforma
- [ ] Aplicativo mobile

## 4. Critérios de aceite gerais

1. Toda operação passa por Service (nunca banco na UI).
2. Todo cálculo ocorre no Analytics Engine (nunca na UI).
3. IA consome apenas Features (nunca dados brutos).
4. Toda mudança possui testes, validação e documentação.
5. Versionamento sincronizado: `VERSION`, `package.json`, `pyproject.toml`.

## 5. Métricas de sucesso

- Downtime de dados de telemetria < 1%.
- Latência alarme→notificação < 2s.
- Cobertura de testes ≥ 70%.
- Zero issues de segurança críticas no lint/audit.

## 6. Não-objetivos

- Não é um MES/MES completo.
- Não substitui o SCADA existente.
- Não processa dados brutos na borda (apenas Features).
