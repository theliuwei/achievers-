import { useMemo } from 'react'
import { Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import { quotationApi, type QuotationPayload, type QuotationRow } from '../../api/business'
import {
  customerOptions,
  inquiryOptions,
  searchableSelectProps,
  tenantOptions,
  userOptions,
} from '../../api/options'
import { useLocaleFormat } from '../../i18n/useLocaleFormat'
import type { SupportedCurrency } from '../../i18n/localeFormat'

type QuotationFormValues = QuotationPayload & Record<string, unknown>

const renderDisplay = (displayValue?: string | null, id?: number | null) => displayValue || id || '-'
const QuotationManagePage = () => {
  const { t } = useTranslation('common')
  const { formatCurrency } = useLocaleFormat()
  const statusOptions = useMemo(
    () => [
      { label: t('quotation.status.draft'), value: 'draft' },
      { label: t('quotation.status.sent'), value: 'sent' },
      { label: t('quotation.status.confirmed'), value: 'confirmed' },
      { label: t('quotation.status.won'), value: 'won' },
      { label: t('quotation.status.lost'), value: 'lost' },
    ],
    [t],
  )
  const fields = useMemo<EntityFieldConfig<QuotationRow>[]>(
    () => [
      { key: 'id', title: t('fields.id'), valueType: 'digit', form: false, search: true, table: { width: 72 } },
      {
        key: 'tenant',
        title: t('quotation.fields.tenant'),
        valueType: 'select',
        search: { valueType: 'digit' },
        form: { rules: [{ required: true, message: t('quotation.validation.tenantRequired') }], request: tenantOptions, componentProps: searchableSelectProps },
        table: { width: 180, render: (_, row) => renderDisplay(row.tenant_display, row.tenant) },
      },
      { key: 'quote_no', title: t('quotation.fields.quoteNo'), valueType: 'text', search: true, form: { rules: [{ required: true, message: t('quotation.validation.quoteNoRequired') }] }, table: { width: 170 } },
      { key: 'customer', title: t('quotation.fields.customer'), valueType: 'select', search: { valueType: 'digit' }, form: { request: customerOptions, componentProps: searchableSelectProps }, table: { width: 160, render: (_, row) => renderDisplay(row.customer_display, row.customer) } },
      { key: 'inquiry', title: t('quotation.fields.inquiry'), valueType: 'select', search: { valueType: 'digit' }, form: { request: inquiryOptions, componentProps: searchableSelectProps }, table: { width: 180, render: (_, row) => renderDisplay(row.inquiry_display, row.inquiry) } },
      { key: 'currency', title: t('quotation.fields.currency'), valueType: 'text', search: true, table: { width: 90 } },
      { key: 'total_amount', title: t('quotation.fields.totalAmount'), valueType: 'digit', search: false, table: { width: 140, render: (_, row) => formatCurrency(row.total_amount, (row.currency as SupportedCurrency) || 'USD') } },
      { key: 'trade_term', title: t('quotation.fields.tradeTerm'), valueType: 'text', search: true, table: { width: 130 } },
      {
        key: 'status',
        title: t('status.label'),
        valueType: 'select',
        options: statusOptions,
        search: true,
        form: { rules: [{ required: true, message: t('quotation.validation.statusRequired') }] },
        table: { width: 110, render: (_, row) => <Tag color={row.status === 'won' ? 'green' : row.status === 'lost' ? 'default' : 'blue'}>{statusOptions.find((item) => item.value === row.status)?.label}</Tag> },
      },
      { key: 'valid_until', title: t('quotation.fields.validUntil'), valueType: 'date', search: false, table: { width: 130 } },
      { key: 'owner', title: t('quotation.fields.owner'), valueType: 'select', search: { valueType: 'digit' }, form: { request: userOptions, componentProps: searchableSelectProps }, table: { width: 160, render: (_, row) => renderDisplay(row.owner_display, row.owner) } },
      { key: 'created_at', title: t('fields.createdAt'), valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
    ],
    [formatCurrency, statusOptions, t],
  )
  return (
    <AdminTablePage<QuotationRow, QuotationFormValues>
      listTitle={t('common.listTitle')}
      fields={fields}
      api={quotationApi}
      rowKey="id"
      createTitle={t('quotation.actions.create')}
      editTitle={t('quotation.actions.edit')}
      createDefaults={{ customer: null, inquiry: null, currency: 'USD', total_amount: '0', trade_term: '', status: 'draft', valid_until: null, owner: null }}
      transformSubmit={(values) => ({
        tenant: Number(values.tenant),
        customer: values.customer ? Number(values.customer) : null,
        inquiry: values.inquiry ? Number(values.inquiry) : null,
        quote_no: values.quote_no.trim(),
        currency: values.currency?.trim() ?? 'USD',
        total_amount: String(values.total_amount ?? '0'),
        trade_term: values.trade_term?.trim() ?? '',
        status: values.status,
        valid_until: values.valid_until ?? null,
        owner: values.owner ? Number(values.owner) : null,
      })}
      tableScrollX={1600}
    />
  )
}

export default QuotationManagePage
