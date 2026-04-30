/**
 * 全局明/暗与主色由 main.tsx 中的 AppThemeProvider（antd ConfigProvider + theme 算法）提供，
 * 子页面无需再包一层。顶栏切主题请使用 <ThemeToggle />（见 AdminLayout / PublicLayout）。
 */
import { Route, Routes } from 'react-router-dom'
import { RequireAuth } from './auth/RequireAuth'
import AdminLayout from './layouts/AdminLayout'
import PublicLayout from './layouts/PublicLayout'
import ApprovalsPage from './pages/admin/ApprovalsPage'
import CompanyManagePage from './pages/admin/CompanyManagePage'
import ConsentLogPage from './pages/admin/ConsentLogPage'
import CustomerManagePage from './pages/admin/CustomerManagePage'
import DashboardPage from './pages/admin/DashboardPage'
import InquiryManagePage from './pages/admin/InquiryManagePage'
import MemberManagePage from './pages/admin/MemberManagePage'
import MenuManagePage from './pages/admin/MenuManagePage'
import ProductManagePage from './pages/admin/ProductManagePage'
import ProductCategoryTranslationManagePage from './pages/admin/ProductCategoryTranslationManagePage'
import ProductTranslationManagePage from './pages/admin/ProductTranslationManagePage'
import ProfilePage from './pages/admin/ProfilePage'
import QuotationManagePage from './pages/admin/QuotationManagePage'
import RoleManagePage from './pages/admin/RoleManagePage'
import SettingsPage from './pages/admin/SettingsPage'
import UserManagePage from './pages/admin/UserManagePage'
import VATRateManagePage from './pages/admin/VATRateManagePage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TenantApplyPage from './pages/TenantApplyPage'

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
      <Route
        path="/tenant-apply"
        element={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '48px 24px',
            }}
          >
            <TenantApplyPage />
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
      <Route path="account/profile" element={<ProfilePage />} />
      <Route path="companies" element={<CompanyManagePage />} />
      <Route path="members" element={<MemberManagePage />} />
      <Route path="products" element={<ProductManagePage />} />
      <Route path="inquiries" element={<InquiryManagePage />} />
      <Route path="customers" element={<CustomerManagePage />} />
      <Route path="quotations" element={<QuotationManagePage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="settings/menus" element={<MenuManagePage />} />
      <Route path="settings/roles" element={<RoleManagePage />} />
      <Route path="settings/users" element={<UserManagePage />} />
      <Route path="settings/approvals" element={<ApprovalsPage />} />
      <Route path="settings/vat" element={<VATRateManagePage />} />
      <Route path="settings/consents" element={<ConsentLogPage />} />
      <Route path="settings/translations/products" element={<ProductTranslationManagePage />} />
      <Route path="settings/translations/categories" element={<ProductCategoryTranslationManagePage />} />
    </Route>
  </Routes>
)

export default App
