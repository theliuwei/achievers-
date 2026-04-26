import { Tag } from 'antd'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import { inquiryApi, type InquiryPayload, type InquiryRow } from '../../api/business'

type InquiryFormValues = InquiryPayload & Record<string, unknown>

const statusOptions = [
  { label: '新询盘', value: 'new' },
  { label: '已联系', value: 'contacted' },
  { label: '已报价', value: 'quoted' },
  { label: '已成交', value: 'won' },
  { label: '无效', value: 'invalid' },
]

const fields: EntityFieldConfig<InquiryRow>[] = [
  { key: 'id', title: 'ID', valueType: 'digit', form: false, search: true, table: { width: 72 } },
  { key: 'tenant', title: '公司 ID', valueType: 'digit', search: true, form: { rules: [{ required: true, message: '请输入公司 ID' }] }, table: { width: 110 } },
  { key: 'customer', title: '客户 ID', valueType: 'digit', search: true, table: { width: 110 } },
  { key: 'subject', title: '询盘主题', valueType: 'text', search: true, form: { rules: [{ required: true, message: '请输入询盘主题' }] }, table: { width: 260, ellipsis: true } },
  { key: 'product_name', title: '产品', valueType: 'text', search: true, table: { width: 180, ellipsis: true } },
  { key: 'country', title: '国家', valueType: 'text', search: true, table: { width: 120 } },
  { key: 'source', title: '来源', valueType: 'text', search: true, table: { width: 120 } },
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
        const color = row.status === 'won' ? 'green' : row.status === 'invalid' ? 'default' : 'blue'
        return <Tag color={color}>{statusOptions.find((item) => item.value === row.status)?.label}</Tag>
      },
    },
  },
  { key: 'assignee', title: '负责人 ID', valueType: 'digit', search: true, table: { width: 120 } },
  { key: 'created_at', title: '创建时间', valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
]

const InquiryManagePage = () => (
  <AdminTablePage<InquiryRow, InquiryFormValues>
    listTitle="应用列表"
    fields={fields}
    api={inquiryApi}
    rowKey="id"
    createTitle="新增询盘"
    editTitle="编辑询盘"
    createDefaults={{ customer: null, product_name: '', message: '', country: '', source: '官网', status: 'new', assignee: null }}
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

export default InquiryManagePage
