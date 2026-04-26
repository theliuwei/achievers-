import { Tag } from 'antd'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import { tenantApi, type TenantPayload, type TenantRow } from '../../api/business'

type TenantFormValues = TenantPayload & Record<string, unknown>

const activeOptions = [
  { label: '启用', value: true },
  { label: '停用', value: false },
]

const fields: EntityFieldConfig<TenantRow>[] = [
  { key: 'id', title: 'ID', valueType: 'digit', form: false, search: true, table: { width: 72 } },
  {
    key: 'name',
    title: '公司名称',
    valueType: 'text',
    search: true,
    form: { rules: [{ required: true, message: '请输入公司名称' }] },
    table: { width: 220 },
  },
  {
    key: 'code',
    title: '公司代码',
    valueType: 'text',
    search: true,
    form: { rules: [{ required: true, message: '请输入公司代码' }], readonlyOnEdit: true },
    table: { width: 160 },
  },
  {
    key: 'address',
    title: '公司地址',
    valueType: 'textarea',
    search: true,
    table: { width: 240, ellipsis: true },
  },
  {
    key: 'contact_name',
    title: '联系人',
    valueType: 'text',
    search: true,
    table: { width: 120 },
  },
  {
    key: 'contact_phone',
    title: '联系电话',
    valueType: 'text',
    search: true,
    table: { width: 150 },
  },
  {
    key: 'contact_email',
    title: '联系邮箱',
    valueType: 'text',
    search: true,
    table: { width: 200, ellipsis: true },
  },
  {
    key: 'primary_admin',
    title: '主管理员ID',
    valueType: 'digit',
    search: true,
    table: { width: 120 },
  },
  {
    key: 'subscription_starts_at',
    title: '服务开始',
    valueType: 'dateTime',
    search: false,
    table: { width: 180 },
  },
  {
    key: 'subscription_expires_at',
    title: '订阅到期',
    valueType: 'dateTime',
    search: false,
    table: { width: 180 },
  },
  {
    key: 'max_members',
    title: '账号上限',
    valueType: 'digit',
    search: false,
    form: { rules: [{ required: true, message: '请输入员工账号上限' }] },
    table: { width: 110 },
  },
  {
    key: 'active_member_count',
    title: '当前成员',
    valueType: 'digit',
    form: false,
    search: false,
    table: { width: 110 },
  },
  {
    key: 'storage_quota_mb',
    title: '容量上限(MB)',
    valueType: 'digit',
    search: false,
    form: { rules: [{ required: true, message: '请输入附件容量上限' }] },
    table: { width: 130 },
  },
  {
    key: 'storage_used_mb',
    title: '已用容量(MB)',
    valueType: 'digit',
    search: false,
    form: { rules: [{ required: true, message: '请输入已用容量' }] },
    table: { width: 130 },
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
        <Tag color={row.is_active && !row.is_subscription_expired ? 'green' : 'default'}>
          {row.is_subscription_expired ? '已到期' : row.is_active ? '启用' : '停用'}
        </Tag>
      ),
    },
  },
  {
    key: 'locked_reason',
    title: '锁定原因',
    valueType: 'textarea',
    search: false,
    table: { width: 180, ellipsis: true },
  },
  { key: 'created_at', title: '创建时间', valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
  { key: 'updated_at', title: '更新时间', valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
]

const CompanyManagePage = () => (
  <AdminTablePage<TenantRow, TenantFormValues>
    listTitle="应用列表"
    fields={fields}
    api={tenantApi}
    rowKey="id"
    createTitle="新增公司"
    editTitle="编辑公司"
    createDefaults={{
      address: '',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      primary_admin: null,
      is_active: true,
      subscription_starts_at: null,
      subscription_expires_at: null,
      max_members: 20,
      storage_quota_mb: 1024,
      storage_used_mb: 0,
      locked_reason: '',
    }}
    transformSubmit={(values) => ({
      name: values.name.trim(),
      code: values.code.trim(),
      address: values.address?.trim() ?? '',
      contact_name: values.contact_name?.trim() ?? '',
      contact_phone: values.contact_phone?.trim() ?? '',
      contact_email: values.contact_email?.trim() ?? '',
      primary_admin: values.primary_admin ?? null,
      is_active: values.is_active,
      subscription_starts_at: values.subscription_starts_at ?? null,
      subscription_expires_at: values.subscription_expires_at ?? null,
      max_members: values.max_members,
      storage_quota_mb: values.storage_quota_mb,
      storage_used_mb: values.storage_used_mb,
      locked_reason: values.locked_reason?.trim() ?? '',
    })}
    tableScrollX={2100}
  />
)

export default CompanyManagePage
