import { useMemo } from 'react'
import { Result, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import { consentLogApi, type ConsentLogRow } from '../../api/business'
import { useAuth } from '../../auth/useAuth'

const ConsentLogPage = () => {
  const { t } = useTranslation('common')
  const { hasPermission } = useAuth()
  const canView = hasPermission('consent.view')
  const fields = useMemo<EntityFieldConfig<ConsentLogRow>[]>(
    () => [
      { key: 'id', title: t('fields.id'), valueType: 'digit', form: false, search: true, table: { width: 72 } },
      { key: 'tenant', title: t('consent.fields.tenant'), valueType: 'digit', search: true, form: false, table: { width: 160, render: (_, row) => row.tenant_display || row.tenant || '-' } },
      { key: 'user', title: t('consent.fields.user'), valueType: 'digit', search: true, form: false, table: { width: 160, render: (_, row) => row.user_display || row.user || '-' } },
      {
        key: 'consent_type',
        title: t('consent.fields.type'),
        valueType: 'select',
        search: true,
        form: false,
        options: [
          { label: t('consent.types.cookie'), value: 'cookie' },
          { label: t('consent.types.privacyPolicy'), value: 'privacy_policy' },
          { label: t('consent.types.marketing'), value: 'marketing' },
          { label: t('consent.types.terms'), value: 'terms' },
        ],
      },
      {
        key: 'action',
        title: t('consent.fields.action'),
        valueType: 'select',
        search: true,
        form: false,
        options: [
          { label: t('consent.actions.accepted'), value: 'accepted' },
          { label: t('consent.actions.revoked'), value: 'revoked' },
          { label: t('consent.actions.updated'), value: 'updated' },
        ],
        table: {
          width: 120,
          render: (_, row) => {
            const color = row.action === 'accepted' ? 'green' : row.action === 'revoked' ? 'red' : 'blue'
            return <Tag color={color}>{t(`consent.actions.${row.action}`)}</Tag>
          },
        },
      },
      { key: 'policy_version', title: t('consent.fields.policyVersion'), valueType: 'text', search: true, form: false, table: { width: 150 } },
      { key: 'ip_address', title: t('consent.fields.ipAddress'), valueType: 'text', search: true, form: false, table: { width: 150 } },
      { key: 'user_agent', title: t('consent.fields.userAgent'), valueType: 'text', search: true, form: false, table: { width: 260, ellipsis: true } },
      { key: 'created_at', title: t('fields.createdAt'), valueType: 'dateTime', search: false, form: false, table: { width: 170 } },
    ],
    [t],
  )

  if (!canView) {
    return <Result status="403" title={t('permission.deniedTitle')} subTitle={t('permission.deniedDesc')} />
  }

  return (
    <AdminTablePage<ConsentLogRow>
      listTitle={t('consent.listTitle')}
      fields={fields}
      api={{ list: consentLogApi.list }}
      rowKey="id"
      canCreate={false}
      canUpdate={false}
      canDelete={false}
      tableScrollX={1700}
    />
  )
}

export default ConsentLogPage
