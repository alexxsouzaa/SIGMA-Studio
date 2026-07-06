# SIGMA Studio
# Plano de Ação — Fase 1 (MVP)

**Versão:** 1.0.0  
**Status:** Planejamento  
**Autor:** Bruno Alex Souza da Silva  
**Projeto:** SIGMA Studio

---

# 1. Objetivo

Este documento define o plano de execução da primeira fase do desenvolvimento do **SIGMA Studio**.

O objetivo desta fase é construir toda a infraestrutura da aplicação desktop, estabelecendo uma base sólida, escalável e modular para suportar futuras funcionalidades como telemetria em tempo real, Machine Learning, OTA, gerenciamento de múltiplos dispositivos e dashboards analíticos.

Ao final desta fase será possível:

- Autenticar usuários
- Navegar pelo sistema
- Gerenciar dispositivos
- Visualizar dashboards básicos
- Estruturar o módulo de Analytics
- Preparar toda a arquitetura para crescimento futuro

---

# 2. Escopo da Fase 1

Incluído nesta fase:

- Estrutura do projeto
- Backend
- Banco de dados
- Sistema de autenticação
- Interface principal
- Dashboard Home
- Gerenciamento de dispositivos
- Página Analytics (estrutura)
- APIs REST
- Comunicação WebSocket
- Dados simulados (Mock)

Não incluído:

- Machine Learning
- OTA
- MQTT
- Firmware real
- Notificações
- Multiempresa
- Cloud

---

# 3. Arquitetura Geral

```
                +----------------------+
                |    SIGMA Studio      |
                +----------+-----------+
                           |
           +---------------+---------------+
           |                               |
    Frontend Desktop                 Backend API
           |                               |
           +---------------+---------------+
                           |
                     Banco de Dados
                           |
                           |
                   WebSocket / REST
                           |
                     Dispositivos SIGMA
```

---

# 4. Ordem de Desenvolvimento

O desenvolvimento deverá seguir rigorosamente a sequência abaixo.

```
Planejamento

↓

Arquitetura

↓

Backend

↓

Banco de Dados

↓

Autenticação

↓

Frontend

↓

Dashboard

↓

Gerenciamento

↓

Analytics

↓

Integração

↓

Testes

↓

Release
```

---

# Sprint 0 — Fundação

## Objetivo

Criar toda a infraestrutura técnica do projeto.

## Backend

- Criar projeto
- Configurar FastAPI
- Configurar arquitetura modular
- Configurar REST
- Configurar WebSocket
- Configurar SQLAlchemy
- Configurar Alembic
- Configurar autenticação JWT

## Frontend

- Criar projeto React
- Configurar Electron
- Configurar TypeScript
- Configurar TailwindCSS
- Configurar React Router
- Configurar Zustand
- Configurar React Query

## Banco

Criar tabelas iniciais:

- Users
- Roles
- Devices
- DeviceStatus
- Telemetry
- Analytics
- Configurations
- Logs

---

# Sprint 1 — Sistema de Autenticação

## Objetivo

Implementar autenticação segura.

## Funcionalidades

- Login
- Logout
- Refresh Token
- Persistência da sessão
- Proteção de rotas

## Backend

Endpoints:

```
POST /login

POST /logout

GET /me

POST /refresh
```

## Interface

Tela de Login

Campos:

- Usuário
- Senha

Botões:

- Entrar
- Esqueci minha senha

Após autenticação:

```
Login

↓

Home
```

---

# Sprint 2 — Layout Principal

## Objetivo

Criar toda a estrutura visual da aplicação.

## Layout

```
+---------------------------------------------------------+
| TopBar                                                  |
+------------+--------------------------------------------+
|            |                                            |
|            |                                            |
| Sidebar    |                Conteúdo                    |
|            |                                            |
|            |                                            |
+------------+--------------------------------------------+
```

## Sidebar

- Home
- Dispositivos
- Analytics
- Relatórios
- Configurações
- Perfil

