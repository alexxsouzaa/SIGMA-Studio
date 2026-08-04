import { useApi } from '@/lib/hooks'
import { LoadingSpinner, EmptyState } from '@/components/shared/StatusStates'

interface ProtocolItem {
  name: string
  device_count: number
  gateway_count: number
  pct: number
}

const PROTOCOL_COLORS: Record<string, string> = {
  MQTT: 'var(--accent)',
  'OPC-UA': 'var(--info)',
  'Modbus TCP': 'var(--success)',
  BLE: 'var(--warning)',
  'Wi-Fi': 'var(--fg-muted)',
}

const PROTOCOL_DESCS: Record<string, string> = {
  MQTT: 'Broker HiveMQ',
  'OPC-UA': 'Servidores industriais',
  'Modbus TCP': 'PLCs legacy',
  BLE: 'Sensores campo',
  'Wi-Fi': 'HMI / painéis',
}

export function ProtocolDistribution() {
  const { data: protocols, isLoading, error } = useApi<ProtocolItem[]>('/dashboard/protocols')
  const totalDevices = protocols?.reduce((sum, p) => sum + p.device_count, 0) ?? 0

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="widget-title">
          <RadioIcon />Distribuição de Protocolos
        </div>
        <div className="widget-subtitle">{totalDevices.toLocaleString('pt-BR')} dispositivos conectados</div>
      </div>
      <div className="widget-body">
        {isLoading && <LoadingSpinner />}
        {error && <div className="empty-state-text">Erro ao carregar protocolos</div>}
        {!isLoading && !error && (!protocols || protocols.length === 0) && (
          <EmptyState title="Nenhum protocolo configurado" />
        )}
        {!isLoading && !error && protocols && protocols.length > 0 && (
          <div className="protocol-bars">
            {protocols.map((p) => (
              <div key={p.name} className="protocol-bar-item">
                <div className="protocol-bar-header">
                  <span className="protocol-bar-name">
                    <code>{p.name}</code>
                    <span> · {PROTOCOL_DESCS[p.name] ?? p.name}</span>
                  </span>
                  <span className="protocol-bar-value">
                    {p.device_count.toLocaleString('pt-BR')} ({p.pct}%)
                  </span>
                </div>
                <div className="protocol-bar-track">
                  <div className="protocol-bar-fill" style={{ width: `${p.pct}%`, background: PROTOCOL_COLORS[p.name] ?? 'var(--fg-muted)' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RadioIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--fg-muted)' }}>
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" /><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" /><circle cx="12" cy="12" r="2" /><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" /><path d="M19.1 4.9C23 8.8 23 15.1 19 19" />
    </svg>
  )
}
