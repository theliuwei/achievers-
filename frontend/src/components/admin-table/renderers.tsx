import type { ReactNode } from 'react'
import {
  ProFormDatePicker,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components'
import i18n from '../../i18n'
import type { EntityFieldConfig, EntityRecord } from './types'

export const optionsToValueEnum = (options?: EntityFieldConfig['options']) => {
  if (!options?.length) {
    return undefined
  }
  return options.reduce<Record<string, { text: ReactNode }>>((acc, item) => {
    acc[String(item.value)] = { text: item.label }
    return acc
  }, {})
}

export function renderFormItem<T extends EntityRecord>(
  field: EntityFieldConfig<T>,
  editing: T | null,
) {
  const name = field.key
  const form = field.form === false ? undefined : field.form
  const defaultPlaceholder =
    field.valueType === 'select'
      ? i18n.t('common:form.placeholders.select')
      : i18n.t('common:form.placeholders.input')
  const commonProps = {
    key: field.key,
    name,
    label: field.title,
    rules: form?.rules,
    placeholder: form?.placeholder ?? defaultPlaceholder,
    disabled: Boolean(editing && form?.readonlyOnEdit),
    fieldProps: form?.componentProps as never,
  }

  switch (field.valueType) {
    case 'textarea':
      return <ProFormTextArea {...commonProps} />
    case 'select':
      return (
        <ProFormSelect
          {...commonProps}
          options={field.options ?? []}
          request={
            form?.request
              ? (async (params) => form.request?.(String(params.keyWords ?? '')) ?? [])
              : undefined
          }
        />
      )
    case 'switch':
      return <ProFormSwitch {...commonProps} />
    case 'digit':
      return <ProFormDigit {...commonProps} />
    case 'date':
      return <ProFormDatePicker {...commonProps} />
    case 'dateTime':
      return <ProFormDateTimePicker {...commonProps} />
    case 'text':
    default:
      return <ProFormText {...commonProps} />
  }
}
