import { Tag } from 'antd'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import { quotationApi, type QuotationPayload, type QuotationRow } from '../../api/business'

type QuotationFormValues = QuotationPayload & Record<string, unknown>

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已发送', value: 'sent' },
  { label: '已确认', value: 'confirmed' },
  { label: '已成交', value: 'won' },
  { label: '已失效', value: 'lost' },
]

const fields: EntityFieldConfig<QuotationRow>[] = [
  { key: 'id', title: 'ID', valueType: 'digit', form: false, search: true, table: { width: 72 } },
  { key: 'tenant', title: '公司 ID', valueType: 'digit', search: true, form: { rules: [{ required: true, message: '请输入公司 ID' }] }, table: { width: 110 } },
  { key: 'quote_no', title: '报价单号', valueType: 'text', search: true, form: { rules: [{ required: true, message: '请输入报价单号' }] }, table: { width: 170 } },
  { key: 'customer', title: '客户 ID', valueType: 'digit', search: true, table: { width: 110 } },
  { key: 'inquiry', title: '询盘 ID', valueType: 'digit', search: true, table: { width: 110 } },
  { key: 'currency', title: '币种', valueType: 'text', search: true, table: { width: 90 } },
  { key: 'total_amount', title: '总额', valueType: 'digit', search: false, table: { width: 120 } },
  { key: 'trade_term', title: '贸易条款', valueType: 'text', search: true, table: { width: 130 } },
  {
    key: 'status',
    title: '状态',
    valueType: 'select',
    options: statusOptions,
    search: true,
    form: { rules: [{ required: true, message: '请选择状态' }] },
    table: {
      width: 110,
      render: (_, row) => {
        const color = row.status === 'won' ? 'green' : row.status === 'lost' ? 'default' : 'blue'
        return <Tag color={color}>{statusOptions.find((item) => item.value === row.status)?.label}</Tag>
      },
    },
  },
  { key: 'valid_until', title: '有效期至', valueType: 'date', search: false, table: { width: 130 } },
  { key: 'owner', title: '负责人 ID', valueType: 'digit', search: true, table: { width: 120 } },
  { key: 'created_at', title: '创建时间', valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
]

const QuotationManagePage = () => (
  <AdminTablePage<QuotationRow, QuotationFormValues>
    listTitle="应用列表"
    fields={fields}
    api={quotationApi}
    rowKey="id"
    createTitle="新增报价"
    editTitle="编辑报价"
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

export default QuotationManagePage
