import { useMemo } from 'react'
import { Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import { tenantApi, type TenantPayload, type TenantRow } from '../../api/business'
import { searchableSelectProps, userOptions } from '../../api/options'

type TenantFormValues = TenantPayload & Record<string, unknown>

const renderDisplay = (displayValue?: string | null, id?: number | null) => displayValue || id || '-'

const CompanyManagePage = () => {
  const { t } = useTranslation('common')

  const activeOptions = useMemo(
    () => [
      { label: t('status.enabled'), value: true },
      { label: t('status.disabled'), value: false },
    ],
    [t],
  )

  const fields = useMemo<EntityFieldConfig<TenantRow>[]>(
    () => [
      { key: 'id', title: t('fields.id'), valueType: 'digit', form: false, search: true, table: { width: 72 } },
      {
        key: 'name',
        title: t('company.fields.name'),
        valueType: 'text',
        search: true,
        form: { rules: [{ required: true, message: t('company.validation.nameRequired') }] },
        table: { width: 220 },
      },
      {
        key: 'code',
        title: t('company.fields.code'),
        valueType: 'text',
        search: true,
        form: { rules: [{ required: true, message: t('company.validation.codeRequired') }], readonlyOnEdit: true },
        table: { width: 160 },
      },
      { key: 'address', title: t('company.fields.address'), valueType: 'textarea', search: true, table: { width: 240, ellipsis: true } },
      { key: 'contact_name', title: t('company.fields.contactName'), valueType: 'text', search: true, table: { width: 120 } },
      { key: 'contact_phone', title: t('company.fields.contactPhone'), valueType: 'text', search: true, table: { width: 150 } },
      { key: 'contact_email', title: t('company.fields.contactEmail'), valueType: 'text', search: true, table: { width: 200, ellipsis: true } },
      {
        key: 'primary_admin',
        title: t('company.fields.primaryAdmin'),
        valueType: 'select',
        search: { valueType: 'digit' },
        form: { request: userOptions, componentProps: searchableSelectProps },
        table: { width: 160, render: (_, row) => renderDisplay(row.primary_admin_display, row.primary_admin) },
      },
      { key: 'subscription_starts_at', title: t('company.fields.subscriptionStart'), valueType: 'dateTime', search: false, table: { width: 180 } },
      { key: 'subscription_expires_at', title: t('company.fields.subscriptionExpire'), valueType: 'dateTime', search: false, table: { width: 180 } },
      {
        key: 'max_members',
        title: t('company.fields.maxMembers'),
        valueType: 'digit',
        search: false,
        form: { rules: [{ required: true, message: t('company.validation.maxMembersRequired') }] },
        table: { width: 110 },
      },
      { key: 'active_member_count', title: t('company.fields.activeMembers'), valueType: 'digit', form: false, search: false, table: { width: 110 } },
      {
        key: 'storage_quota_mb',
        title: t('company.fields.storageQuotaMb'),
        valueType: 'digit',
        search: false,
        form: { rules: [{ required: true, message: t('company.validation.storageQuotaRequired') }] },
        table: { width: 130 },
      },
      {
        key: 'storage_used_mb',
        title: t('company.fields.storageUsedMb'),
        valueType: 'digit',
        search: false,
        form: { rules: [{ required: true, message: t('company.validation.storageUsedRequired') }] },
        table: { width: 130 },
      },
      {
        key: 'is_active',
        title: t('status.label'),
        valueType: 'select',
        options: activeOptions,
        search: true,
        form: { rules: [{ required: true, message: t('company.validation.statusRequired') }] },
        table: {
          width: 90,
          render: (_, row) => (
            <Tag color={row.is_active && !row.is_subscription_expired ? 'green' : 'default'}>
              {row.is_subscription_expired ? t('company.status.expired') : row.is_active ? t('status.enabled') : t('status.disabled')}
            </Tag>
          ),
        },
      },
      { key: 'locked_reason', title: t('company.fields.lockReason'), valueType: 'textarea', search: false, table: { width: 180, ellipsis: true } },
      { key: 'created_at', title: t('fields.createdAt'), valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
      { key: 'updated_at', title: t('fields.updatedAt'), valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
    ],
    [activeOptions, t],
  )

  return (
    <AdminTablePage<TenantRow, TenantFormValues>
      listTitle={t('common.listTitle')}
      fields={fields}
      api={tenantApi}
      rowKey="id"
      createTitle={t('company.actions.create')}
      editTitle={t('company.actions.edit')}
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
}

export default CompanyManagePage
