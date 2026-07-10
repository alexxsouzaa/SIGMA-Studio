const protocols = [
  { name: 'MQTT', detail: 'Broker HiveMQ', value: '612 (45,7%)', width: '45.7%', color: 'var(--accent)' },
  { name: 'OPC-UA', detail: 'Servidores industriais', value: '298 (22,2%)', width: '22.2%', color: 'var(--info)' },
  { name: 'Modbus TCP', detail: 'PLCs legacy', value: '224 (16,7%)', width: '16.7%', color: 'var(--success)' },
  { name: 'BLE', detail: 'Sensores campo', value: '141 (10,5%)', width: '10.5%', color: 'var(--warning)' },
  { name: 'Wi-Fi', detail: 'HMI / painéis', value: '65 (4,9%)', width: '4.9%', color: 'var(--fg-muted)' },
]

export function ProtocolDistribution() {
  return (
    <div className="widget">
      <div className="widget-header">
        <div className="widget-title">
          <RadioIcon />Distribuição de Protocolos
        </div>
        <div className="widget-subtitle">1.340 dispositivos conectados</div>
      </div>
      <div className="widget-body">
        <div className="protocol-bars">
          {protocols.map((p) => (
            <div key={p.name} className="protocol-bar-item">
              <div className="protocol-bar-header">
                <span className="protocol-bar-name">
                  <code>{p.name}</code>
                  {' · '}
                  {p.detail}
                </span>
                <span className="protocol-bar-value">{p.value}</span>
              </div>
              <div className="protocol-bar-track">
                <div
                  className="protocol-bar-fill"
                  style={{ width: p.width, background: p.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RadioIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--fg-muted)' }}>
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" /><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" /><circle cx="12" cy="12" r="2" /><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" /><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
    </svg>
  )
}
