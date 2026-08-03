import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Bell, Download, Activity } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { KpiCards } from '@/features/dashboard/components/KpiCards'
import { TelemetryChart } from '@/features/dashboard/components/TelemetryChart'
import { DeviceStatus } from '@/features/dashboard/components/DeviceStatus'
import { AlarmsTable } from '@/features/dashboard/components/AlarmsTable'
import { GatewayStatus } from '@/features/dashboard/components/GatewayStatus'
import { ProtocolDistribution } from '@/features/dashboard/components/ProtocolDistribution'
import { AiInsights } from '@/features/dashboard/components/AiInsights'
import { DashboardWidgetSettings } from '@/features/dashboard/components/DashboardWidgetSettings'
import { useDashboardWidgets } from '@/features/dashboard/lib/useDashboardWidgets'

export function DashboardPage() {
  const { user } = useAuthStore()
  const { isVisible } = useDashboardWidgets()

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.r')
    if (!elements.length) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((el) => { el.classList.add('v') })
      return
    }
    let idx = 0
    const timer = setInterval(() => {
      if (idx < elements.length) {
        elements[idx].classList.add('v')
        idx++
      } else {
        clearInterval(timer)
      }
    }, 60)
    return () => clearInterval(timer)
  }, [isVisible])

  return (
    <>
      <div className="r">
        <div className="dash-welcome" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="dash-welcome-text">
              Ola, {user?.display_name?.split(' ')[0] ?? 'Usuario'}
              <span className="welcome-subtle"> - bom trabalho</span>
            </div>
            <div className="dash-welcome-sub">Planta Principal em operacao normal. Verifique os dispositivos para mais detalhes.</div>
          </div>
          <DashboardWidgetSettings />
        </div>

        <div className="dash-quick" style={{ marginTop: 12 }}>
          <Link to="/app/devices" className="dash-quick-btn"><Plus />Adicionar dispositivo</Link>
          <Link to="/app/alarms" className="dash-quick-btn"><Bell />Ver alarmes</Link>
          <Link to="/app/logs" className="dash-quick-btn"><Download />Exportar relatorio</Link>
          <Link to="/app/telemetry" className="dash-quick-btn"><Activity />Telemetria ao vivo</Link>
        </div>
      </div>

      {isVisible('kpis') && (
        <div className="r">
          <KpiCards />
        </div>
      )}

      {(isVisible('telemetry') || isVisible('devices')) && (
        <div className="dashboard-grid r">
          {isVisible('telemetry') && <TelemetryChart />}
          {isVisible('devices') && <DeviceStatus />}
        </div>
      )}

      {(isVisible('alarms') || isVisible('gateways')) && (
        <div className="dashboard-grid-3 r">
          {isVisible('alarms') && <AlarmsTable />}
          {isVisible('gateways') && <GatewayStatus />}
        </div>
      )}

      {(isVisible('protocols') || isVisible('ai')) && (
        <div className="dashboard-grid r">
          {isVisible('protocols') && <ProtocolDistribution />}
          {isVisible('ai') && <AiInsights />}
        </div>
      )}
    </>
  )
}
