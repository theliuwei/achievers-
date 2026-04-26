import { Tag } from 'antd'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import { productApi, type ProductPayload, type ProductRow } from '../../api/business'

type ProductFormValues = ProductPayload & Record<string, unknown>

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '上架', value: 'active' },
  { label: '归档', value: 'archived' },
]

const fields: EntityFieldConfig<ProductRow>[] = [
  { key: 'id', title: 'ID', valueType: 'digit', form: false, search: true, table: { width: 72 } },
  { key: 'sku', title: '型号/SKU', valueType: 'text', search: true, table: { width: 140 } },
  { key: 'name', title: '产品名称', valueType: 'text', search: true, form: { rules: [{ required: true, message: '请输入产品名称' }] }, table: { width: 260, ellipsis: true } },
  { key: 'slug', title: 'URL 标识', valueType: 'text', search: true, form: { rules: [{ required: true, message: '请输入 URL 标识' }] }, table: { width: 180, ellipsis: true } },
  { key: 'category', title: '类目 ID', valueType: 'digit', search: true, form: { rules: [{ required: true, message: '请输入类目 ID' }] }, table: { width: 110 } },
  { key: 'origin_country', title: '原产地', valueType: 'text', search: true, table: { width: 120 } },
  {
    key: 'status',
    title: '状态',
    valueType: 'select',
    options: statusOptions,
    search: true,
    form: { rules: [{ required: true, message: '请选择状态' }] },
    table: {
      width: 100,
      render: (_, row) => (
        <Tag color={row.status === 'active' ? 'green' : row.status === 'draft' ? 'default' : 'orange'}>
          {statusOptions.find((item) => item.value === row.status)?.label}
        </Tag>
      ),
    },
  },
  { key: 'sort_order', title: '排序', valueType: 'digit', search: false, table: { width: 90 } },
  { key: 'summary', title: '摘要', valueType: 'textarea', search: true, table: { width: 260, ellipsis: true } },
  { key: 'external_id', title: '外部 ID', valueType: 'text', form: false, search: true, table: false },
  { key: 'created_at', title: '创建时间', valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
  { key: 'updated_at', title: '更新时间', valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
]

const ProductManagePage = () => (
  <AdminTablePage<ProductRow, ProductFormValues>
    listTitle="应用列表"
    fields={fields}
    api={productApi}
    rowKey="id"
    createTitle="新增产品"
    editTitle="编辑产品"
    createDefaults={{
      sku: '',
      summary: '',
      description: '',
      attributes: {},
      origin_country: '',
      source_url: '',
      external_id: '',
      status: 'draft',
      sort_order: 0,
    }}
    transformSubmit={(values) => ({
      sku: values.sku?.trim() || null,
      name: values.name.trim(),
      slug: values.slug.trim(),
      summary: values.summary?.trim() ?? '',
      description: values.description?.trim() ?? '',
      attributes: values.attributes ?? {},
      origin_country: values.origin_country?.trim() ?? '',
      source_url: values.source_url?.trim() ?? '',
      external_id: values.external_id?.trim() ?? '',
      status: values.status,
      sort_order: Number(values.sort_order ?? 0),
      category: Number(values.category),
    })}
    tableScrollX={1600}
  />
)

export default ProductManagePage
