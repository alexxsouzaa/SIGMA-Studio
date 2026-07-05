# Product Requirements Document (PRD)
# SIGMA Studio

**Versão:** 1.0.0
**Status:** Oficial
**Data:** 05/07/2026
**Autor:** Bruno Alex Souza da Silva

---

# 1. Visão Geral

O SIGMA Studio é a plataforma oficial de gerenciamento do ecossistema Project SIGMA.

Seu objetivo é fornecer uma interface moderna para monitoramento, configuração, diagnóstico, análise e gerenciamento dos dispositivos SIGMA.

Enquanto o firmware é responsável pelo processamento em tempo real (Edge Computing), o SIGMA Studio é responsável por toda a camada de interação com o usuário, persistência histórica, visualização, análise avançada e gerenciamento dos dispositivos.

O sistema foi projetado para crescer desde um único equipamento conectado via USB até centenas de dispositivos conectados em rede.

---

# 2. Objetivos

O SIGMA Studio deverá permitir:

- Monitorar motores em tempo real.
- Configurar dispositivos.
- Atualizar parâmetros.
- Receber telemetria.
- Armazenar histórico.
- Gerenciar múltiplos dispositivos.
- Exibir dashboards profissionais.
- Executar análises estatísticas.
- Servir como plataforma para IA.
- Facilitar manutenção e diagnóstico.

---

# 3. Escopo

## Incluído

- Dashboard Web
- Comunicação Serial
- Comunicação MQTT
- Banco de Dados
- Gerenciamento de dispositivos
- Histórico
- Estatísticas
- Logs
- Configuração
- Diagnóstico
- Sistema de alertas

## Não incluído (primeira versão)

- OTA
- Cloud
- Multiempresa
- Controle de usuários
- Aplicativo Mobile
- Machine Learning embarcado

---

# 4. Público-Alvo

- Técnicos de manutenção
- Engenheiros
- Desenvolvedores
- Integradores
- Empresas de manutenção preditiva
- Indústrias

---

# 5. Problema

Hoje o firmware do SIGMA oferece apenas comunicação via Serial.

Isso limita:

- visualização
- histórico
- comparação
- análise
- configuração
- manutenção

O SIGMA Studio resolve esse problema centralizando toda a operação em uma única plataforma.

---

# 6. Objetivos do Produto

## Funcionais

Permitir:

- descobrir dispositivos
- conectar dispositivos
- monitorar dispositivos
- configurar dispositivos
- salvar dados
- consultar histórico
- visualizar gráficos
- exportar dados
- analisar tendências

## Não Funcionais

- Alta performance
- Interface moderna
- Escalabilidade
- Fácil manutenção
- Arquitetura modular
- Código desacoplado
- Cross-platform

---

# 7. Arquitetura

```
Firmware SIGMA

↓

Serial / MQTT

↓

SIGMA Studio Backend

↓

Analytics

↓

Database

↓

WebSocket

↓

Frontend
```

---

# 8. Stack Oficial

## Backend

- Python
- FastAPI
- SQLAlchemy
- pySerial
- Paho MQTT

---

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Apache ECharts

---

## Banco

Desenvolvimento

SQLite

Produção

PostgreSQL

---

# 9. Módulos

## Dashboard

Resumo geral.

Responsável por apresentar:

- Health Score
- Alarmes
- Temperatura
- Vibração
- Horímetro
- Status

---

## Monitoramento

Tempo real.

Exibe:

- sensores
- gráficos
- eventos
- timestamp

Atualização via WebSocket.

---

## Histórico

Consulta todas as leituras gravadas.

Filtros:

- período
- dispositivo
- evento

---

## Analytics

Responsável por:

- médias
- máximos
- mínimos
- tendências
- desvios
- estatísticas

---

## Dispositivos

Cadastro.

Informações:

- nome
- modelo
- firmware
- versão
- localização
- status

---

## Configuração

Alteração dos parâmetros do firmware.

Exemplos:

- limiares
- baseline
- fator K
- calibração

---

## Diagnóstico

Ferramentas para manutenção.

Exemplos:

- leitura Serial
- eventos
- watchdog
- memória
- comunicação

---

## Logs

Registro completo.

Categorias:

