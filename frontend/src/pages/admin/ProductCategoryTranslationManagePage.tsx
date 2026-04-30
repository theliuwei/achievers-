import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import {
  productCategoryTranslationApi,
  type ProductCategoryTranslationPayload,
  type ProductCategoryTranslationRow,
} from '../../api/business'
import { productCategoryOptions, searchableSelectProps } from '../../api/options'

type ProductCategoryTranslationFormValues = ProductCategoryTranslationPayload & Record<string, unknown>

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: '简体中文', value: 'zh-hans' },
  { label: 'Bahasa Indonesia', value: 'id' },
  { label: 'Tiếng Việt', value: 'vi' },
  { label: 'Русский', value: 'ru' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Français', value: 'fr' },
  { label: 'Español', value: 'es' },
  { label: 'Italiano', value: 'it' },
  { label: 'Português', value: 'pt' },
  { label: 'Polski', value: 'pl' },
  { label: 'Nederlands', value: 'nl' },
  { label: 'ไทย', value: 'th' },
]

const ProductCategoryTranslationManagePage = () => {
  const { t } = useTranslation('common')
  const fields = useMemo<EntityFieldConfig<ProductCategoryTranslationRow>[]>(
    () => [
      { key: 'id', title: t('fields.id'), valueType: 'digit', form: false, search: true, table: { width: 72 } },
      {
        key: 'category',
        title: t('translation.fields.category'),
        valueType: 'select',
        search: { valueType: 'digit' },
        form: {
          rules: [{ required: true, message: t('translation.validation.categoryRequired') }],
          request: productCategoryOptions,
          componentProps: searchableSelectProps,
        },
        table: { width: 200, render: (_, row) => row.category_display || row.category },
      },
      { key: 'language', title: t('translation.fields.language'), valueType: 'select', options: languageOptions, search: true, form: { rules: [{ required: true, message: t('translation.validation.languageRequired') }] }, table: { width: 120 } },
      { key: 'name', title: t('translation.fields.name'), valueType: 'text', search: true, form: { rules: [{ required: true, message: t('translation.validation.nameRequired') }] }, table: { width: 220, ellipsis: true } },
      { key: 'description', title: t('translation.fields.description'), valueType: 'textarea', search: true, table: { width: 260, ellipsis: true } },
      { key: 'seo_title', title: t('translation.fields.seoTitle'), valueType: 'text', search: true, table: { width: 220, ellipsis: true } },
      { key: 'seo_description', title: t('translation.fields.seoDescription'), valueType: 'textarea', search: false, table: { width: 260, ellipsis: true } },
      { key: 'updated_at', title: t('fields.updatedAt'), valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
    ],
    [t],
  )

  return (
    <AdminTablePage<ProductCategoryTranslationRow, ProductCategoryTranslationFormValues>
      listTitle={t('translation.categoryListTitle')}
      fields={fields}
      api={productCategoryTranslationApi}
      rowKey="id"
      createTitle={t('translation.actions.createCategory')}
      editTitle={t('translation.actions.editCategory')}
      createDefaults={{ category: 0, language: 'en', name: '', description: '', seo_title: '', seo_description: '' }}
      transformSubmit={(values) => ({
        category: Number(values.category),
        language: values.language?.trim().toLowerCase(),
        name: values.name?.trim() ?? '',
        description: values.description?.trim() ?? '',
        seo_title: values.seo_title?.trim() ?? '',
        seo_description: values.seo_description?.trim() ?? '',
      })}
      tableScrollX={1700}
    />
  )
}

export default ProductCategoryTranslationManagePage
