# SIGMA Device SDK — cópia sincronizada

Este diretório é uma **cópia sincronizada** do contrato único do ecossistema SIGMA.

- **Fonte da verdade:** `SIGMA-Emu/packages/device-sdk/` (`spec/` + `fixtures/`).
- **Sincronização:** a partir de `SIGMA-Emu`:
  ```bash
  npm run sync:studio -w packages/device-sdk
  ```
- **Não edite** os arquivos aqui diretamente — altere o spec no SDK e re-sincronize.

Conteúdo:

| Caminho | Conteúdo |
|---|---|
| `spec/*.json` | JSON Schema canônico (telemetria, MQTT telemetry/status/events, identidade, tópicos) |
| `fixtures/*.golden.json` | Fixtures de conformidade compartilhadas (mesmas usadas no SIGMA Emu) |

O teste `tests/test_contract_conformance.py` consome esta cópia para detectar drift
entre os schemas Pydantic do backend e o contrato único.
