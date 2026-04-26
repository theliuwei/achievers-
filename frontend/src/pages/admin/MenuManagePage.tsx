import { Tag } from 'antd'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import {
  createNavMenuItem,
  deleteNavMenuItem,
  fetchNavMenuItems,
  updateNavMenuItem,
  type NavMenuItemPayload,
  type NavMenuItemRow,
} from '../../api/navMenuItems'

type MenuFormValues = NavMenuItemPayload & Record<string, unknown>

const activeOptions = [
  { label: '启用', value: true },
  { label: '停用', value: false },
]

const fields: EntityFieldConfig<NavMenuItemRow>[] = [
  { key: 'id', title: 'ID', valueType: 'digit', form: false, search: true, table: { width: 72 } },
  {
    key: 'title',
    title: '标题',
    valueType: 'text',
    search: true,
    form: { rules: [{ required: true, message: '请输入菜单标题' }] },
    table: { width: 160 },
  },
  {
    key: 'path',
    title: '前端路由',
    valueType: 'text',
    search: true,
    form: { placeholder: '如 /admin/products；分组菜单留空' },
    table: { width: 220, ellipsis: true },
  },
  {
    key: 'parent',
    title: '上级 ID',
    valueType: 'digit',
    search: true,
    form: { placeholder: '根菜单留空' },
    table: { width: 100, render: (_, row) => row.parent ?? '-' },
  },
  {
    key: 'icon',
    title: '图标',
    valueType: 'text',
    search: true,
    table: { width: 180 },
  },
  {
    key: 'permission_code',
    title: '权限码',
    valueType: 'text',
    search: true,
    table: { width: 220, ellipsis: true },
  },
  {
    key: 'sort_order',
    title: '排序',
    valueType: 'digit',
    search: true,
    form: { rules: [{ required: true, message: '请输入排序' }] },
    table: { width: 90, sorter: true },
  },
  {
    key: 'is_active',
    title: '启用',
    valueType: 'select',
    options: activeOptions,
    search: true,
    form: { rules: [{ required: true, message: '请选择启用状态' }] },
    table: {
      width: 90,
      render: (_, row) => (
        <Tag color={row.is_active ? 'green' : 'default'}>{row.is_active ? '启用' : '停用'}</Tag>
      ),
    },
  },
]

const MenuManagePage = () => (
  <AdminTablePage<NavMenuItemRow, MenuFormValues>
    listTitle="应用列表"
    fields={fields}
    api={{
      list: fetchNavMenuItems,
      create: createNavMenuItem,
      update: (id, values) => updateNavMenuItem(Number(id), values),
      remove: (id) => deleteNavMenuItem(Number(id)),
    }}
    rowKey="id"
    createTitle="新增菜单"
    editTitle="编辑菜单"
    createDefaults={{ parent: null, path: '', icon: '', permission_code: '', sort_order: 0, is_active: true }}
    transformSubmit={(values) => ({
      parent: values.parent ?? null,
      title: values.title.trim(),
      path: values.path?.trim() ?? '',
      icon: values.icon?.trim() ?? '',
      permission_code: values.permission_code?.trim() ?? '',
      sort_order: Number(values.sort_order ?? 0),
      is_active: values.is_active,
    })}
    tableScrollX={1200}
  />
)

export default MenuManagePage
