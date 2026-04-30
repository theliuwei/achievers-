import { Layout, Space, Typography, theme } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { LanguageSwitcher } from '../components/i18n/LanguageSwitcher'
import { ThemeToggle } from '../theme'

const { useToken } = theme
const { Header, Content } = Layout
const { Text, Link: TypoLink } = Typography

/** 门户与登录注册页：顶栏 + 内容区（子路由由 Outlet 渲染） */
const PublicLayout = () => {
  const { access, logout } = useAuth()
  const { token } = useToken()
  const { t } = useTranslation('common')

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingInline: 24,
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Link to="/" style={{ color: token.colorText, fontSize: 18, fontWeight: 600 }}>
          Achievers
        </Link>
        <Space size="middle" align="center" wrap>
          <LanguageSwitcher />
          <ThemeToggle />
          {access ? (
            <>
              <Link to="/admin" style={{ color: token.colorLink }}>
                {t('publicLayout.admin')}
              </Link>
              <Text style={{ color: token.colorText }}>{t('publicLayout.loggedIn')}</Text>
              <TypoLink style={{ color: token.colorLink }} onClick={() => void logout()}>
                {t('publicLayout.logout')}
              </TypoLink>
            </>
          ) : (
            <>
              <Link to="/tenant-apply" style={{ color: token.colorLink }}>
                {t('publicLayout.tenantApply')}
              </Link>
              <Link to="/login" style={{ color: token.colorLink }}>
                {t('publicLayout.login')}
              </Link>
              <Link to="/register" style={{ color: token.colorLink }}>
                {t('publicLayout.register')}
              </Link>
            </>
          )}
        </Space>
      </Header>
      <Content style={{ background: token.colorBgLayout }}>
        <Outlet />
      </Content>
    </Layout>
  )
}

export default PublicLayout
