import type { ReactNode } from 'react'
import { DatePicker, Input, InputNumber, Select, Switch, Upload } from 'antd'
import i18n from '../../i18n'
import type { SearchFieldSchema } from './types'

/** SearchForm / ActionModal 共用的表单项控件渲染 */
export function renderProFormFieldControl(field: SearchFieldSchema) {
  const props = field.componentProps ?? {}
  switch (field.componentType) {
    case 'Input':
      return <Input allowClear placeholder={i18n.t('common:form.placeholders.input')} {...props} />
    case 'InputNumber':
      return <InputNumber className="w-full" placeholder={i18n.t('common:form.placeholders.input')} {...props} />
    case 'Select':
      return <Select allowClear placeholder={i18n.t('common:form.placeholders.select')} optionFilterProp="label" {...props} />
    case 'DatePicker':
      return <DatePicker className="w-full" allowClear {...props} />
    case 'RangePicker':
      return <DatePicker.RangePicker className="w-full" allowClear {...props} />
    case 'Switch':
      return (
        <Switch
          checkedChildren={i18n.t('common:common.yes')}
          unCheckedChildren={i18n.t('common:common.no')}
          {...props}
        />
      )
    case 'Upload': {
      const { children: uploadChildren, ...uploadRest } = props as {
        children?: ReactNode
        [key: string]: unknown
      }
      return (
        <Upload maxCount={1} beforeUpload={() => false} listType="text" {...uploadRest}>
          {uploadChildren ?? i18n.t('common:form.placeholders.uploadDemo')}
        </Upload>
      )
    }
    default:
      return null
  }
}
