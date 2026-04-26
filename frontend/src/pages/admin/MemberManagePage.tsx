import { Tag } from 'antd'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import {
  tenantMembershipApi,
  type TenantMembershipPayload,
  type TenantMembershipRow,
} from '../../api/business'

type MembershipFormValues = TenantMembershipPayload & Record<string, unknown>

const statusOptions = [
  { label: '已邀请', value: 'invited' },
  { label: '在册', value: 'active' },
  { label: '已暂停', value: 'suspended' },
]

const fields: EntityFieldConfig<TenantMembershipRow>[] = [
  { key: 'id', title: 'ID', valueType: 'digit', form: false, search: true, table: { width: 72 } },
  { key: 'tenant', title: '公司 ID', valueType: 'digit', search: true, form: { rules: [{ required: true, message: '请输入公司 ID' }] }, table: { width: 110 } },
  { key: 'user', title: '用户 ID', valueType: 'digit', search: true, form: { rules: [{ required: true, message: '请输入用户 ID' }] }, table: { width: 110 } },
  { key: 'title', title: '职位/备注', valueType: 'text', search: true, table: { width: 160 } },
  { key: 'department', title: '部门 ID', valueType: 'digit', search: true, table: { width: 110 } },
  { key: 'reports_to', title: '直属上级成员ID', valueType: 'digit', search: true, table: { width: 150 } },
  {
    key: 'status',
    title: '成员状态',
    valueType: 'select',
    options: statusOptions,
    search: true,
    form: { rules: [{ required: true, message: '请选择成员状态' }] },
    table: {
      width: 120,
      render: (_, row) => {
        const color = row.status === 'active' ? 'green' : row.status === 'invited' ? 'blue' : 'orange'
        return <Tag color={color}>{statusOptions.find((item) => item.value === row.status)?.label}</Tag>
      },
    },
  },
  { key: 'invited_by', title: '邀请人 ID', valueType: 'digit', search: true, table: { width: 120 } },
  { key: 'created_at', title: '创建时间', valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
  { key: 'updated_at', title: '更新时间', valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
]

const MemberManagePage = () => (
  <AdminTablePage<TenantMembershipRow, MembershipFormValues>
    listTitle="应用列表"
    fields={fields}
    api={tenantMembershipApi}
    rowKey="id"
    createTitle="新增成员"
    editTitle="编辑成员"
    createDefaults={{ status: 'active', title: '', department: null, reports_to: null, invited_by: null, roles: [] }}
    transformSubmit={(values) => ({
      tenant: Number(values.tenant),
      user: Number(values.user),
      status: values.status,
      title: values.title?.trim() ?? '',
      department: values.department ? Number(values.department) : null,
      reports_to: values.reports_to ? Number(values.reports_to) : null,
      invited_by: values.invited_by ? Number(values.invited_by) : null,
      roles: values.roles ?? [],
    })}
    tableScrollX={1500}
  />
)

export default MemberManagePage
