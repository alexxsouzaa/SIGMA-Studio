import { useEffect, useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import LandingPage from '@/features/landing/pages/LandingPage'
import { Sidebar, Topbar } from '@/features/dashboard/components/layout/AppShell'
import { useAuthStore } from '@/stores/authStore'
import { hasPermission } from '@/lib/permissions'
import { LoadingSpinner } from '@/components/shared/StatusStates'

const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const DevicesPage = lazy(() => import('@/features/devices/pages/DevicesPage'))
const AlarmsPage = lazy(() => import('@/features/alarms/pages/AlarmsPage'))
const TelemetryPage = lazy(() => import('@/features/telemetry/pages/TelemetryPage'))
const GatewaysPage = lazy(() => import('@/features/gateways/pages/GatewaysPage'))
const FirmwarePage = lazy(() => import('@/features/firmware/pages/FirmwarePage'))
const IAPage = lazy(() => import('@/features/ia/pages/IAPage'))
const LogsPage = lazy(() => import('@/features/logs/pages/LogsPage'))
const SearchPage = lazy(() => import('@/features/search/pages/SearchPage'))
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'))
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'))
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage'))

function LazyFallback() {
  return <LoadingSpinner />
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PermissionRoute({ permission, children }: { permission: string; children: React.ReactNode }) {
  const { user } = useAuthStore()
  if (!hasPermission(user, permission)) return <Navigate to="/app" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/app" replace />
  return <>{children}</>
}

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} />
      <Topbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="main-content">
        <Suspense fallback={<LazyFallback />}>
          <Outlet />
        </Suspense>
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
          <Route path="/app" element={<PermissionRoute permission="dashboard"><DashboardPage /></PermissionRoute>} />
          <Route path="/app/devices" element={<PermissionRoute permission="devices"><DevicesPage /></PermissionRoute>} />
          <Route path="/app/alarms" element={<PermissionRoute permission="alarms"><AlarmsPage /></PermissionRoute>} />
          <Route path="/app/telemetry" element={<PermissionRoute permission="telemetry"><TelemetryPage /></PermissionRoute>} />
          <Route path="/app/gateways" element={<PermissionRoute permission="gateways"><GatewaysPage /></PermissionRoute>} />
          <Route path="/app/firmware" element={<PermissionRoute permission="firmware"><FirmwarePage /></PermissionRoute>} />
          <Route path="/app/ia" element={<PermissionRoute permission="ia"><IAPage /></PermissionRoute>} />
          <Route path="/app/logs" element={<PermissionRoute permission="logs"><LogsPage /></PermissionRoute>} />
          <Route path="/app/search" element={<PermissionRoute permission="search"><SearchPage /></PermissionRoute>} />
          <Route path="/app/profile" element={<PermissionRoute permission="profile"><ProfilePage /></PermissionRoute>} />
          <Route path="/app/settings" element={<PermissionRoute permission="settings"><SettingsPage /></PermissionRoute>} />
          <Route path="/app/users" element={<PermissionRoute permission="users"><UsersPage /></PermissionRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
