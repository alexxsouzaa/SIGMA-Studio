import { useState, useEffect, useCallback } from "react"
import { Settings, BellRing, ShieldCheck, Cpu, Server, Save, Loader2 } from "lucide-react"
import { usePreferences } from "@/lib/hooks"
import { useThemeStore } from "@/stores/themeStore"
import { Toggle, Slider } from "@/components/shared/FormControls"

const TABS = [
  { id: "geral", label: "Geral", icon: Settings },
  { id: "notificacoes", label: "Notificações", icon: BellRing },
  { id: "seguranca", label: "Segurança", icon: ShieldCheck },
  { id: "dispositivos", label: "Dispositivos", icon: Cpu },
  { id: "sistema", label: "Sistema", icon: Server },
]

const DEFAULTS: Record<string, unknown> = {
  language: "pt-BR",
  timezone: "America/Sao_Paulo",
  dateFormat: "DD/MM/AAAA",
  compactSidebar: false,
  autoUpdate: true,
  telemetryInterval: 5,
  retention: 90,
  emailNotif: true,
  browserNotif: true,
  smsNotif: false,
  criticalAlerts: true,
  maintenanceAlerts: true,
  weeklyReports: true,
  groupInterval: 15,
  twoFactor: true,
  simultaneousSessions: true,
  sessionTimeout: "60",
  autoDiscovery: true,
  otaAuto: false,
  dataRetention: true,
  deviceTimeout: 30,
  maintenanceMode: false,
  detailedLogs: false,
  backupAuto: "diario",
  backupRetention: "30",
}

