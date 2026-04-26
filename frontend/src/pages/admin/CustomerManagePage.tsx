import { Tag } from 'antd'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import { customerApi, type CustomerPayload, type CustomerRow } from '../../api/business'

type CustomerFormValues = CustomerPayload & Record<string, unknown>

const levelOptions = [
  { label: '普通', value: 'normal' },
  { label: '重点', value: 'important' },
]

const fields: EntityFieldConfig<CustomerRow>[] = [
  { key: 'id', title: 'ID', valueType: 'digit', form: false, search: true, table: { width: 72 } },
  { key: 'tenant', title: '公司 ID', valueType: 'digit', search: true, form: { rules: [{ required: true, message: '请输入公司 ID' }] }, table: { width: 110 } },
  { key: 'name', title: '客户姓名', valueType: 'text', search: true, form: { rules: [{ required: true, message: '请输入客户姓名' }] }, table: { width: 150 } },
  { key: 'company_name', title: '客户公司', valueType: 'text', search: true, table: { width: 220, ellipsis: true } },
  { key: 'country', title: '国家', valueType: 'text', search: true, table: { width: 120 } },
  { key: 'email', title: '邮箱', valueType: 'text', search: true, table: { width: 220, ellipsis: true } },
  { key: 'phone', title: '电话', valueType: 'text', search: true, table: false, form: false },
  { key: 'whatsapp', title: 'WhatsApp', valueType: 'text', search: true, table: { width: 140 } },
  { key: 'source', title: '来源', valueType: 'text', search: true, table: { width: 120 } },
  {
    key: 'level',
    title: '等级',
    valueType: 'select',
    options: levelOptions,
    search: true,
    form: { rules: [{ required: true, message: '请选择客户等级' }] },
    table: {
      width: 100,
      render: (_, row) => (
        <Tag color={row.level === 'important' ? 'volcano' : 'blue'}>
          {levelOptions.find((item) => item.value === row.level)?.label}
        </Tag>
      ),
    },
  },
  { key: 'owner', title: '负责人 ID', valueType: 'digit', search: true, table: { width: 120 } },
  { key: 'updated_at', title: '更新时间', valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
]

const CustomerManagePage = () => (
  <AdminTablePage<CustomerRow, CustomerFormValues>
    listTitle="应用列表"
    fields={fields}
    api={customerApi}
    rowKey="id"
    createTitle="新增客户"
    editTitle="编辑客户"
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

export default CustomerManagePage
