/**
 * 后台壳层：侧栏菜单数据仅来自 GET /api/v1/me/nav-menu/，不在此写死业务菜单项。
 * 文案、路由、权限过滤由后端与 Django Admin 管控；前端负责展示、路由跳转与布局交互。
 */
import {
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import {
  App,
  Avatar,
  Breadcrumb,
  Button,
  Dropdown,
  Empty,
  Layout,
  Menu,
  Space,
  Spin,
  theme,
  Typography,
} from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { NavMenuNode } from '../api/navMenu'
import { fetchNavMenu } from '../api/navMenu'
import { useAuth } from '../auth/useAuth'
import { renderMenuIcon } from './menuIcons'
import { findMenuTrail, trailToOpenKeys } from './navMenuUtils'
import './AdminLayout.css'

const { Header, Sider, Content, Footer } = Layout

const toAntdMenuItems = (nodes: NavMenuNode[]): MenuProps['items'] =>
  nodes.map((n) => ({
    key: n.key,
    icon: renderMenuIcon(n.icon),
    label: n.title,
    children: n.children?.length ? toAntdMenuItems(n.children) : undefined,
  }))

const AdminLayout = () => {
  const { message } = App.useApp()
  const [collapsed, setCollapsed] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = theme.useToken()

  const [navLoading, setNavLoading] = useState(true)
  const [navTree, setNavTree] = useState<NavMenuNode[]>([])

  const loadNavMenu = useCallback(async () => {
    setNavLoading(true)
    try {
      const data = await fetchNavMenu()
      setNavTree(Array.isArray(data) ? data : [])
    } catch (e) {
      message.error(e instanceof Error ? e.message : '加载菜单失败')
      setNavTree([])
    } finally {
      setNavLoading(false)
    }
  }, [message])

  useEffect(() => {
    // 挂载时向后端拉取菜单；状态更新在 loadNavMenu 的异步流程中完成
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 仅 mount 触发一次远端数据同步
    void loadNavMenu()
  }, [loadNavMenu])

  const trail = useMemo(
    () => findMenuTrail(location.pathname, navTree),
    [location.pathname, navTree],
  )

  const defaultOpenKeys = useMemo(() => trailToOpenKeys(trail), [trail])
  const menuInstanceKey = useMemo(
    () => `${location.pathname}::${navTree.map((n) => n.key).join(',')}`,
    [location.pathname, navTree],
  )

  const selectedKeys = useMemo(() => {
    if (trail?.length) {
      return [trail[trail.length - 1].key]
    }
    if (location.pathname.startsWith('/admin')) {
      return [location.pathname]
    }
    return []
  }, [trail, location.pathname])

  const menuItems = useMemo(() => toAntdMenuItems(navTree), [navTree])

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key.startsWith('/')) {
      navigate(key)
    }
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'portal',
      icon: <HomeOutlined />,
      label: <Link to="/">返回门户首页</Link>,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ]

  const onUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      logout()
      navigate('/login', { replace: true })
    }
  }

  const breadcrumbItems = useMemo(() => {
    if (trail?.length) {
      return trail.map((n, i) => ({
        title:
          i === trail.length - 1 ? (
            n.title
          ) : n.path ? (
            <Link to={n.path}>{n.title}</Link>
          ) : (
            n.title
          ),
      }))
    }
    return [{ title: '管理后台' }]
  }, [trail])

  return (
    <Layout className="admin-layout">
      <Sider
        className="admin-sider"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        theme="light"
        trigger={null}
      >
        <div
          className={`admin-sider-logo${collapsed ? ' admin-sider-logo-collapsed' : ''}`}
          title="Achievers 管理后台"
        >
          {collapsed ? 'A' : 'Achievers 后台'}
        </div>
        <Spin spinning={navLoading}>
          {navLoading ? (
            <div style={{ minHeight: 120 }} aria-hidden />
          ) : navTree.length === 0 ? (
            <div style={{ padding: '16px 12px' }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无导航数据。请在后端 Django Admin（导航菜单项）配置，并执行 seed 命令初始化。"
              />
              <Button type="link" block onClick={() => void loadNavMenu()}>
                重新加载
              </Button>
            </div>
          ) : (
            <Menu
              key={menuInstanceKey}
              mode="inline"
              selectedKeys={selectedKeys}
              defaultOpenKeys={defaultOpenKeys}
              items={menuItems}
              onClick={onMenuClick}
              style={{ borderInlineEnd: 0 }}
            />
          )}
        </Spin>
      </Sider>
      <Layout>
        <Header className="admin-header" style={{ height: 64, lineHeight: '64px' }}>
          <div className="admin-header-left">
            <span
              className="admin-header-trigger"
              onClick={() => setCollapsed((c) => !c)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setCollapsed((c) => !c)
                }
              }}
              aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <Space size="middle">
            <Dropdown
              menu={{ items: userMenuItems, onClick: onUserMenuClick }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{ backgroundColor: token.colorPrimary }}
                />
                <Typography.Text>账户</Typography.Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ background: token.colorBgLayout }}>
          <div className="admin-content-wrap">
            <Outlet />
          </div>
        </Content>
        <Footer className="admin-footer">
          Achievers Automation · 后台管理 © {new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
