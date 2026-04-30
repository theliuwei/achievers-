import { useMemo } from 'react'
import { Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import { inquiryApi, type InquiryPayload, type InquiryRow } from '../../api/business'
import { customerOptions, searchableSelectProps, tenantOptions, userOptions } from '../../api/options'

type InquiryFormValues = InquiryPayload & Record<string, unknown>

const renderDisplay = (displayValue?: string | null, id?: number | null) => displayValue || id || '-'

const InquiryManagePage = () => {
  const { t } = useTranslation('common')
  const statusOptions = useMemo(
    () => [
      { label: t('inquiry.status.new'), value: 'new' },
      { label: t('inquiry.status.contacted'), value: 'contacted' },
      { label: t('inquiry.status.quoted'), value: 'quoted' },
      { label: t('inquiry.status.won'), value: 'won' },
      { label: t('inquiry.status.invalid'), value: 'invalid' },
    ],
    [t],
  )
  const fields = useMemo<EntityFieldConfig<InquiryRow>[]>(
    () => [
      { key: 'id', title: t('fields.id'), valueType: 'digit', form: false, search: true, table: { width: 72 } },
      {
        key: 'tenant',
        title: t('inquiry.fields.tenant'),
        valueType: 'select',
        search: { valueType: 'digit' },
        form: { rules: [{ required: true, message: t('inquiry.validation.tenantRequired') }], request: tenantOptions, componentProps: searchableSelectProps },
        table: { width: 180, render: (_, row) => renderDisplay(row.tenant_display, row.tenant) },
      },
      { key: 'customer', title: t('inquiry.fields.customer'), valueType: 'select', search: { valueType: 'digit' }, form: { request: customerOptions, componentProps: searchableSelectProps }, table: { width: 160, render: (_, row) => renderDisplay(row.customer_display, row.customer) } },
      { key: 'subject', title: t('inquiry.fields.subject'), valueType: 'text', search: true, form: { rules: [{ required: true, message: t('inquiry.validation.subjectRequired') }] }, table: { width: 260, ellipsis: true } },
      { key: 'product_name', title: t('inquiry.fields.productName'), valueType: 'text', search: true, table: { width: 180, ellipsis: true } },
      { key: 'country', title: t('inquiry.fields.country'), valueType: 'text', search: true, table: { width: 120 } },
      { key: 'source', title: t('inquiry.fields.source'), valueType: 'text', search: true, table: { width: 120 } },
      {
        key: 'status',
        title: t('status.label'),
        valueType: 'select',
        options: statusOptions,
        search: true,
        form: { rules: [{ required: true, message: t('inquiry.validation.statusRequired') }] },
        table: { width: 110, render: (_, row) => <Tag color={row.status === 'won' ? 'green' : row.status === 'invalid' ? 'default' : 'blue'}>{statusOptions.find((item) => item.value === row.status)?.label}</Tag> },
      },
      { key: 'assignee', title: t('inquiry.fields.assignee'), valueType: 'select', search: { valueType: 'digit' }, form: { request: userOptions, componentProps: searchableSelectProps }, table: { width: 160, render: (_, row) => renderDisplay(row.assignee_display, row.assignee) } },
      { key: 'created_at', title: t('fields.createdAt'), valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
    ],
    [statusOptions, t],
  )
  return (
    <AdminTablePage<InquiryRow, InquiryFormValues>
      listTitle={t('common.listTitle')}
      fields={fields}
      api={inquiryApi}
      rowKey="id"
      createTitle={t('inquiry.actions.create')}
      editTitle={t('inquiry.actions.edit')}
      createDefaults={{ customer: null, product_name: '', message: '', country: '', source: t('inquiry.defaults.sourceWebsite'), status: 'new', assignee: null }}
      transformSubmit={(values) => ({
        tenant: Number(values.tenant),
        customer: values.customer ? Number(values.customer) : null,
        subject: values.subject.trim(),
        product_name: values.product_name?.trim() ?? '',
        message: values.message?.trim() ?? '',
        country: values.country?.trim() ?? '',
        source: values.source?.trim() ?? '',
        status: values.status,
        assignee: values.assignee ? Number(values.assignee) : null,
      })}
      tableScrollX={1500}
    />
  )
}

export default InquiryManagePage
