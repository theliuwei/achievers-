import { Layout, Space, Typography } from 'antd'
import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

const { Header, Content } = Layout
const { Text } = Typography

/** 门户与登录注册页：顶栏 + 内容区（子路由由 Outlet 渲染） */
const PublicLayout = () => {
  const { access, logout } = useAuth()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingInline: 24,
          background: '#001529',
        }}
      >
        <Link to="/" style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
          Achievers
        </Link>
        <Space size="middle">
          {access ? (
            <>
              <Link to="/admin" style={{ color: '#69b1ff' }}>
                管理后台
              </Link>
              <Text style={{ color: 'rgba(255,255,255,0.85)' }}>已登录</Text>
              <Typography.Link style={{ color: '#69b1ff' }} onClick={() => logout()}>
                退出
              </Typography.Link>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#69b1ff' }}>
                登录
              </Link>
              <Link to="/register" style={{ color: '#69b1ff' }}>
                注册
              </Link>
            </>
          )}
        </Space>
      </Header>
      <Content style={{ background: '#f5f5f5' }}>
        <Outlet />
      </Content>
    </Layout>
  )
}

export default PublicLayout
