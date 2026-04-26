import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Space, Tag } from 'antd'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import { fetchRoles } from '../../api/roles'
import { fetchUsers, userApi, type UserPayload, type UserRow } from '../../api/users'

type UserFormValues = UserPayload & Record<string, unknown>

const activeOptions = [
  { label: '启用', value: true },
  { label: '停用', value: false },
]

const staffOptions = [
  { label: '是', value: true },
  { label: '否', value: false },
]

const userKindOptions = [
  { label: '平台运营方', value: 'platform' },
  { label: '企业用户', value: 'tenant' },
]

const UserManagePage = () => {
  const { data: rolePage } = useQuery({
    queryKey: ['roles', 'options'],
    queryFn: () => fetchRoles({ page: 1, page_size: 200 }),
  })

  const roleOptions = useMemo(
    () =>
      (rolePage?.data ?? []).map((role) => ({
        label: `${role.name}（${role.code}）`,
        value: role.id,
      })),
    [rolePage],
  )

  const fields = useMemo<EntityFieldConfig<UserRow>[]>(
    () => [
      { key: 'id', title: 'ID', valueType: 'digit', form: false, search: true, table: { width: 72 } },
      {
        key: 'username',
        title: '用户名',
        valueType: 'text',
        search: true,
        form: { rules: [{ required: true, message: '请输入用户名' }], readonlyOnEdit: true },
        table: { width: 140, sorter: true },
      },
      {
        key: 'email',
        title: '邮箱',
        valueType: 'text',
        search: true,
        form: { rules: [{ required: true, message: '请输入邮箱' }] },
        table: { width: 220, ellipsis: true },
      },
      {
        key: 'password',
        title: '密码',
        valueType: 'text',
        table: false,
        search: false,
        form: { placeholder: '编辑时留空表示不修改密码' },
      },
      { key: 'first_name', title: '名', valueType: 'text', search: true, table: { width: 120 } },
      { key: 'last_name', title: '姓', valueType: 'text', search: true, table: { width: 120 } },
      {
        key: 'user_kind',
        title: '身份类型',
        valueType: 'select',
        options: userKindOptions,
        search: true,
        form: { rules: [{ required: true, message: '请选择身份类型' }] },
        table: {
          width: 120,
          render: (_, row) => (
            <Tag color={row.user_kind === 'platform' ? 'blue' : 'cyan'}>
              {row.user_kind === 'platform' ? '平台' : '企业'}
            </Tag>
          ),
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
          width: 90,
          render: (_, row) => (
            <Tag color={row.is_active ? 'green' : 'default'}>{row.is_active ? '启用' : '停用'}</Tag>
          ),
        },
      },
      {
        key: 'is_staff',
        title: '后台登录',
        valueType: 'select',
        options: staffOptions,
        search: true,
        form: { rules: [{ required: true, message: '请选择后台登录权限' }] },
        table: {
          width: 110,
          render: (_, row) => <Tag color={row.is_staff ? 'blue' : 'default'}>{row.is_staff ? '是' : '否'}</Tag>,
        },
      },
      {
        key: 'default_tenant',
        title: '默认公司 ID',
        valueType: 'digit',
        search: true,
        form: false,
        table: false,
      },
      {
        key: 'role_ids',
        title: '角色',
        valueType: 'select',
        options: roleOptions,
        search: false,
        table: false,
        form: { componentProps: { mode: 'multiple', showSearch: true, optionFilterProp: 'label' } },
      },
      {
        key: 'roles',
        title: '角色',
        search: false,
        form: false,
        table: {
          width: 220,
          render: (_, row) => (
            <Space wrap size={[0, 4]}>
              {row.roles?.length ? row.roles.map((role) => <Tag key={role.id}>{role.name}</Tag>) : <Tag>未绑定</Tag>}
            </Space>
          ),
        },
      },
      { key: 'created_at', title: '创建时间', valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
      { key: 'updated_at', title: '更新时间', valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
    ],
    [roleOptions],
  )

  return (
    <AdminTablePage<UserRow, UserFormValues>
      listTitle="应用列表"
      fields={fields}
      api={{ ...userApi, list: fetchUsers }}
      rowKey="id"
      createTitle="新增用户"
      editTitle="编辑用户"
      createDefaults={{ is_active: true, is_staff: false, user_kind: 'tenant', role_ids: [] }}
      recordToFormValues={(record) => ({
        ...record,
        role_ids: record.roles.map((role) => role.id),
      })}
      transformSubmit={(values, editing) => {
        const payload: UserPayload = {
          username: values.username.trim(),
          email: values.email.trim(),
          first_name: values.first_name?.trim() ?? '',
          last_name: values.last_name?.trim() ?? '',
          is_active: values.is_active,
          is_staff: values.is_staff,
          user_kind: values.user_kind,
          default_tenant: values.default_tenant ?? null,
          role_ids: values.role_ids ?? [],
        }
        if (!editing || values.password) {
          payload.password = values.password
        }
        return payload
      }}
      tableScrollX={1500}
    />
  )
}

export default UserManagePage
