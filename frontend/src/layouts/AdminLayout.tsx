/**
 * 后台壳层：侧栏菜单数据仅来自 GET /api/v1/me/nav-menu/，不在此写死业务菜单项。
 * 文案、路由、权限过滤由后端与 Django Admin 管控；前端负责展示、路由跳转与布局交互。
 */
import {
  BellOutlined,
  GlobalOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
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
import { DEFAULT_AVATAR_URL } from '../api/me'
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

const getDisplayName = (user: ReturnType<typeof useAuth>['user']) => {
  if (!user) {
    return '未登录'
  }
  const fullName = [user.last_name, user.first_name].filter(Boolean).join('')
  return fullName || user.username || user.email || '用户'
}

const getAvatarText = (name: string) => {
  const trimmed = name.trim()
  return trimmed ? trimmed.slice(0, 1).toUpperCase() : undefined
}

const AdminLayout = () => {
  const { message } = App.useApp()
  const [collapsed, setCollapsed] = useState(false)
  const { access, logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = theme.useToken()

  const [navLoading, setNavLoading] = useState(true)
  const [navTree, setNavTree] = useState<NavMenuNode[]>([])

  const loadNavMenu = useCallback(async () => {
    if (!access) {
      setNavLoading(false)
      setNavTree([])
      return
    }
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
  }, [access, message])

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
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
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
    if (key === 'profile') {
      navigate('/admin/account/profile')
      return
    }
    if (key === 'logout') {
      logout()
      navigate('/login', { replace: true })
    }
  }

  const breadcrumbItems = useMemo(() => {
    const root = {
      title: <Link to="/admin">首页</Link>,
    }
    if (trail?.length) {
      return [
        root,
        ...trail.map((n, i) => ({
          title:
            i === trail.length - 1 ? (
              n.title
            ) : n.path ? (
              <Link to={n.path}>{n.title}</Link>
            ) : (
              n.title
            ),
        })),
      ]
    }
    return [root]
  }, [trail])

  const fallbackTitle = location.pathname === '/admin/account/profile' ? '个人中心' : '工作台'
  const pageTitle = trail?.length ? trail[trail.length - 1].title : fallbackTitle
  const displayName = getDisplayName(user)
  const avatarText = getAvatarText(displayName)
  const avatarUrl = user?.avatar_url || DEFAULT_AVATAR_URL

  return (
    <Layout className="admin-layout">
      <Sider
        className="admin-sider"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={180}
        theme="dark"
        trigger={null}
      >
        <div
          className={`admin-sider-logo${collapsed ? ' admin-sider-logo-collapsed' : ''}`}
          title="Ant Design Pro"
        >
          <span className="admin-sider-logo-mark" />
          {collapsed ? null : <span>Ant Design Pro</span>}
        </div>
        <Spin spinning={navLoading}>
          {navLoading ? (
            <div style={{ minHeight: 120 }} aria-hidden />
          ) : navTree.length === 0 ? (
            <div style={{ padding: '16px 12px' }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无导航数据。请在后端 Django Admin（导航菜单项）配置，并执行 seed 命令初始化。"
                styles={{ description: { color: token.colorTextSecondary } }}
              />
              <Button type="link" block onClick={() => void loadNavMenu()}>
                重新加载
              </Button>
            </div>
          ) : (
            <Menu
              key={menuInstanceKey}
              mode="inline"
              theme="dark"
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
        <Header
          className="admin-header"
        >
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
          </div>
          <Space size="middle" align="center" className="admin-header-actions">
            <SearchOutlined />
            <BellOutlined />
            <Dropdown
              menu={{ items: userMenuItems, onClick: onUserMenuClick }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  size="small"
                  src={avatarUrl}
                  icon={avatarUrl || avatarText ? undefined : <UserOutlined />}
                  style={{ backgroundColor: token.colorPrimary }}
                >
                  {avatarUrl ? null : avatarText}
                </Avatar>
                <Typography.Text className="admin-header-username">
                  {displayName}
                </Typography.Text>
              </Space>
            </Dropdown>
            <GlobalOutlined />
          </Space>
        </Header>
        <Content>
          <div className="admin-content-wrap">
            <div className="admin-page-header">
              <Breadcrumb items={breadcrumbItems} />
              <Typography.Title level={4} style={{ margin: '12px 0 0' }}>
                {pageTitle}
              </Typography.Title>
            </div>
            <Outlet />
          </div>
        </Content>
        <Footer className="admin-footer">
          <Space split={<span>·</span>}>
            <span>Ant Design Pro</span>
            <span>Ant Design</span>
          </Space>
          <div>Copyright © 2026 Achievers Automation</div>
        </Footer>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
