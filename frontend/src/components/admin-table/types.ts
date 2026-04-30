import type { ReactNode } from 'react'
import type { ActionType } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import type { Rule } from 'antd/es/form'

export type EntityRecord = object

export interface PageResult<T> {
  data: T[]
  total: number
}

export interface EntityApi<T extends EntityRecord, FormValues extends EntityRecord = EntityRecord> {
  list: (params: Record<string, unknown>) => Promise<PageResult<T>>
  create?: (values: FormValues) => Promise<T>
  update?: (id: React.Key, values: FormValues) => Promise<T>
  remove?: (id: React.Key) => Promise<void>
}

export interface FieldOption {
  label: ReactNode
  value: string | number | boolean
}

export type FieldOptionValue = FieldOption['value']

export type EntityFieldValueType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'switch'
  | 'digit'
  | 'date'
  | 'dateTime'

export interface EntityFieldConfig<T extends EntityRecord = EntityRecord> {
  key: string
  title: ReactNode
  dataIndex?: ProColumns<T>['dataIndex']
  valueType?: EntityFieldValueType
  options?: FieldOption[]
  table?: false | Partial<ProColumns<T>>
  search?: boolean | Partial<ProColumns<T>>
  form?: false | {
    rules?: Rule[]
    placeholder?: string
    readonlyOnEdit?: boolean
    componentProps?: Record<string, unknown>
    /** 远程加载表单下拉选项；用于外键等可查询选择器。 */
    request?: (keyword?: string) => Promise<FieldOption[]>
  }
  render?: ProColumns<T>['render']
}

export interface AdminTablePageProps<
  T extends EntityRecord,
  FormValues extends EntityRecord = EntityRecord,
> {
  rowKey?: keyof T & string
  listTitle?: ReactNode
  fields: EntityFieldConfig<T>[]
  api: EntityApi<T, FormValues>
  createTitle?: string
  editTitle?: string
  createDefaults?: Partial<FormValues>
  recordToFormValues?: (record: T) => Partial<FormValues>
  transformSubmit?: (values: FormValues, editing?: T | null) => FormValues
  canCreate?: boolean
  canUpdate?: boolean
  canDelete?: boolean
  tableScrollX?: number | string
  extraActions?: (record: T, action?: ActionType) => ReactNode
}
