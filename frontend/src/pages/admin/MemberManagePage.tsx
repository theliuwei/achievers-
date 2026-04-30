import { useMemo } from 'react'
import { Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import {
  tenantMembershipApi,
  type TenantMembershipPayload,
  type TenantMembershipRow,
} from '../../api/business'
import {
  departmentOptions,
  membershipOptions,
  roleOptions,
  searchableSelectProps,
  tenantOptions,
  userOptions,
} from '../../api/options'

type MembershipFormValues = TenantMembershipPayload & Record<string, unknown>

const renderForeignDisplay = (displayValue?: string | null, id?: number | null) => {
  if (displayValue) return displayValue
  return id ?? '-'
}

const MemberManagePage = () => {
  const { t } = useTranslation('common')
  const statusOptions = useMemo(
    () => [
      { label: t('member.status.invited'), value: 'invited' },
      { label: t('member.status.active'), value: 'active' },
      { label: t('member.status.suspended'), value: 'suspended' },
    ],
    [t],
  )
  const fields = useMemo<EntityFieldConfig<TenantMembershipRow>[]>(
    () => [
      { key: 'id', title: t('fields.id'), valueType: 'digit', form: false, search: true, table: { width: 72 } },
      {
        key: 'tenant',
        title: t('member.fields.tenant'),
        valueType: 'select',
        search: { valueType: 'digit' },
        form: { rules: [{ required: true, message: t('member.validation.tenantRequired') }], request: tenantOptions, componentProps: searchableSelectProps },
        table: { width: 180, render: (_, row) => renderForeignDisplay(row.tenant_display, row.tenant) },
      },
      {
        key: 'user',
        title: t('member.fields.user'),
        valueType: 'select',
        search: { valueType: 'digit' },
        form: { rules: [{ required: true, message: t('member.validation.userRequired') }], request: userOptions, componentProps: searchableSelectProps },
        table: { width: 160, render: (_, row) => renderForeignDisplay(row.user_display, row.user) },
      },
      { key: 'title', title: t('member.fields.title'), valueType: 'text', search: true, table: { width: 160 } },
      { key: 'department', title: t('member.fields.department'), valueType: 'select', search: { valueType: 'digit' }, form: { request: departmentOptions, componentProps: searchableSelectProps }, table: { width: 140, render: (_, row) => renderForeignDisplay(row.department_display, row.department) } },
      { key: 'reports_to', title: t('member.fields.reportsTo'), valueType: 'select', search: { valueType: 'digit' }, form: { request: membershipOptions, componentProps: searchableSelectProps }, table: { width: 150, render: (_, row) => renderForeignDisplay(row.reports_to_display, row.reports_to) } },
      {
        key: 'status',
        title: t('member.fields.status'),
        valueType: 'select',
        options: statusOptions,
        search: true,
        form: { rules: [{ required: true, message: t('member.validation.statusRequired') }] },
        table: { width: 120, render: (_, row) => <Tag color={row.status === 'active' ? 'green' : row.status === 'invited' ? 'blue' : 'orange'}>{statusOptions.find((item) => item.value === row.status)?.label}</Tag> },
      },
      { key: 'invited_by', title: t('member.fields.invitedBy'), valueType: 'select', search: { valueType: 'digit' }, form: { request: userOptions, componentProps: searchableSelectProps }, table: { width: 140, render: (_, row) => renderForeignDisplay(row.invited_by_display, row.invited_by) } },
      { key: 'roles', title: t('member.fields.roles'), valueType: 'select', search: false, form: { request: roleOptions, componentProps: { ...searchableSelectProps, mode: 'multiple' } }, table: { width: 180, render: (_, row) => row.roles_display?.join('、') || '-' } },
      { key: 'created_at', title: t('fields.createdAt'), valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
      { key: 'updated_at', title: t('fields.updatedAt'), valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
    ],
    [statusOptions, t],
  )
  return (
    <AdminTablePage<TenantMembershipRow, MembershipFormValues>
      listTitle={t('common.listTitle')}
      fields={fields}
      api={tenantMembershipApi}
      rowKey="id"
      createTitle={t('member.actions.create')}
      editTitle={t('member.actions.edit')}
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
}

export default MemberManagePage
