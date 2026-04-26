import { Button, Space } from 'antd'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import {
  approveRegistration,
  fetchPendingRegistrations,
  rejectRegistration,
  type PendingUser,
} from '../../api/pendingRegistrations'

const fields: EntityFieldConfig<PendingUser>[] = [
  { key: 'id', title: 'ID', valueType: 'digit', form: false, search: true, table: { width: 72 } },
  { key: 'username', title: '用户名', valueType: 'text', form: false, search: true, table: { width: 150 } },
  { key: 'email', title: '邮箱', valueType: 'text', form: false, search: true, table: { width: 220, ellipsis: true } },
  { key: 'first_name', title: '名', valueType: 'text', form: false, search: true, table: { width: 120 } },
  { key: 'last_name', title: '姓', valueType: 'text', form: false, search: true, table: { width: 120 } },
  { key: 'date_joined', title: '申请时间', valueType: 'dateTime', form: false, search: false, table: { width: 180 } },
]

const ApprovalsPage = () => (
  <AdminTablePage<PendingUser>
    listTitle="应用列表"
    fields={fields}
    api={{
      list: fetchPendingRegistrations,
    }}
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

export default ApprovalsPage
