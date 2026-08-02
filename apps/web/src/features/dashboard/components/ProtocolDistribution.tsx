const protocols = [
  { name: 'MQTT', desc: 'Broker HiveMQ', value: 612, pct: 45.7, color: 'var(--accent)' },
  { name: 'OPC-UA', desc: 'Servidores industriais', value: 298, pct: 22.2, color: 'var(--info)' },
  { name: 'Modbus TCP', desc: 'PLCs legacy', value: 224, pct: 16.7, color: 'var(--success)' },
  { name: 'BLE', desc: 'Sensores campo', value: 141, pct: 10.5, color: 'var(--warning)' },
  { name: 'Wi-Fi', desc: 'HMI / painéis', value: 65, pct: 4.9, color: 'var(--fg-muted)' },
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
                  <span>· {p.desc}</span>
                </span>
                <span className="protocol-bar-value">{p.value} ({p.pct}%)</span>
              </div>
              <div className="protocol-bar-track">
                <div className="protocol-bar-fill" style={{ width: `${p.pct}%`, background: p.color }} />
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
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" /><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" /><circle cx="12" cy="12" r="2" /><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" /><path d="M19.1 4.9C23 8.8 23 15.1 19 19" />
    </svg>
  )
}
