import type { CSSProperties, ReactNode } from 'react'
import type { ColProps, ModalProps, RowProps, TablePaginationConfig } from 'antd'
import type { FormItemProps, FormProps } from 'antd/es/form'
import type { Rule } from 'antd/es/form'
import type { ColumnsType, TableProps } from 'antd/es/table'
import type { SorterResult } from 'antd/es/table/interface'

/** SearchForm 支持的 Antd 表单控件类型 */
export type SearchFieldComponentType =
  | 'Input'
  | 'InputNumber'
  | 'Select'
  | 'DatePicker'
  | 'RangePicker'
  | 'Switch'
  | 'Upload'

export interface SearchFieldSchema {
  /** Form.Item name，与 Ant Design NamePath 一致 */
  name: FormItemProps['name']
  label: ReactNode
  componentType: SearchFieldComponentType
  /** 透传给对应 Antd 组件 */
  componentProps?: Record<string, unknown>
  /** 栅格列属性，用于响应式宽度 */
  colProps?: ColProps
  /** 校验规则 */
  rules?: Rule[]
  /**
   * 透传给 Form.Item（除 name / label / rules、children）。
   * 特殊控件常用：`Switch` 配合 `valuePropName: 'checked'`；
   * `Upload` 配合 `valuePropName: 'fileList'` 与 `getValueFromEvent`；
   * 数值清洗可用 `normalize`。
   */
  formItemProps?: Omit<FormItemProps, 'name' | 'label' | 'rules' | 'children'>
}

/**
 * ActionModal 表单字段配置（与 {@link SearchFieldSchema} 结构一致，便于共用渲染与类型提示）
 */
export type ActionModalSchemaType = SearchFieldSchema

export interface SearchFormProps {
  schema: SearchFieldSchema[]
  /** 点击「查询」且校验通过后触发 */
  onFinish: FormProps['onFinish']
  /** 点击「重置」并 resetFields 之后触发 */
  onReset?: () => void
  /** 初始值 */
  initialValues?: FormProps['initialValues']
  /** Form 根属性（除 onFinish / initialValues） */
  formProps?: Omit<FormProps, 'onFinish' | 'initialValues' | 'children'>
  /** Row 的 gutter */
  gutter?: RowProps['gutter']
  className?: string
  style?: CSSProperties
}

export interface ProTableRequestParams<T = unknown> {
  current: number
  pageSize: number
  /** Ant Design Table 当前排序状态 */
  sorter: SorterResult<T> | SorterResult<T>[]
}

export interface ProTableRequestResult<T> {
  data: T[]
  total: number
}

export interface ProTableProps<T extends object = Record<string, unknown>>
  extends Omit<TableProps<T>, 'dataSource' | 'loading' | 'pagination' | 'onChange'> {
  /** Ant Design Table 列定义，支持 `render`、`sorter` 等标准写法 */
  columns: ColumnsType<T>
  request: (params: ProTableRequestParams<T>) => Promise<ProTableRequestResult<T>>
  /** 与内部状态合并；传 `false` 关闭分页 */
  pagination?: false | TablePaginationConfig
  /** 查询条件变化时自动重新请求（建议配合 SearchForm 使用） */
  searchParams?: Record<string, unknown>
  /** 默认分页大小 */
  defaultPageSize?: number
}

export interface ActionModalProps<T extends Record<string, unknown> = Record<string, unknown>> {
  open: boolean
  onClose: () => void
  /** 弹窗标题（可与业务状态联动，例如 `editing ? '编辑用户' : '新增用户'`） */
  title: string
  schema: ActionModalSchemaType[]
  /** 编辑时的初始数据；不传或传 `undefined` 为新增模式 */
  initialValues?: T
  /** 新增模式在 `resetFields` 之后合并到表单的默认值（如 Switch 默认开启） */
  createDefaults?: Partial<T>
  /** 校验通过后调用；应完成创建或更新请求 */
  api: (values: T) => Promise<unknown>
  /** 提交成功提示，默认按新增/编辑文案 */
  successMessage?: string
  /** 透传 Modal（已占用 open、title、onOk、onCancel、confirmLoading、afterClose） */
  modalProps?: Omit<ModalProps, 'open' | 'title' | 'onOk' | 'onCancel' | 'confirmLoading' | 'afterClose'>
  /** 透传 Form（form、initialValues 由组件接管） */
  formProps?: Omit<FormProps, 'form' | 'initialValues' | 'onFinish' | 'children'>
  /** 表单栅格 gutter */
  gutter?: RowProps['gutter']
}
