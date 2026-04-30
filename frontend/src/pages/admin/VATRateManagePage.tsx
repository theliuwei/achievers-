import { useMemo } from 'react'
import { Result, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import { type VATRatePayload, type VATRateRow, vatRateApi } from '../../api/business'
import { useAuth } from '../../auth/useAuth'

type VATRateFormValues = VATRatePayload & Record<string, unknown>

const VATRateManagePage = () => {
  const { t } = useTranslation('common')
  const { hasPermission } = useAuth()
  const canView = hasPermission('vat.view')
  const canCreate = hasPermission('vat.create')
  const canUpdate = hasPermission('vat.update')
  const canDelete = hasPermission('vat.delete')
  const fields = useMemo<EntityFieldConfig<VATRateRow>[]>(
    () => [
      { key: 'id', title: t('fields.id'), valueType: 'digit', form: false, search: true, table: { width: 72 } },
      { key: 'country_code', title: t('vat.fields.countryCode'), valueType: 'text', search: true, form: { rules: [{ required: true, message: t('vat.validation.countryRequired') }] }, table: { width: 120 } },
      { key: 'name', title: t('vat.fields.name'), valueType: 'text', search: true, form: { rules: [{ required: true, message: t('vat.validation.nameRequired') }] }, table: { width: 160 } },
      { key: 'rate', title: t('vat.fields.rate'), valueType: 'digit', search: false, form: { rules: [{ required: true, message: t('vat.validation.rateRequired') }] }, table: { width: 100 } },
      {
        key: 'is_price_included_default',
        title: t('vat.fields.priceMode'),
        valueType: 'select',
        options: [
          { label: t('vat.priceMode.inclusive'), value: true },
          { label: t('vat.priceMode.exclusive'), value: false },
        ],
        search: true,
        table: { width: 140, render: (_, row) => <Tag color={row.is_price_included_default ? 'blue' : 'default'}>{row.is_price_included_default ? t('vat.priceMode.inclusive') : t('vat.priceMode.exclusive')}</Tag> },
      },
      { key: 'effective_from', title: t('vat.fields.effectiveFrom'), valueType: 'date', search: false, form: { rules: [{ required: true, message: t('vat.validation.effectiveFromRequired') }] }, table: { width: 130 } },
      { key: 'effective_to', title: t('vat.fields.effectiveTo'), valueType: 'date', search: false, table: { width: 130 } },
      {
        key: 'is_active',
        title: t('status.label'),
        valueType: 'select',
        options: [
          { label: t('status.enabled'), value: true },
          { label: t('status.disabled'), value: false },
        ],
        search: true,
        form: { rules: [{ required: true, message: t('vat.validation.statusRequired') }] },
        table: { width: 90, render: (_, row) => <Tag color={row.is_active ? 'green' : 'default'}>{row.is_active ? t('status.enabled') : t('status.disabled')}</Tag> },
      },
      { key: 'updated_at', title: t('fields.updatedAt'), valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
    ],
    [t],
  )

  if (!canView) {
    return <Result status="403" title={t('permission.deniedTitle')} subTitle={t('permission.deniedDesc')} />
  }

  return (
    <AdminTablePage<VATRateRow, VATRateFormValues>
      listTitle={t('vat.listTitle')}
      fields={fields}
      api={vatRateApi}
      rowKey="id"
      canCreate={canCreate}
      canUpdate={canUpdate}
      canDelete={canDelete}
      createTitle={t('vat.actions.create')}
      editTitle={t('vat.actions.edit')}
      createDefaults={{ country_code: '', name: '', rate: '0', is_price_included_default: false, effective_from: '', effective_to: null, is_active: true }}
      transformSubmit={(values) => ({
        country_code: values.country_code.trim().toUpperCase(),
        name: values.name.trim(),
        rate: String(values.rate ?? '0'),
        is_price_included_default: values.is_price_included_default,
        effective_from: values.effective_from,
        effective_to: values.effective_to ?? null,
        is_active: values.is_active,
      })}
      tableScrollX={1400}
    />
  )
}

export default VATRateManagePage
