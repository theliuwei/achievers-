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
    key: 'subscription_expires_at',
    title: '订阅到期',
    valueType: 'dateTime',
    search: false,
    table: { width: 180 },
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
    createDefaults={{ is_active: true, subscription_expires_at: null }}
    transformSubmit={(values) => ({
      name: values.name.trim(),
      code: values.code.trim(),
      is_active: values.is_active,
      subscription_expires_at: values.subscription_expires_at ?? null,
    })}
    tableScrollX={1100}
  />
)

export default CompanyManagePage
