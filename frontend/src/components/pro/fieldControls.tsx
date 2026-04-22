import type { ReactNode } from 'react'
import { DatePicker, Input, InputNumber, Select, Switch, Upload } from 'antd'
import type { SearchFieldSchema } from './types'

/** SearchForm / ActionModal 共用的表单项控件渲染 */
export function renderProFormFieldControl(field: SearchFieldSchema) {
  const props = field.componentProps ?? {}
  switch (field.componentType) {
    case 'Input':
      return <Input allowClear placeholder="请输入" {...props} />
    case 'InputNumber':
      return <InputNumber className="w-full" placeholder="请输入" {...props} />
    case 'Select':
      return <Select allowClear placeholder="请选择" optionFilterProp="label" {...props} />
    case 'DatePicker':
      return <DatePicker className="w-full" allowClear {...props} />
    case 'RangePicker':
      return <DatePicker.RangePicker className="w-full" allowClear {...props} />
    case 'Switch':
      return <Switch checkedChildren="是" unCheckedChildren="否" {...props} />
    case 'Upload': {
      const { children: uploadChildren, ...uploadRest } = props as {
        children?: ReactNode
        [key: string]: unknown
      }
      return (
        <Upload maxCount={1} beforeUpload={() => false} listType="text" {...uploadRest}>
          {uploadChildren ?? '选择文件（演示 Upload + getValueFromEvent）'}
        </Upload>
      )
    }
    default:
      return null
  }
}
