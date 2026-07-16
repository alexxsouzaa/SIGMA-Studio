import { useState } from 'react'
import { Settings, BellRing, ShieldCheck, Cpu, Server, Save } from 'lucide-react'

const TABS = [
  { id: 'geral', label: 'Geral', icon: Settings },
  { id: 'notificacoes', label: 'Notificações', icon: BellRing, badge: '3' },
  { id: 'seguranca', label: 'Segurança', icon: ShieldCheck },
  { id: 'dispositivos', label: 'Dispositivos', icon: Cpu },
  { id: 'sistema', label: 'Sistema', icon: Server },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange?: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{ width: 40, height: 22, background: checked ? 'var(--fg)' : 'var(--border)', borderRadius: 11, position: 'relative', flexShrink: 0 }}
    >
      <span style={{ position: 'absolute', left: checked ? 21 : 3, top: 3, width: 16, height: 16, borderRadius: '50%', background: checked ? 'var(--surface)' : 'var(--bg)', transition: 'left 150ms ease' }} />
    </button>
  )
}

function Slider({ value, onChange, min, max, suffix }: { value: number; onChange: (v: number) => void; min: number; max: number; suffix: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div />
        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '2px 8px' }}>
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', height: 4, appearance: 'none', background: 'var(--border)', borderRadius: 2, outline: 'none' }}
      />
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('geral')
  const [saved, setSaved] = useState(false)

  const [telemetryInterval, setTelemetryInterval] = useState(5)
  const [retention, setRetention] = useState(90)
  const [groupInterval, setGroupInterval] = useState(15)
  const [timeout, setTimeout_] = useState(30)
  const [themeToggle, setThemeToggle] = useState(true)
  const [compactSidebar, setCompactSidebar] = useState(false)
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [emailNotif, setEmailNotif] = useState(true)
  const [browserNotif, setBrowserNotif] = useState(true)
  const [smsNotif, setSmsNotif] = useState(false)
  const [criticalAlerts, setCriticalAlerts] = useState(true)
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(true)
  const [twoFactor, setTwoFactor] = useState(true)
  const [simultaneousSessions, setSimultaneousSessions] = useState(true)
  const [autoDiscovery, setAutoDiscovery] = useState(true)
  const [otaAuto, setOtaAuto] = useState(false)
  const [dataRetention, setDataRetention] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [detailedLogs, setDetailedLogs] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ display: 'flex', gap: 24, height: '100%' }}>
      <div style={{ width: 200, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', padding: '8px 6px', flexShrink: 0 }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--radius-md)',
              fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 500,
              color: activeTab === tab.id ? 'var(--fg)' : 'var(--fg-secondary)',
              background: activeTab === tab.id ? 'var(--surface-hover)' : 'transparent',
              textAlign: 'left', width: '100%',
            }}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.badge && (
              <span style={{ marginLeft: 'auto', background: 'var(--danger)', color: 'var(--fg)', fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10, minWidth: 18, textAlign: 'center' }}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, maxWidth: 680, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        {activeTab === 'geral' && (
          <>
            <section>
              <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 16 }}>Preferências da Interface</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Idioma', desc: 'Idioma da interface do SIGMA Studio', component: <select className="login-input" defaultValue="pt-BR" style={{ height: 36, width: 200 }}><option value="pt-BR">Português (BR)</option><option value="en">English</option><option value="es">Español</option></select> },
                  { label: 'Fuso horário', desc: 'Fuso horário para timestamps e relatórios', component: <select className="login-input" defaultValue="America/Sao_Paulo" style={{ height: 36, width: 280 }}><option>America/Sao_Paulo</option><option>America/New_York</option><option>Europe/London</option></select> },
                  { label: 'Formato de data', desc: 'Formato usado para exibição de datas', component: <select className="login-input" defaultValue="DD/MM/AAAA" style={{ height: 36, width: 200 }}><option>DD/MM/AAAA</option><option>MM/DD/AAAA</option><option>AAAA-MM-DD</option></select> },
                  { label: 'Tema escuro', desc: 'Alternar entre modo claro e escuro', component: <Toggle checked={themeToggle} onChange={() => setThemeToggle(!themeToggle)} /> },
                  { label: 'Compactar sidebar', desc: 'Sidebar reduzida com apenas ícones', component: <Toggle checked={compactSidebar} onChange={() => setCompactSidebar(!compactSidebar)} /> },
                  { label: 'Atualização automática', desc: 'Atualizar dados automaticamente em tempo real', component: <Toggle checked={autoUpdate} onChange={() => setAutoUpdate(!autoUpdate)} /> },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{item.desc}</div>
                    </div>
                    {item.component}
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 16 }}>Coleta e Armazenamento</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Intervalo de telemetria</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8 }}>Intervalo entre coletas de dados dos dispositivos</div>
                  <Slider value={telemetryInterval} onChange={setTelemetryInterval} min={1} max={30} suffix="s" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Retenção de dados</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8 }}>Período de retenção do histórico de telemetria</div>
                  <Slider value={retention} onChange={setRetention} min={7} max={365} suffix=" dias" />
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'notificacoes' && (
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 16 }}>Canais de Notificação</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'E-mail', desc: 'Notificações por e-mail', component: <Toggle checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} /> },
                { label: 'Navegador', desc: 'Notificações push do navegador', component: <Toggle checked={browserNotif} onChange={() => setBrowserNotif(!browserNotif)} /> },
                { label: 'SMS', desc: 'Notificações via SMS para telefone cadastrado', component: <Toggle checked={smsNotif} onChange={() => setSmsNotif(!smsNotif)} /> },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{item.desc}</div>
                  </div>
                  {item.component}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-secondary)' }}>E-mail para notificações</label>
                <input className="login-input" defaultValue="ana.silva@sigma.studio" style={{ height: 36 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-secondary)' }}>Telefone para SMS</label>
                <input className="login-input" defaultValue="+55 11 98765-4321" style={{ height: 36 }} />
              </div>
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 16, marginTop: 32 }}>Tipos de Notificação</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Alarmes críticos', desc: 'Notificar imediatamente em alarmes críticos', component: <Toggle checked={criticalAlerts} onChange={() => setCriticalAlerts(!criticalAlerts)} /> },
                { label: 'Alertas de manutenção', desc: 'Notificar sobre manutenções programadas', component: <Toggle checked={maintenanceAlerts} onChange={() => setMaintenanceAlerts(!maintenanceAlerts)} /> },
                { label: 'Relatórios semanais', desc: 'Resumo semanal de operações', component: <Toggle checked={weeklyReports} onChange={() => setWeeklyReports(!weeklyReports)} /> },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{item.desc}</div>
                  </div>
                  {item.component}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Agrupar notificações</div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8 }}>Intervalo de agrupamento de notificações similares</div>
              <Slider value={groupInterval} onChange={setGroupInterval} min={1} max={60} suffix=" min" />
            </div>
          </section>
        )}

        {activeTab === 'seguranca' && (
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 16 }}>Autenticação</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Autenticação de dois fatores (2FA)', desc: 'Exigir código adicional além da senha', component: <Toggle checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} /> },
                { label: 'Sessões simultâneas', desc: 'Permitir múltiplas sessões ativas', component: <Toggle checked={simultaneousSessions} onChange={() => setSimultaneousSessions(!simultaneousSessions)} /> },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{item.desc}</div>
                  </div>
                  {item.component}
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 16, marginTop: 32 }}>Senha</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-secondary)' }}>Senha atual</label>
                <input className="login-input" type="password" placeholder="••••••••" style={{ height: 36 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-secondary)' }}>Nova senha</label>
                  <input className="login-input" type="password" placeholder="••••••••" style={{ height: 36 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-secondary)' }}>Confirmar</label>
                  <input className="login-input" type="password" placeholder="••••••••" style={{ height: 36 }} />
                </div>
              </div>
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 16, marginTop: 32 }}>Controle de Acesso</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-secondary)' }}>Tempo limite da sessão</label>
                <select className="login-input" defaultValue="60" style={{ height: 36, width: 200 }}><option value="15">15 minutos</option><option value="30">30 minutos</option><option value="60">60 minutos</option><option value="120">2 horas</option><option value="never">Nunca</option></select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-secondary)' }}>Lista de IPs permitidos</label>
                <textarea className="login-input" placeholder="192.168.1.0/24&#10;10.0.0.0/8" style={{ height: 80, padding: '8px 12px', resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 12 }} />
              </div>
              <button className="widget-action-btn" style={{ padding: '8px', width: 'auto', justifyContent: 'center', color: 'var(--danger)' }}>Encerrar todas as sessões</button>
            </div>
          </section>
        )}

        {activeTab === 'dispositivos' && (
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 16 }}>Comunicação</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-secondary)' }}>Protocolo padrão</label>
                <select className="login-input" defaultValue="MQTT" style={{ height: 36, width: 200 }}><option>MQTT</option><option>Modbus TCP</option><option>OPC-UA</option><option>HTTP</option><option>CoAP</option></select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-secondary)' }}>Intervalo de envio padrão</label>
                <select className="login-input" defaultValue="5s" style={{ height: 36, width: 200 }}><option value="1s">1 segundo</option><option value="5s">5 segundos</option><option value="30s">30 segundos</option><option value="1min">1 minuto</option><option value="5min">5 minutos</option></select>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Timeout de conexão</div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8 }}>Tempo máximo de espera por resposta do dispositivo</div>
                <Slider value={timeout} onChange={setTimeout_} min={5} max={120} suffix="s" />
              </div>
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 16, marginTop: 32 }}>Descoberta e Atualização</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Auto-descoberta', desc: 'Descobrir automaticamente novos dispositivos na rede', component: <Toggle checked={autoDiscovery} onChange={() => setAutoDiscovery(!autoDiscovery)} /> },
                { label: 'Firmware OTA automático', desc: 'Atualizar firmware automaticamente quando disponível', component: <Toggle checked={otaAuto} onChange={() => setOtaAuto(!otaAuto)} /> },
                { label: 'Retenção de dados', desc: 'Armazenar dados de telemetria localmente', component: <Toggle checked={dataRetention} onChange={() => setDataRetention(!dataRetention)} /> },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{item.desc}</div>
                  </div>
                  {item.component}
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'sistema' && (
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 16 }}>Informações do Sistema</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Versão do firmware', 'v2.4.1-build.20250710'],
                ['Gateway principal', 'GW-PRIME-01'],
                ['Banco de dados', 'TimescaleDB 2.14.2'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{value}</span>
                </div>
              ))}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>Espaço em disco</span>
                  <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>210GB / 500GB (42%)</span>
                </div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '42%', background: 'var(--success)', borderRadius: 2 }} />
                </div>
              </div>
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 16, marginTop: 32 }}>Manutenção e Logs</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Modo de manutenção', desc: 'Ativar modo de manutenção do sistema', component: <Toggle checked={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} /> },
                { label: 'Logs detalhados', desc: 'Registrar logs de debug para diagnóstico', component: <Toggle checked={detailedLogs} onChange={() => setDetailedLogs(!detailedLogs)} /> },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{item.desc}</div>
                  </div>
                  {item.component}
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 16, marginTop: 32 }}>Backup e Restauração</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-secondary)' }}>Backup automático</label>
                <select className="login-input" defaultValue="diario" style={{ height: 36, width: 200 }}><option value="diario">Diário</option><option value="semanal">Semanal</option><option value="mensal">Mensal</option><option value="nunca">Nunca</option></select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-secondary)' }}>Retenção de backups</label>
                <select className="login-input" defaultValue="30" style={{ height: 36, width: 200 }}><option value="7">7 dias</option><option value="14">14 dias</option><option value="30">30 dias</option><option value="90">90 dias</option></select>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="widget-action-btn" style={{ padding: '8px 16px', width: 'auto' }}>Verificar atualizações</button>
                <button className="widget-action-btn" style={{ padding: '8px 16px', width: 'auto', color: 'var(--danger)' }}>Limpar cache</button>
              </div>
            </div>
          </section>
        )}

        <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
          <button
            style={{ padding: '10px 24px', background: 'var(--fg)', color: 'var(--bg)', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={handleSave}
          >
            <Save size={16} /> Salvar alterações
          </button>
          <button className="widget-action-btn" style={{ padding: '10px 24px', width: 'auto', fontSize: 14 }}>Cancelar</button>
        </div>
      </div>

      {saved && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--success)', color: '#fff', padding: '12px 20px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500, zIndex: 200, boxShadow: 'var(--shadow-lg)' }}>
          Configurações salvas com sucesso
        </div>
      )}
    </div>
  )
}
