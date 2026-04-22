import { App, Button, Input, Space, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useMemo, useState } from 'react'
import { fetchNavMenuItems, type NavMenuItemRow } from '../../api/navMenuItems'
import { MENU_MANAGE_PERMS } from '../../config/menu-manage-permissions'
import {
  ACTION_ICON_LABELS,
  AddIcon,
  DeleteIcon,
  EditIcon,
  QueryIcon,
  RefreshIcon,
} from '../../components/action-icons'
import { ListPageToolbar } from '../../components/list-page'
import { useAuth } from '../../auth/useAuth'

const { Title, Paragraph } = Typography

const MenuManagePage = () => {
  const { message } = App.useApp()
  const { hasPermission, permissionCodes } = useAuth()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<NavMenuItemRow[]>([])
  const [keywordDraft, setKeywordDraft] = useState('')
  const [keywordApplied, setKeywordApplied] = useState('')
  const [searchExpanded, setSearchExpanded] = useState(false)

  const permissionsReady = permissionCodes !== null
  const canList =
    permissionsReady &&
    (hasPermission(MENU_MANAGE_PERMS.query) || hasPermission(MENU_MANAGE_PERMS.refresh))

  const load = () => {
    if (!canList) {
      return
    }
    void (async () => {
      setLoading(true)
      try {
        const data = await fetchNavMenuItems()
        setRows(data)
      } catch (e) {
        message.error(e instanceof Error ? e.message : '加载失败')
        setRows([])
      } finally {
        setLoading(false)
      }
    })()
  }

  useEffect(() => {
    if (!permissionsReady) {
      return
    }
    if (!canList) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 无列表权限时跳过请求并复位 UI
      setLoading(false)
      setRows([])
      return
    }
    let alive = true
    void (async () => {
      setLoading(true)
      try {
        const data = await fetchNavMenuItems()
        if (!alive) {
          return
        }
        setRows(data)
      } catch (e) {
        if (!alive) {
          return
        }
        message.error(e instanceof Error ? e.message : '加载失败')
        setRows([])
      } finally {
        if (alive) {
          setLoading(false)
        }
      }
    })()
    return () => {
      alive = false
    }
  }, [message, permissionsReady, canList])

  const onApplyFilter = () => {
    setKeywordApplied(keywordDraft.trim())
  }

  const displayedRows = useMemo(() => {
    const allowFilter = hasPermission(MENU_MANAGE_PERMS.query)
    const k = keywordApplied.toLowerCase()
    if (!allowFilter || !k) {
      return rows
    }
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(k) ||
        r.path.toLowerCase().includes(k) ||
        r.permission_code.toLowerCase().includes(k) ||
        String(r.id).includes(k) ||
        (r.parent != null && String(r.parent).includes(k)),
    )
  }, [rows, keywordApplied, hasPermission])

  const columns: ColumnsType<NavMenuItemRow> = [
    { title: 'ID', dataIndex: 'id', width: 72 },
    { title: '标题', dataIndex: 'title' },
    { title: '路由', dataIndex: 'path', ellipsis: true },
    { title: '上级 ID', dataIndex: 'parent', width: 96, render: (v) => v ?? '—' },
    { title: '图标', dataIndex: 'icon', width: 140 },
    { title: '权限码', dataIndex: 'permission_code', ellipsis: true },
    { title: '排序', dataIndex: 'sort_order', width: 72 },
    {
      title: '启用',
      dataIndex: 'is_active',
      width: 72,
      render: (v: boolean) => (v ? '是' : '否'),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginTop: 0 }}>
        菜单管理
      </Title>
      <Paragraph type="secondary">
        数据来自后端 NavMenuItem。工具栏按钮靠右，与「查询」展开筛选区（字段与表格列：标题、路由、权限码、ID
        等）；按钮权限 menus.query / refresh / create / update / delete 与接口一致。
      </Paragraph>

      <ListPageToolbar
        showSearchToggle={hasPermission(MENU_MANAGE_PERMS.query)}
        searchExpanded={searchExpanded}
        onToggleSearch={() => setSearchExpanded((v) => !v)}
        searchContent={
          <Space wrap align="start">
            <Input
              placeholder="标题 / 路径 / 权限码 / ID"
              value={keywordDraft}
              onChange={(e) => setKeywordDraft(e.target.value)}
              onPressEnter={onApplyFilter}
              allowClear
              style={{ width: 280, maxWidth: '100%' }}
            />
            <Button
              icon={<QueryIcon />}
              type="primary"
              onClick={onApplyFilter}
              title="应用筛选"
              aria-label="应用筛选"
            />
          </Space>
        }
      >
        {hasPermission(MENU_MANAGE_PERMS.create) && (
          <Button
            type="primary"
            icon={<AddIcon />}
            onClick={() =>
              message.info('新增菜单表单将后续接入，当前请在 Django Admin 维护。')
            }
            title={ACTION_ICON_LABELS.add}
            aria-label={ACTION_ICON_LABELS.add}
          />
        )}
        {hasPermission(MENU_MANAGE_PERMS.update) && (
          <Button
            icon={<EditIcon />}
            disabled
            title={ACTION_ICON_LABELS.edit}
            aria-label={ACTION_ICON_LABELS.edit}
          />
        )}
        {hasPermission(MENU_MANAGE_PERMS.delete) && (
          <Button
            danger
            icon={<DeleteIcon />}
            disabled
            title={ACTION_ICON_LABELS.delete}
            aria-label={ACTION_ICON_LABELS.delete}
          />
        )}
        {hasPermission(MENU_MANAGE_PERMS.refresh) && (
          <Button
            icon={<RefreshIcon />}
            onClick={load}
            title={ACTION_ICON_LABELS.refresh}
            aria-label={ACTION_ICON_LABELS.refresh}
          />
        )}
      </ListPageToolbar>

      <Table<NavMenuItemRow>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={displayedRows}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        scroll={{ x: true }}
      />
    </div>
  )
}

export default MenuManagePage
