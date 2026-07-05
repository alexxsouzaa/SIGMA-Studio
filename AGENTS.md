# SIGMA Engineering Framework (SEF)

Version: 1.0.0

Author: Bruno Alex Souza da Silva

---

# Objetivo

Este documento define como qualquer agente de IA deve atuar durante o desenvolvimento do ecossistema SIGMA.

O objetivo é garantir consistência arquitetural, qualidade industrial, rastreabilidade e previsibilidade em todas as modificações realizadas no projeto.

Este documento é obrigatório para qualquer alteração em:

- Firmware
- Backend
- SIGMA Studio
- Hardware
- Analytics
- Inteligência Artificial
- Documentação
- Infraestrutura

---

# Filosofia

Todo código produzido deve ser:

- Modular
- Determinístico
- Documentado
- Testável
- Escalável
- Versionado
- Reproduzível

Nunca implementar soluções rápidas que comprometam a arquitetura.

Sempre priorizar qualidade sobre velocidade.

---

# Fluxo obrigatório

Toda tarefa deve seguir obrigatoriamente a sequência abaixo.

```
Entendimento

↓

Leitura da documentação

↓

Carregamento das Skills

↓

Planejamento

↓

Implementação

↓

Testes

↓

Documentação

↓

Commit
```

Nunca pular etapas.

---

# Hierarquia de conhecimento

Sempre consultar nesta ordem.

1. AGENTS.md
2. Standards
3. Skills
4. Playbooks
5. Engineering Docs
6. Código existente

Caso exista conflito, prevalece o item de maior prioridade.

---

# Estrutura do Framework

```
AGENTS.md

↓

Standards

↓

Skills

↓

Playbooks

↓

Templates

↓

Engineering Docs

↓

Código
```

---

# Standards obrigatórios

Sempre respeitar:

RAM

Arquitetura de software.

CCS

Comentários.

SUS

Interface Serial.

PRD

Requisitos.

RFC

Mudanças arquiteturais.

ADR

Decisões arquitetônicas.

---

# Skills

Antes de iniciar qualquer tarefa, identificar automaticamente quais Skills são necessárias.

## Firmware

sigma-firmware

## Hardware

sigma-hardware

sigma-pcb

sigma-mechanical

## Software

sigma-backend

sigma-rest-api

sigma-websocket

sigma-studio

sigma-database

## Analytics

sigma-analytics

sigma-feature-engineering

sigma-signal-processing

sigma-predictive-maintenance

## IA

sigma-ai

sigma-tinyml

sigma-model-training

## Produto

sigma-brand

sigma-industrial-design

sigma-roadmap

sigma-prd

## Qualidade

sigma-testing

sigma-security

sigma-documentation

sigma-devops

sigma-release

sigma-monitoring

---

# Seleção automática de Skills

## Nova funcionalidade do Firmware

Carregar:

- sigma-firmware
- sigma-testing
- sigma-documentation

---

## Novo Sensor

Carregar:

- sigma-firmware
- sigma-hardware
- sigma-pcb
- sigma-testing

---

## Nova API

Carregar:

- sigma-rest-api
- sigma-backend
- sigma-testing

---

## Dashboard

Carregar:

- sigma-studio
- sigma-websocket
- sigma-rest-api

---

## Machine Learning

Carregar:

- sigma-ai
- sigma-feature-engineering
- sigma-model-training

---

## TinyML

Carregar:

- sigma-tinyml
- sigma-ai
- sigma-firmware

---

## Analytics

Carregar:

- sigma-analytics
- sigma-signal-processing

---

# Playbooks

Sempre seguir o Playbook correspondente.

Exemplos:

CriarDriver.md

CriarService.md

CriarEndpoint.md

CriarDashboard.md

CriarPCB.md

CriarModeloIA.md

CriarRelease.md

Nunca criar um fluxo diferente sem justificativa técnica.

---

# Templates

Sempre utilizar os templates oficiais.

PRD

RFC

ADR

Task

Release

Commit

Issue

Architecture

Nunca inventar formatos.

---

# Engenharia

Toda decisão técnica deve considerar:

Escalabilidade

Performance

Baixo acoplamento

Alta coesão

Responsabilidade única

SOLID

KISS

DRY

YAGNI

---

# Firmware

É proibido:

malloc

free

new

delete

std::vector

std::list

std::string

delay()

Sempre utilizar buffers estáticos.

---

# Backend

Sempre utilizar:

REST para operações.

WebSocket para tempo real.

Nunca misturar responsabilidades.

---

# Banco de Dados

Nunca acessar o banco diretamente pela interface.

Toda operação deve passar pelos Services.

---

# Analytics

Nunca calcular diretamente na interface.

Todo cálculo pertence ao Analytics Engine.

---

# IA

Nunca consumir dados brutos.

Sempre consumir Features.

---

# Testes

Toda alteração deve possuir:

Testes

Validação

Critérios de aceite

---

# Documentação

Toda implementação deve atualizar:

README

Arquitetura

PRD

Task

Changelog

---

# Commits

Utilizar Conventional Commits.

Exemplo:

feat(firmware):

fix(analytics):

refactor(storage):

docs(prd):

test(api):

---

# Antes de finalizar

Verificar:

Arquitetura preservada?

Documentação atualizada?

Testes criados?

Código comentado?

Versão atualizada?

Commit preparado?

---

# Objetivo Final

Toda contribuição realizada por agentes de IA deve possuir qualidade equivalente à de uma equipe de engenharia industrial sênior, respeitando integralmente a arquitetura, os padrões e a visão de longo prazo do ecossistema SIGMA.
