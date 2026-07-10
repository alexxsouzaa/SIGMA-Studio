import { Sidebar } from '@/features/dashboard/components/Sidebar'
import { Topbar } from '@/features/dashboard/components/Topbar'
import { KpiCards } from '@/features/dashboard/components/KpiCards'
import { TelemetryChart } from '@/features/dashboard/components/TelemetryChart'
import { DeviceStatus } from '@/features/dashboard/components/DeviceStatus'
import { AlarmsTable } from '@/features/dashboard/components/AlarmsTable'
import { GatewayStatus } from '@/features/dashboard/components/GatewayStatus'
import { ProtocolDistribution } from '@/features/dashboard/components/ProtocolDistribution'
import { AiInsights } from '@/features/dashboard/components/AiInsights'

export function DashboardPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <Topbar />
      <main className="main-content">
        <KpiCards />
        <div className="dashboard-grid">
          <TelemetryChart />
          <DeviceStatus />
        </div>
        <div className="dashboard-grid-3">
          <AlarmsTable />
          <GatewayStatus />
        </div>
        <div className="dashboard-grid">
          <ProtocolDistribution />
          <AiInsights />
        </div>
      </main>
    </div>
  )
}
