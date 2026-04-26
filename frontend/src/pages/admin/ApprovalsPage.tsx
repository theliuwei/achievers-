import { Button, Space, Tabs, Tag, message } from 'antd'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import {
  approveRegistration,
  fetchPendingRegistrations,
  rejectRegistration,
  type PendingUser,
} from '../../api/pendingRegistrations'
import {
  approveTenantApplication,
  fetchTenantApplications,
  rejectTenantApplication,
  type TenantApplicationRow,
} from '../../api/tenantApplications'

const fields: EntityFieldConfig<PendingUser>[] = [
  { key: 'id', title: 'ID', valueType: 'digit', form: false, search: true, table: { width: 72 } },
  { key: 'username', title: '用户名', valueType: 'text', form: false, search: true, table: { width: 150 } },
  { key: 'email', title: '邮箱', valueType: 'text', form: false, search: true, table: { width: 220, ellipsis: true } },
  { key: 'first_name', title: '名', valueType: 'text', form: false, search: true, table: { width: 120 } },
  { key: 'last_name', title: '姓', valueType: 'text', form: false, search: true, table: { width: 120 } },
  { key: 'date_joined', title: '申请时间', valueType: 'dateTime', form: false, search: false, table: { width: 180 } },
]

const applicationStatusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
]

const applicationFields: EntityFieldConfig<TenantApplicationRow>[] = [
  { key: 'id', title: 'ID', valueType: 'digit', form: false, search: true, table: { width: 72 } },
  { key: 'company_name', title: '公司名称', valueType: 'text', form: false, search: true, table: { width: 220 } },
  { key: 'company_code', title: '公司代码', valueType: 'text', form: false, search: true, table: { width: 150 } },
  { key: 'company_address', title: '公司地址', valueType: 'text', form: false, search: true, table: { width: 260, ellipsis: true } },
  { key: 'contact_name', title: '联系人', valueType: 'text', form: false, search: true, table: { width: 120 } },
  { key: 'contact_phone', title: '联系电话', valueType: 'text', form: false, search: true, table: { width: 150 } },
  { key: 'contact_email', title: '联系邮箱', valueType: 'text', form: false, search: true, table: { width: 220, ellipsis: true } },
  { key: 'admin_username', title: '管理员账号', valueType: 'text', form: false, search: true, table: { width: 150 } },
  { key: 'admin_email', title: '管理员邮箱', valueType: 'text', form: false, search: true, table: { width: 220, ellipsis: true } },
  { key: 'requested_max_members', title: '账号上限', valueType: 'digit', form: false, search: false, table: { width: 110 } },
  { key: 'requested_storage_quota_mb', title: '容量(MB)', valueType: 'digit', form: false, search: false, table: { width: 110 } },
  {
    key: 'status',
    title: '状态',
    valueType: 'select',
    options: applicationStatusOptions,
    form: false,
    search: true,
    table: {
      width: 100,
      render: (_, row) => {
        const color = row.status === 'approved' ? 'green' : row.status === 'rejected' ? 'red' : 'orange'
        const text = applicationStatusOptions.find((item) => item.value === row.status)?.label ?? row.status
        return <Tag color={color}>{text}</Tag>
      },
    },
  },
  { key: 'created_at', title: '申请时间', valueType: 'dateTime', form: false, search: false, table: { width: 180 } },
  { key: 'reviewed_at', title: '审核时间', valueType: 'dateTime', form: false, search: false, table: { width: 180 } },
  { key: 'reject_reason', title: '拒绝原因', valueType: 'text', form: false, search: false, table: { width: 180, ellipsis: true } },
]

const UserRegistrationApprovals = () => (
  <AdminTablePage<PendingUser>
    listTitle="用户注册审批"
    fields={fields}
    api={{ list: fetchPendingRegistrations }}
    rowKey="id"
    canCreate={false}
    canUpdate={false}
    canDelete={false}
    extraActions={(record, action) => (
      <Space>
        <Button
          type="link"
          size="small"
          onClick={async () => {
            await approveRegistration(record.id)
            message.success('已通过用户注册申请')
            action?.reload()
          }}
        >
          通过
        </Button>
        <Button
          danger
          type="link"
          size="small"
          onClick={async () => {
            await rejectRegistration(record.id)
            message.success('已拒绝用户注册申请')
            action?.reload()
          }}
        >
          拒绝
        </Button>
      </Space>
    )}
    tableScrollX={1000}
  />
)

const TenantApplicationApprovals = () => (
  <AdminTablePage<TenantApplicationRow>
    listTitle="公司入驻审批"
    fields={applicationFields}
    api={{ list: fetchTenantApplications }}
    rowKey="id"
    canCreate={false}
    canUpdate={false}
    canDelete={false}
    extraActions={(record, action) =>
      record.status === 'pending' ? (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={async () => {
              await approveTenantApplication(record.id)
              message.success('已通过公司入驻申请')
              action?.reload()
            }}
          >
            通过
          </Button>
          <Button
            danger
            type="link"
            size="small"
            onClick={async () => {
              await rejectTenantApplication(record.id, '运营审核拒绝')
              message.success('已拒绝公司入驻申请')
              action?.reload()
            }}
          >
            拒绝
          </Button>
        </Space>
      ) : null
    }
    tableScrollX={2300}
  />
)

const ApprovalsPage = () => (
  <Tabs
    defaultActiveKey="tenant-applications"
    items={[
      { key: 'tenant-applications', label: '公司入驻审批', children: <TenantApplicationApprovals /> },
      { key: 'users', label: '用户注册审批', children: <UserRegistrationApprovals /> },
    ]}
  />
)

export default ApprovalsPage
