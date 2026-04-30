import { Button, Space, Tabs, Tag, message } from 'antd'
import { useTranslation } from 'react-i18next'
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

const UserRegistrationApprovals = () => {
  const { t } = useTranslation('common')
  const fields: EntityFieldConfig<PendingUser>[] = [
    { key: 'id', title: t('fields.id'), valueType: 'digit', form: false, search: true, table: { width: 72 } },
    { key: 'username', title: t('user.fields.username'), valueType: 'text', form: false, search: true, table: { width: 150 } },
    { key: 'email', title: t('user.fields.email'), valueType: 'text', form: false, search: true, table: { width: 220, ellipsis: true } },
    { key: 'first_name', title: t('user.fields.firstName'), valueType: 'text', form: false, search: true, table: { width: 120 } },
    { key: 'last_name', title: t('user.fields.lastName'), valueType: 'text', form: false, search: true, table: { width: 120 } },
    { key: 'date_joined', title: t('approval.fields.appliedAt'), valueType: 'dateTime', form: false, search: false, table: { width: 180 } },
  ]
  return (
    <AdminTablePage<PendingUser>
      listTitle={t('approval.userRegistration')}
      fields={fields}
      api={{ list: fetchPendingRegistrations }}
      rowKey="id"
      canCreate={false}
      canUpdate={false}
      canDelete={false}
      extraActions={(record, action) => (
        <Space>
          <Button type="link" size="small" onClick={async () => { await approveRegistration(record.id); message.success(t('approval.messages.userApproved')); action?.reload() }}>
            {t('approval.actions.approve')}
          </Button>
          <Button danger type="link" size="small" onClick={async () => { await rejectRegistration(record.id); message.success(t('approval.messages.userRejected')); action?.reload() }}>
            {t('approval.actions.reject')}
          </Button>
        </Space>
      )}
      tableScrollX={1000}
    />
  )
}

const TenantApplicationApprovals = () => {
  const { t } = useTranslation('common')
  const applicationStatusOptions = [
    { label: t('approval.status.pending'), value: 'pending' },
    { label: t('approval.status.approved'), value: 'approved' },
    { label: t('approval.status.rejected'), value: 'rejected' },
  ]
  const applicationFields: EntityFieldConfig<TenantApplicationRow>[] = [
    { key: 'id', title: t('fields.id'), valueType: 'digit', form: false, search: true, table: { width: 72 } },
    { key: 'company_name', title: t('company.fields.name'), valueType: 'text', form: false, search: true, table: { width: 220 } },
    { key: 'company_code', title: t('company.fields.code'), valueType: 'text', form: false, search: true, table: { width: 150 } },
    { key: 'company_address', title: t('company.fields.address'), valueType: 'text', form: false, search: true, table: { width: 260, ellipsis: true } },
    { key: 'contact_name', title: t('company.fields.contactName'), valueType: 'text', form: false, search: true, table: { width: 120 } },
    { key: 'contact_phone', title: t('company.fields.contactPhone'), valueType: 'text', form: false, search: true, table: { width: 150 } },
    { key: 'contact_email', title: t('company.fields.contactEmail'), valueType: 'text', form: false, search: true, table: { width: 220, ellipsis: true } },
    { key: 'admin_username', title: t('approval.fields.adminUsername'), valueType: 'text', form: false, search: true, table: { width: 150 } },
    { key: 'admin_email', title: t('approval.fields.adminEmail'), valueType: 'text', form: false, search: true, table: { width: 220, ellipsis: true } },
    { key: 'requested_max_members', title: t('company.fields.maxMembers'), valueType: 'digit', form: false, search: false, table: { width: 110 } },
    { key: 'requested_storage_quota_mb', title: t('approval.fields.storageMb'), valueType: 'digit', form: false, search: false, table: { width: 110 } },
    {
      key: 'status',
      title: t('status.label'),
      valueType: 'select',
      options: applicationStatusOptions,
      form: false,
      search: true,
      table: { width: 100, render: (_, row) => <Tag color={row.status === 'approved' ? 'green' : row.status === 'rejected' ? 'red' : 'orange'}>{applicationStatusOptions.find((item) => item.value === row.status)?.label ?? row.status}</Tag> },
    },
    { key: 'created_at', title: t('approval.fields.appliedAt'), valueType: 'dateTime', form: false, search: false, table: { width: 180 } },
    { key: 'reviewed_at', title: t('approval.fields.reviewedAt'), valueType: 'dateTime', form: false, search: false, table: { width: 180 } },
    { key: 'reject_reason', title: t('approval.fields.rejectReason'), valueType: 'text', form: false, search: false, table: { width: 180, ellipsis: true } },
  ]
  return (
    <AdminTablePage<TenantApplicationRow>
      listTitle={t('approval.tenantApplication')}
      fields={applicationFields}
      api={{ list: fetchTenantApplications }}
      rowKey="id"
      canCreate={false}
      canUpdate={false}
      canDelete={false}
      extraActions={(record, action) =>
        record.status === 'pending' ? (
          <Space>
            <Button type="link" size="small" onClick={async () => { await approveTenantApplication(record.id); message.success(t('approval.messages.tenantApproved')); action?.reload() }}>
              {t('approval.actions.approve')}
            </Button>
            <Button danger type="link" size="small" onClick={async () => { await rejectTenantApplication(record.id, t('approval.messages.reviewRejectReason')); message.success(t('approval.messages.tenantRejected')); action?.reload() }}>
              {t('approval.actions.reject')}
            </Button>
          </Space>
        ) : null
      }
      tableScrollX={2300}
    />
  )
}

const ApprovalsPage = () => {
  const { t } = useTranslation('common')
  return (
    <Tabs
      defaultActiveKey="tenant-applications"
      items={[
        { key: 'tenant-applications', label: t('approval.tenantApplication'), children: <TenantApplicationApprovals /> },
        { key: 'users', label: t('approval.userRegistration'), children: <UserRegistrationApprovals /> },
      ]}
    />
  )
}

export default ApprovalsPage
