import type { ActionModalSchemaType, SearchFieldSchema } from '../../../components/pro/types'

const ROLE_OPTIONS = [
  { label: '管理员', value: 'admin' },
  { label: '编辑', value: 'editor' },
  { label: '只读', value: 'viewer' },
]

/**
 * 用户管理 — 搜索区 schema（字段与表格列一致：关键词覆盖用户名/昵称/邮箱，角色、启用状态等）。
 * 含 Switch / Upload 的 Form.Item 扩展演示。
 */
export const userSearchSchema: SearchFieldSchema[] = [
  {
    name: 'keyword',
    label: '关键词',
    componentType: 'Input',
    componentProps: { placeholder: '用户名 / 昵称 / 邮箱' },
  },
  {
    name: 'role',
    label: '角色',
    componentType: 'Select',
    componentProps: { options: ROLE_OPTIONS, allowClear: true },
  },
  {
    name: 'onlyActive',
    label: '仅看启用',
    componentType: 'Switch',
    colProps: { md: { span: 6 } },
    formItemProps: {
      valuePropName: 'checked',
      normalize: (v) => Boolean(v),
    },
  },
  {
    name: 'attachment',
    label: '附件（演示 Upload）',
    componentType: 'Upload',
    colProps: { md: { span: 12 } },
    formItemProps: {
      valuePropName: 'fileList',
      getValueFromEvent: (e: { fileList?: unknown }) =>
        Array.isArray(e?.fileList) ? e.fileList : [],
      /** 最多保留 1 个文件项，避免列表无限增长 */
      normalize: (v) => (Array.isArray(v) ? v.slice(0, 1) : []),
    },
  },
]

/** 新增 / 编辑用户 */
export const userFormModalSchema: ActionModalSchemaType[] = [
  {
    name: 'username',
    label: '用户名',
    componentType: 'Input',
    rules: [{ required: true, message: '请输入用户名' }],
    componentProps: { placeholder: '登录名，唯一' },
  },
  {
    name: 'nickname',
    label: '昵称',
    componentType: 'Input',
    rules: [{ required: true, message: '请输入昵称' }],
  },
  {
    name: 'email',
    label: '邮箱',
    componentType: 'Input',
    rules: [
      { required: true, message: '请输入邮箱' },
      { type: 'email', message: '邮箱格式不正确' },
    ],
  },
  {
    name: 'role',
    label: '角色',
    componentType: 'Select',
    rules: [{ required: true, message: '请选择角色' }],
    componentProps: { options: ROLE_OPTIONS },
  },
  {
    name: 'active',
    label: '启用账号',
    componentType: 'Switch',
    formItemProps: {
      valuePropName: 'checked',
      normalize: (v) => Boolean(v),
    },
  },
]

export { ROLE_OPTIONS }
