import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import DevicesPage from '@/features/devices/pages/DevicesPage'
import AlarmsPage from '@/features/alarms/pages/AlarmsPage'
import TelemetryPage from '@/features/telemetry/pages/TelemetryPage'
import GatewaysPage from '@/features/gateways/pages/GatewaysPage'
import FirmwarePage from '@/features/firmware/pages/FirmwarePage'
import IAPage from '@/features/ia/pages/IAPage'
import LogsPage from '@/features/logs/pages/LogsPage'
import SearchPage from '@/features/search/pages/SearchPage'
import ProfilePage from '@/features/profile/pages/ProfilePage'
import SettingsPage from '@/features/settings/pages/SettingsPage'
import LandingPage from '@/features/landing/pages/LandingPage'
import { Sidebar, Topbar } from '@/features/dashboard/components/layout/AppShell'
import { useAuthStore } from '@/stores/authStore'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }
  return <>{children}</>
}

function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <Topbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      checkAuth()
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/app/devices" element={<DevicesPage />} />
          <Route path="/app/alarms" element={<AlarmsPage />} />
          <Route path="/app/telemetry" element={<TelemetryPage />} />
          <Route path="/app/gateways" element={<GatewaysPage />} />
          <Route path="/app/firmware" element={<FirmwarePage />} />
          <Route path="/app/ia" element={<IAPage />} />
          <Route path="/app/logs" element={<LogsPage />} />
          <Route path="/app/search" element={<SearchPage />} />
          <Route path="/app/profile" element={<ProfilePage />} />
          <Route path="/app/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