- sistema
- comunicação
- firmware
- analytics
- erros

---

# 10. Comunicação

## Serial

Primeira comunicação suportada.

Fluxo:

```
ESP32

↓

USB

↓

pySerial

↓

Backend
```

---

## MQTT

Comunicação futura.

Fluxo:

```
ESP32

↓

Broker

↓

Backend
```

---

# 11. Banco de Dados

Tabelas iniciais.

## Devices

Informações dos dispositivos.

---

## Samples

Leituras dos sensores.

---

## Alerts

Histórico de alarmes.

---

## Events

Eventos internos.

---

## Configurations

Configurações.

---

## Logs

Logs do sistema.

---

# 12. Dashboard

O Dashboard deverá possuir no mínimo:

- Home
- Monitoramento
- Analytics
- Histórico
- Dispositivos
- Configuração
- Diagnóstico
- Logs

---

# 13. Interface

Características:

- Tema escuro
- Industrial
- Alto contraste
- Responsiva
- Navegação lateral
- Atualização em tempo real

Referências:

- Siemens
- ABB
- Schneider
- Ignition
- FactoryTalk

---

# 14. Analytics

O SIGMA Studio será responsável por:

- FFT
- Tendências
- Estatísticas
- Comparações
- Correlações
- Histórico
- Relatórios

O firmware continuará responsável apenas pelas análises críticas em tempo real.

---

# 15. Inteligência Artificial

A IA ficará no Backend.

Aplicações futuras:

- Detecção de anomalias
- Classificação de falhas
- Predição de vida útil
- Identificação automática de padrões
- Comparação entre motores

---

# 16. Segurança

O sistema deverá suportar futuramente:

- autenticação
- autorização
- criptografia
- HTTPS
- usuários
- permissões

---

# 17. Requisitos Funcionais

## RF-001

Detectar automaticamente dispositivos conectados via Serial.

---

## RF-002

Conectar dispositivos manualmente.

---

## RF-003

Receber telemetria em tempo real.

---

## RF-004

Salvar todas as leituras.

---

## RF-005

Exibir dashboards em tempo real.

---

## RF-006

Visualizar histórico.

---

## RF-007

Enviar comandos ao firmware.

---

## RF-008

Configurar parâmetros.

---

## RF-009

Registrar eventos.

---

## RF-010

Exportar dados.

---

# 18. Requisitos Não Funcionais

## RNF-001

Tempo de atualização inferior a 500 ms.

---

## RNF-002

Suportar múltiplos dispositivos.

---

## RNF-003

Interface responsiva.

---

## RNF-004

Arquitetura modular.

---

## RNF-005

Baixo consumo de memória.

---

## RNF-006

Alta disponibilidade.

---

## RNF-007

Escalabilidade horizontal.

---

# 19. Critérios de Aceitação

O produto será considerado funcional quando for capaz de:

- Detectar um dispositivo SIGMA.
- Receber dados continuamente.
- Exibir gráficos em tempo real.
- Registrar histórico.
- Permitir configuração.
- Gerenciar múltiplos dispositivos.
- Operar continuamente sem perda de dados.

---

# 20. Métricas de Sucesso

- Conexão automática em menos de 3 segundos.
- Atualização do dashboard em menos de 500 ms.
- 99,9% de disponibilidade durante monitoramento.
- Zero perda de amostras em operação normal.
- Interface intuitiva para técnicos e engenheiros.

---

# 21. Evolução do Produto

A arquitetura deverá permitir, sem necessidade de reescrita:

- OTA
- Bluetooth
- Wi-Fi
- MQTT
- REST API pública
- Aplicativo Mobile
- IA embarcada
- Edge AI
- Cloud
- Multiusuário
- Multiempresa
- Integração com sistemas SCADA
- Integração com ERPs
- Monitoramento de centenas de dispositivos

---

# 22. Objetivo Final

O SIGMA Studio deverá se tornar a plataforma central do ecossistema Project SIGMA, oferecendo uma solução completa para monitoramento preditivo de ativos industriais. O software deverá atender desde o uso em bancada por um único desenvolvedor até implantações em ambientes industriais com múltiplos dispositivos, preservando desempenho, confiabilidade, escalabilidade e facilidade de manutenção.
