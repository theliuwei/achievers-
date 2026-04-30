import { useMemo } from 'react'
import { Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import { productApi, type ProductPayload, type ProductRow } from '../../api/business'
import { productCategoryOptions, searchableSelectProps } from '../../api/options'

type ProductFormValues = ProductPayload & Record<string, unknown>

const renderDisplay = (displayValue?: string | null, id?: number | null) => displayValue || id || '-'

const ProductManagePage = () => {
  const { t } = useTranslation('common')
  const statusOptions = useMemo(
    () => [
      { label: t('product.status.draft'), value: 'draft' },
      { label: t('product.status.active'), value: 'active' },
      { label: t('product.status.archived'), value: 'archived' },
    ],
    [t],
  )
  const fields = useMemo<EntityFieldConfig<ProductRow>[]>(
    () => [
      { key: 'id', title: t('fields.id'), valueType: 'digit', form: false, search: true, table: { width: 72 } },
      { key: 'sku', title: t('product.fields.sku'), valueType: 'text', search: true, table: { width: 140 } },
      { key: 'name', title: t('product.fields.name'), valueType: 'text', search: true, form: { rules: [{ required: true, message: t('product.validation.nameRequired') }] }, table: { width: 260, ellipsis: true } },
      { key: 'slug', title: t('product.fields.slug'), valueType: 'text', search: true, form: { rules: [{ required: true, message: t('product.validation.slugRequired') }] }, table: { width: 180, ellipsis: true } },
      {
        key: 'category',
        title: t('product.fields.category'),
        valueType: 'select',
        search: { valueType: 'digit' },
        form: { rules: [{ required: true, message: t('product.validation.categoryRequired') }], request: productCategoryOptions, componentProps: searchableSelectProps },
        table: { width: 180, render: (_, row) => renderDisplay(row.category_display, row.category) },
      },
      { key: 'origin_country', title: t('product.fields.originCountry'), valueType: 'text', search: true, table: { width: 120 } },
      {
        key: 'status',
        title: t('status.label'),
        valueType: 'select',
        options: statusOptions,
        search: true,
        form: { rules: [{ required: true, message: t('product.validation.statusRequired') }] },
        table: { width: 100, render: (_, row) => <Tag color={row.status === 'active' ? 'green' : row.status === 'draft' ? 'default' : 'orange'}>{statusOptions.find((item) => item.value === row.status)?.label}</Tag> },
      },
      { key: 'sort_order', title: t('fields.sortOrder'), valueType: 'digit', search: false, table: { width: 90 } },
      { key: 'summary', title: t('product.fields.summary'), valueType: 'textarea', search: true, table: { width: 260, ellipsis: true } },
      { key: 'external_id', title: t('product.fields.externalId'), valueType: 'text', form: false, search: true, table: false },
      { key: 'created_at', title: t('fields.createdAt'), valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
      { key: 'updated_at', title: t('fields.updatedAt'), valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
    ],
    [statusOptions, t],
  )
  return (
    <AdminTablePage<ProductRow, ProductFormValues>
      listTitle={t('common.listTitle')}
      fields={fields}
      api={productApi}
      rowKey="id"
      createTitle={t('product.actions.create')}
      editTitle={t('product.actions.edit')}
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
}

export default ProductManagePage