export default function SettingsPage() {
  const { preferences, isLoading, error, save } = usePreferences()
  const { theme, toggle: toggleTheme } = useThemeStore()
  const [activeTab, setActiveTab] = useState("geral")
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [form, setForm] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (!isLoading && preferences) {
      setForm({ ...DEFAULTS, ...preferences })
      if (typeof preferences.compactSidebar === 'boolean') {
        localStorage.setItem('sidebar-collapsed', String(preferences.compactSidebar))
      }
    }
  }, [isLoading, preferences])

  const get = useCallback((key: string) => form[key] ?? DEFAULTS[key], [form])

  const set = useCallback((key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  function handleThemeToggle() {
    toggleTheme()
    const newTheme = theme === "dark" ? "light" : "dark"
    setForm((prev) => ({ ...prev, darkTheme: newTheme === "dark" }))
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const ok = await save(form)
    setSaving(false)
    if (ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } else {
      setSaveError("Erro ao salvar Configurações. Tente novamente.")
    }
  }

  if (isLoading) {
    return (
      <div className="empty-state" style={{ padding: 60 }}>
        <Loader2 className="login-spinner" style={{ display: "block", animation: "spin 600ms linear infinite", width: 24, height: 24, border: "2px solid var(--border)", borderTopColor: "var(--fg)", borderRadius: "50%" }} />
        <div className="empty-state-text">Carregando Configurações...</div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", gap: 24, height: "100%" }}>
      <div style={{ width: 200, background: "var(--bg-secondary)", borderRight: "1px solid var(--border)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", padding: "8px 6px", flexShrink: 0 }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: "var(--radius-md)",
              fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 500,
              color: activeTab === tab.id ? "var(--fg)" : "var(--fg-secondary)",
              background: activeTab === tab.id ? "var(--surface-hover)" : "transparent",
              textAlign: "left", width: "100%",
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, maxWidth: 680, overflowY: "auto", display: "flex", flexDirection: "column", gap: 32 }}>
        {activeTab === "geral" && (
          <>
            <section>
              <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: "1px solid var(--border)", marginBottom: 16 }}>Preferências da Interface</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Idioma", desc: "Idioma da interface do SIGMA Studio", field: "language", component: <select className="login-input" value={String(get("language"))} onChange={(e) => set("language", e.target.value)} style={{ height: 36, width: 200 }}><option value="pt-BR">Portugues (BR)</option><option value="en">English</option><option value="es">Espanol</option></select> },
                  { label: "Fuso horario", desc: "Fuso horario para timestamps e relatorios", field: "timezone", component: <select className="login-input" value={String(get("timezone"))} onChange={(e) => set("timezone", e.target.value)} style={{ height: 36, width: 280 }}><option value="America/Sao_Paulo">America/Sao Paulo</option><option value="America/New_York">America/New York</option><option value="Europe/London">Europe/London</option></select> },
                  { label: "Formato de data", desc: "Formato usado para exibicao de datas", field: "dateFormat", component: <select className="login-input" value={String(get("dateFormat"))} onChange={(e) => set("dateFormat", e.target.value)} style={{ height: 36, width: 200 }}><option value="DD/MM/AAAA">DD/MM/AAAA</option><option value="MM/DD/AAAA">MM/DD/AAAA</option><option value="AAAA-MM-DD">AAAA-MM-DD</option></select> },
                  { label: "Tema escuro", desc: "Alternar entre modo claro e escuro", field: "darkTheme", component: <Toggle checked={theme === "dark"} onChange={handleThemeToggle} /> },
                  { label: "Compactar sidebar", desc: "Sidebar reduzida com apenas icones", field: "compactSidebar", component: <Toggle checked={Boolean(get("compactSidebar"))} onChange={() => {
                    const next = !get("compactSidebar")
                    set("compactSidebar", next)
                    localStorage.setItem('sidebar-collapsed', String(next))
                  }} /> },
                  { label: "Atualizacao automatica", desc: "Atualizar dados automaticamente em tempo real", field: "autoUpdate", component: <Toggle checked={Boolean(get("autoUpdate"))} onChange={() => set("autoUpdate", !get("autoUpdate"))} /> },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>{item.desc}</div>
                    </div>
                    {item.component}
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: "1px solid var(--border)", marginBottom: 16 }}>Coleta e Armazenamento</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Intervalo de telemetria</div>
                  <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 8 }}>Intervalo entre coletas de dados dos dispositivos</div>
                  <Slider value={Number(get("telemetryInterval"))} onChange={(v) => set("telemetryInterval", v)} min={1} max={30} suffix="s" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Retenção de dados</div>
                  <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 8 }}>Periodo de Retenção do historico de telemetria</div>
                  <Slider value={Number(get("retention"))} onChange={(v) => set("retention", v)} min={7} max={365} suffix=" dias" />
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === "notificacoes" && (
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: "1px solid var(--border)", marginBottom: 16 }}>Canais de Notificação</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "E-mail", desc: "Notificacoes por e-mail", field: "emailNotif", component: <Toggle checked={Boolean(get("emailNotif"))} onChange={() => set("emailNotif", !get("emailNotif"))} /> },
                { label: "Navegador", desc: "Notificacoes push do navegador", field: "browserNotif", component: <Toggle checked={Boolean(get("browserNotif"))} onChange={() => set("browserNotif", !get("browserNotif"))} /> },
                { label: "SMS", desc: "Notificacoes via SMS para telefone cadastrado", field: "smsNotif", component: <Toggle checked={Boolean(get("smsNotif"))} onChange={() => set("smsNotif", !get("smsNotif"))} /> },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>{item.desc}</div>
                  </div>
                  {item.component}
                </div>
              ))}
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: "1px solid var(--border)", marginBottom: 16, marginTop: 32 }}>Tipos de Notificação</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Alarmes criticos", desc: "Notificar imediatamente em alarmes criticos", field: "criticalAlerts", component: <Toggle checked={Boolean(get("criticalAlerts"))} onChange={() => set("criticalAlerts", !get("criticalAlerts"))} /> },
                { label: "Alertas de Manutenção", desc: "Notificar sobre manutencoes programadas", field: "maintenanceAlerts", component: <Toggle checked={Boolean(get("maintenanceAlerts"))} onChange={() => set("maintenanceAlerts", !get("maintenanceAlerts"))} /> },
                { label: "Relatorios semanais", desc: "Resumo semanal de operacoes", field: "weeklyReports", component: <Toggle checked={Boolean(get("weeklyReports"))} onChange={() => set("weeklyReports", !get("weeklyReports"))} /> },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>{item.desc}</div>
                  </div>
                  {item.component}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Agrupar notificacoes</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 8 }}>Intervalo de agrupamento de notificacoes similares</div>
              <Slider value={Number(get("groupInterval"))} onChange={(v) => set("groupInterval", v)} min={1} max={60} suffix=" min" />
            </div>
          </section>
        )}

        {activeTab === "seguranca" && (
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: "1px solid var(--border)", marginBottom: 16 }}>Autenticação</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Autenticação de dois fatores (2FA)", desc: "Exigir codigo adicional alem da senha", field: "twoFactor", component: <Toggle checked={Boolean(get("twoFactor"))} onChange={() => set("twoFactor", !get("twoFactor"))} /> },
                { label: "Sessões simultaneas", desc: "Permitir multiplas Sessões ativas", field: "simultaneousSessions", component: <Toggle checked={Boolean(get("simultaneousSessions"))} onChange={() => set("simultaneousSessions", !get("simultaneousSessions"))} /> },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>{item.desc}</div>
                  </div>
                  {item.component}
                </div>
              ))}
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: "1px solid var(--border)", marginBottom: 16, marginTop: 32 }}>Controle de Acesso</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-secondary)" }}>Tempo limite da sessao</label>
                <select className="login-input" value={String(get("sessionTimeout"))} onChange={(e) => set("sessionTimeout", e.target.value)} style={{ height: 36, width: 200 }}>
                  <option value="15">15 minutos</option><option value="30">30 minutos</option><option value="60">60 minutos</option><option value="120">2 horas</option><option value="never">Nunca</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {activeTab === "dispositivos" && (
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: "1px solid var(--border)", marginBottom: 16 }}>Comunicação</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Timeout de conexao</div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 8 }}>Tempo maximo de espera por resposta do dispositivo</div>
                <Slider value={Number(get("deviceTimeout"))} onChange={(v) => set("deviceTimeout", v)} min={5} max={120} suffix="s" />
              </div>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: "1px solid var(--border)", marginBottom: 16, marginTop: 32 }}>Automação</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Auto-descoberta", desc: "Descobrir automaticamente novos dispositivos na rede", field: "autoDiscovery", component: <Toggle checked={Boolean(get("autoDiscovery"))} onChange={() => set("autoDiscovery", !get("autoDiscovery"))} /> },
                { label: "Firmware OTA automatico", desc: "Atualizar firmware automaticamente quando disponivel", field: "otaAuto", component: <Toggle checked={Boolean(get("otaAuto"))} onChange={() => set("otaAuto", !get("otaAuto"))} /> },
                { label: "Retenção de dados", desc: "Armazenar dados de telemetria localmente", field: "dataRetention", component: <Toggle checked={Boolean(get("dataRetention"))} onChange={() => set("dataRetention", !get("dataRetention"))} /> },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>{item.desc}</div>
                  </div>
                  {item.component}
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "sistema" && (
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: "1px solid var(--border)", marginBottom: 16 }}>Informações do Sistema</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                ["Versao do firmware", "---"],
                ["Gateway principal", "---"],
                ["Banco de dados", "---"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "var(--fg-secondary)" }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, fontFamily: "var(--font-mono)" }}>{value}</span>
                </div>
              ))}
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: "1px solid var(--border)", marginBottom: 16, marginTop: 32 }}>Manutenção e Logs</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Modo de Manutenção", desc: "Ativar modo de Manutenção do sistema", field: "maintenanceMode", component: <Toggle checked={Boolean(get("maintenanceMode"))} onChange={() => set("maintenanceMode", !get("maintenanceMode"))} /> },
                { label: "Logs detalhados", desc: "Registrar logs de debug para diagnostico", field: "detailedLogs", component: <Toggle checked={Boolean(get("detailedLogs"))} onChange={() => set("detailedLogs", !get("detailedLogs"))} /> },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>{item.desc}</div>
                  </div>
                  {item.component}
                </div>
              ))}
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 600, paddingBottom: 10, borderBottom: "1px solid var(--border)", marginBottom: 16, marginTop: 32 }}>Backup e Restauração</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-secondary)" }}>Backup automatico</label>
                <select className="login-input" value={String(get("backupAuto"))} onChange={(e) => set("backupAuto", e.target.value)} style={{ height: 36, width: 200 }}>
                  <option value="diario">Diario</option><option value="semanal">Semanal</option><option value="mensal">Mensal</option><option value="nunca">Nunca</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-secondary)" }}>Retenção de backups</label>
                <select className="login-input" value={String(get("backupRetention"))} onChange={(e) => set("backupRetention", e.target.value)} style={{ height: 36, width: 200 }}>
                  <option value="7">7 dias</option><option value="14">14 dias</option><option value="30">30 dias</option><option value="90">90 dias</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {error && (
          <div style={{ color: "var(--danger)", fontSize: 13 }}>{error}</div>
        )}

        {saveError && (
          <div style={{ color: "var(--danger)", fontSize: 13, marginTop: -16 }}>{saveError}</div>
        )}

        <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
          <button
            style={{ padding: "10px 24px", background: "var(--fg)", color: "var(--bg)", borderRadius: "var(--radius-md)", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="login-spinner" style={{ display: "block", animation: "spin 600ms linear infinite", width: 16, height: 16, border: "2px solid var(--bg)", borderTopColor: "transparent", borderRadius: "50%" }} /> : <><Save size={16} /> Salvar Alterações</>}
          </button>
        </div>
      </div>

      {saved && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "var(--success)", color: "#fff", padding: "12px 20px", borderRadius: "var(--radius-md)", fontSize: 13, fontWeight: 500, zIndex: 200, boxShadow: "var(--shadow-lg)" }}>
          Configurações salvas com sucesso
        </div>
      )}
    </div>
  )
}

