import { Route, Routes } from 'react-router-dom'
import { RequireAuth } from './auth/RequireAuth'
import AdminLayout from './layouts/AdminLayout'
import PublicLayout from './layouts/PublicLayout'
import ApprovalsPage from './pages/admin/ApprovalsPage'
import DashboardPage from './pages/admin/DashboardPage'
import MenuManagePage from './pages/admin/MenuManagePage'
import RoleManagePage from './pages/admin/RoleManagePage'
import SettingsPage from './pages/admin/SettingsPage'
import UserManagePage from './pages/admin/UserManagePage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

const App = () => (
  <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '48px 24px',
            }}
          >
            <LoginPage />
          </div>
        }
      />
      <Route
        path="/register"
        element={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '48px 24px',
            }}
          >
            <RegisterPage />
          </div>
        }
      />
    </Route>

    <Route
      path="/admin"
      element={
        <RequireAuth>
          <AdminLayout />
        </RequireAuth>
      }
    >
      <Route index element={<DashboardPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="settings/menus" element={<MenuManagePage />} />
      <Route path="settings/roles" element={<RoleManagePage />} />
      <Route path="settings/users" element={<UserManagePage />} />
      <Route path="settings/approvals" element={<ApprovalsPage />} />
    </Route>
  </Routes>
)

export default App
