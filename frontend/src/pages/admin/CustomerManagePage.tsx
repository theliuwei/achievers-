import { useMemo } from 'react'
import { Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import { customerApi, type CustomerPayload, type CustomerRow } from '../../api/business'
import { searchableSelectProps, tenantOptions, userOptions } from '../../api/options'

type CustomerFormValues = CustomerPayload & Record<string, unknown>

const renderDisplay = (displayValue?: string | null, id?: number | null) => displayValue || id || '-'

const CustomerManagePage = () => {
  const { t } = useTranslation('common')
  const levelOptions = useMemo(
    () => [
      { label: t('customer.level.normal'), value: 'normal' },
      { label: t('customer.level.important'), value: 'important' },
    ],
    [t],
  )
  const fields = useMemo<EntityFieldConfig<CustomerRow>[]>(
    () => [
      { key: 'id', title: t('fields.id'), valueType: 'digit', form: false, search: true, table: { width: 72 } },
      {
        key: 'tenant',
        title: t('customer.fields.tenant'),
        valueType: 'select',
        search: { valueType: 'digit' },
        form: { rules: [{ required: true, message: t('customer.validation.tenantRequired') }], request: tenantOptions, componentProps: searchableSelectProps },
        table: { width: 180, render: (_, row) => renderDisplay(row.tenant_display, row.tenant) },
      },
      { key: 'name', title: t('customer.fields.name'), valueType: 'text', search: true, form: { rules: [{ required: true, message: t('customer.validation.nameRequired') }] }, table: { width: 150 } },
      { key: 'company_name', title: t('customer.fields.companyName'), valueType: 'text', search: true, table: { width: 220, ellipsis: true } },
      { key: 'country', title: t('customer.fields.country'), valueType: 'text', search: true, table: { width: 120 } },
      { key: 'email', title: t('customer.fields.email'), valueType: 'text', search: true, table: { width: 220, ellipsis: true } },
      { key: 'phone', title: t('customer.fields.phone'), valueType: 'text', search: true, table: false, form: false },
      { key: 'whatsapp', title: t('customer.fields.whatsapp'), valueType: 'text', search: true, table: { width: 140 } },
      { key: 'source', title: t('customer.fields.source'), valueType: 'text', search: true, table: { width: 120 } },
      {
        key: 'level',
        title: t('customer.fields.level'),
        valueType: 'select',
        options: levelOptions,
        search: true,
        form: { rules: [{ required: true, message: t('customer.validation.levelRequired') }] },
        table: { width: 100, render: (_, row) => <Tag color={row.level === 'important' ? 'volcano' : 'blue'}>{levelOptions.find((item) => item.value === row.level)?.label}</Tag> },
      },
      { key: 'owner', title: t('customer.fields.owner'), valueType: 'select', search: { valueType: 'digit' }, form: { request: userOptions, componentProps: searchableSelectProps }, table: { width: 160, render: (_, row) => renderDisplay(row.owner_display, row.owner) } },
      { key: 'updated_at', title: t('fields.updatedAt'), valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
    ],
    [levelOptions, t],
  )
  return (
    <AdminTablePage<CustomerRow, CustomerFormValues>
      listTitle={t('common.listTitle')}
      fields={fields}
      api={customerApi}
      rowKey="id"
      createTitle={t('customer.actions.create')}
      editTitle={t('customer.actions.edit')}
      createDefaults={{ company_name: '', country: '', email: '', phone: '', whatsapp: '', source: '', level: 'normal', notes: '', owner: null }}
      transformSubmit={(values) => ({
        tenant: Number(values.tenant),
        name: values.name.trim(),
        company_name: values.company_name?.trim() ?? '',
        country: values.country?.trim() ?? '',
        email: values.email?.trim() ?? '',
        phone: values.phone?.trim() ?? '',
        whatsapp: values.whatsapp?.trim() ?? '',
        source: values.source?.trim() ?? '',
        level: values.level,
        notes: values.notes?.trim() ?? '',
        owner: values.owner ? Number(values.owner) : null,
      })}
      tableScrollX={1500}
    />
  )
}

export default CustomerManagePage