## TopBar

- Nome do usuário
- Empresa
- Status da conexão
- Avatar

---

# Sprint 3 — Dashboard Home

## Objetivo

Criar a tela inicial.

## Cards

- Dispositivos Online
- Dispositivos Offline
- Alarmes Ativos
- Temperatura Média
- Vibração Média
- Health Score Médio

## Widgets

- Últimos Alarmes
- Últimos Dispositivos Conectados
- Últimas Atualizações

---

# Sprint 4 — Gerenciamento de Dispositivos

## Objetivo

Criar o módulo completo de gerenciamento.

## Lista

Exibir:

- Nome
- Serial
- Firmware
- Status
- Última conexão
- Localização

## Funcionalidades

- Adicionar
- Editar
- Remover
- Atualizar Firmware
- Reiniciar
- Configurar

## Tela de Detalhes

Separada por abas:

### Informações

- Número de Série
- Firmware
- Hardware
- Data de Fabricação

### Configuração

- Sensibilidade
- Baseline
- Fator K

### Sensores

- Temperatura
- Vibração

### Firmware

- Versão
- Atualização

### Logs

- Eventos
- Alertas

### Analytics

- Histórico resumido

---

# Sprint 5 — Analytics

## Objetivo

Criar a estrutura completa da área analítica.

## Menu

- Overview
- Temperatura
- Vibração
- Health Score
- Alarmes
- Tendências

## Cards

- Health Score
- Temperatura
- Vibração RMS
- Horímetro
- Status Atual

## Gráficos

- Temperatura
- Vibração
- Health Score
- Média Móvel
- Tendência

## Tabela

Campos:

- Timestamp
- Temperatura
- Vibração
- Health Score
- Status

## Filtros

- Hoje
- Últimos 7 dias
- Últimos 30 dias
- Personalizado

---

# Sprint 6 — Integração

## Objetivo

Conectar todas as camadas.

Fluxo:

```
Frontend

↓

API REST

↓

Banco

↓

Mock Device

↓

Analytics
```

Nesta fase ainda não haverá integração com o firmware real.

Os dados serão simulados.

---

# Sprint 7 — Refinamento

## Objetivo

Melhorar experiência do usuário.

Itens:

- Responsividade
- Tema escuro
- Melhorias de desempenho
- Cache
- Loading
- Tratamento de erros
- Logs

---

# Estrutura Inicial do Projeto

```
sigma-studio/

├── apps/
│   ├── desktop/
│   └── backend/
│
├── packages/
│   ├── ui/
│   ├── shared/
│   ├── hooks/
│   ├── services/
│   ├── database/
│   └── types/
│
├── docs/
│
├── tests/
│
└── README.md
```

---

# Estrutura Frontend

```
src/

pages/

Login/

Home/

Devices/

Analytics/

Settings/

Profile/

components/

layout/

Sidebar/

TopBar/

AppLayout/

common/

Button/

Card/

Table/

Modal/

StatusBadge/

services/

api/

auth/

device/

analytics/

stores/

hooks/

types/
```

---

# Critérios de Aceite

Ao final desta fase deverá ser possível:

- Fazer login no sistema.
- Navegar entre todas as páginas.
- Visualizar o Dashboard Home.
- Cadastrar dispositivos.
- Editar dispositivos.
- Remover dispositivos.
- Consultar detalhes dos dispositivos.
- Acessar a página Analytics.
- Visualizar gráficos utilizando dados simulados.
- Consumir APIs REST.
- Manter conexão WebSocket preparada para tempo real.

---

# Resultado Esperado

Ao concluir esta fase, o SIGMA Studio possuirá uma arquitetura profissional, modular e escalável, pronta para integrar os dispositivos físicos do Project SIGMA e evoluir para funcionalidades avançadas como telemetria em tempo real, OTA, manutenção preditiva e inteligência artificial, sem necessidade de reestruturações arquiteturais significativas.
