import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tag, Tooltip } from 'antd'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import {
  createRole,
  deleteRole,
  fetchPermissions,
  fetchRoles,
  updateRole,
  type RolePayload,
  type RoleRow,
} from '../../api/roles'

type RoleFormValues = RolePayload & Record<string, unknown>

const activeOptions = [
  { label: '启用', value: true },
  { label: '停用', value: false },
]

const systemOptions = [
  { label: '是', value: true },
  { label: '否', value: false },
]

const dataScopeOptions = [
  { label: '本人数据', value: 'own' },
  { label: '部门/下属数据', value: 'department' },
  { label: '公司全部数据', value: 'tenant' },
  { label: '平台全部数据', value: 'all' },
]

const RoleManagePage = () => {
  const { data: permissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: fetchPermissions,
  })

  const permissionOptions = useMemo(
    () =>
      permissions.map((permission) => ({
        label: `${permission.name}（${permission.code}）`,
        value: permission.id,
      })),
    [permissions],
  )

  const permissionNameMap = useMemo(
    () => new Map(permissions.map((permission) => [permission.id, permission.name])),
    [permissions],
  )

  const fields = useMemo<EntityFieldConfig<RoleRow>[]>(
    () => [
      {
        key: 'id',
        title: 'ID',
        valueType: 'digit',
        form: false,
        search: true,
        table: { width: 72, sorter: true },
      },
      {
        key: 'code',
        title: '角色代码',
        valueType: 'text',
        search: true,
        form: {
          rules: [{ required: true, message: '请输入角色代码' }],
          readonlyOnEdit: true,
        },
        table: { width: 180, sorter: true },
      },
      {
        key: 'name',
        title: '角色名称',
        valueType: 'text',
        search: true,
        form: { rules: [{ required: true, message: '请输入角色名称' }] },
        table: { width: 160, sorter: true },
      },
      {
        key: 'description',
        title: '说明',
        valueType: 'textarea',
        search: true,
        table: { ellipsis: true, width: 240 },
      },
      {
        key: 'data_scope',
        title: '数据权限',
        valueType: 'select',
        options: dataScopeOptions,
        search: true,
        form: { rules: [{ required: true, message: '请选择数据权限' }] },
        table: {
          width: 140,
          render: (_, record) => (
            <Tag>{dataScopeOptions.find((item) => item.value === record.data_scope)?.label}</Tag>
          ),
        },
      },
      {
        key: 'permissions',
        title: '权限',
        valueType: 'select',
        options: permissionOptions,
        search: false,
        form: {
          componentProps: {
            mode: 'multiple',
            showSearch: true,
            optionFilterProp: 'label',
          },
        },
        table: { width: 280 },
        render: (_, record) => {
          const ids = record.permissions ?? []
          if (!ids.length) return <Tag>未绑定</Tag>
          const visible = ids.slice(0, 3)
          return (
            <>
              {visible.map((id) => (
                <Tag key={id}>{permissionNameMap.get(id) ?? `#${id}`}</Tag>
              ))}
              {ids.length > visible.length ? (
                <Tooltip title={ids.map((id) => permissionNameMap.get(id) ?? `#${id}`).join('、')}>
                  <Tag>+{ids.length - visible.length}</Tag>
                </Tooltip>
              ) : null}
            </>
          )
        },
      },
      {
        key: 'is_active',
        title: '启用',
        valueType: 'select',
        options: activeOptions,
        search: true,
        form: { rules: [{ required: true, message: '请选择启用状态' }] },
        table: {
          width: 96,
          render: (_, record) => (
            <Tag color={record.is_active ? 'green' : 'default'}>
              {record.is_active ? '启用' : '停用'}
            </Tag>
          ),
        },
      },
      {
        key: 'is_system',
        title: '系统内置',
        valueType: 'select',
        options: systemOptions,
        search: true,
        form: { rules: [{ required: true, message: '请选择是否系统内置' }] },
        table: {
          width: 110,
          render: (_, record) => (
            <Tag color={record.is_system ? 'blue' : 'default'}>
              {record.is_system ? '是' : '否'}
            </Tag>
          ),
        },
      },
      {
        key: 'created_at',
        title: '创建时间',
        valueType: 'dateTime',
        form: false,
        search: false,
        table: { width: 170, sorter: true },
      },
      {
        key: 'updated_at',
        title: '更新时间',
        valueType: 'dateTime',
        form: false,
        search: false,
        table: { width: 170, sorter: true },
      },
    ],
    [permissionNameMap, permissionOptions],
  )

  return (
    <AdminTablePage<RoleRow, RoleFormValues>
      listTitle="应用列表"
      fields={fields}
      api={{
        list: fetchRoles,
        create: createRole,
        update: (id, values) => updateRole(Number(id), values),
        remove: (id) => deleteRole(Number(id)),
      }}
      rowKey="id"
      createTitle="新增角色"
      editTitle="编辑角色"
      createDefaults={{ data_scope: 'own', is_active: true, is_system: false, permissions: [] }}
      transformSubmit={(values) => ({
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description?.trim() ?? '',
        data_scope: values.data_scope,
        is_active: values.is_active,
        is_system: values.is_system,
        permissions: values.permissions ?? [],
      })}
      tableScrollX={1500}
    />
  )
}

export default RoleManagePage
