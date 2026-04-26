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
  const commonProps = {
    key: field.key,
    name,
    label: field.title,
    rules: form?.rules,
    placeholder: form?.placeholder,
    disabled: Boolean(editing && form?.readonlyOnEdit),
    fieldProps: form?.componentProps as never,
  }

  switch (field.valueType) {
    case 'textarea':
      return <ProFormTextArea {...commonProps} />
    case 'select':
      return <ProFormSelect {...commonProps} options={field.options ?? []} />
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
