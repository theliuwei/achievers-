import type { ActionModalSchemaType, SearchFieldSchema } from '../../../components/pro/types'
import i18n from '../../../i18n'

const ROLE_OPTIONS = [
  { label: i18n.t('common:userManage.roles.admin'), value: 'admin' },
  { label: i18n.t('common:userManage.roles.editor'), value: 'editor' },
  { label: i18n.t('common:userManage.roles.viewer'), value: 'viewer' },
]

/**
 * 用户管理 — 搜索区 schema（字段与表格列一致：关键词覆盖用户名/昵称/邮箱，角色、启用状态等）。
 * 含 Switch / Upload 的 Form.Item 扩展演示。
 */
export const userSearchSchema: SearchFieldSchema[] = [
  {
    name: 'keyword',
    label: i18n.t('common:userManage.search.keyword'),
    componentType: 'Input',
    componentProps: { placeholder: i18n.t('common:userManage.search.keywordPlaceholder') },
  },
  {
    name: 'role',
    label: i18n.t('common:user.fields.roles'),
    componentType: 'Select',
    componentProps: { options: ROLE_OPTIONS, allowClear: true },
  },
  {
    name: 'onlyActive',
    label: i18n.t('common:userManage.search.onlyActive'),
    componentType: 'Switch',
    colProps: { md: { span: 6 } },
    formItemProps: {
      valuePropName: 'checked',
      normalize: (v) => Boolean(v),
    },
  },
  {
    name: 'attachment',
    label: i18n.t('common:userManage.search.attachment'),
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
    label: i18n.t('common:user.fields.username'),
    componentType: 'Input',
    rules: [{ required: true, message: i18n.t('common:user.validation.usernameRequired') }],
    componentProps: { placeholder: i18n.t('common:userManage.form.usernamePlaceholder') },
  },
  {
    name: 'nickname',
    label: i18n.t('common:userManage.form.nickname'),
    componentType: 'Input',
    rules: [{ required: true, message: i18n.t('common:userManage.form.nicknameRequired') }],
  },
  {
    name: 'email',
    label: i18n.t('common:user.fields.email'),
    componentType: 'Input',
    rules: [
      { required: true, message: i18n.t('common:user.validation.emailRequired') },
      { type: 'email', message: i18n.t('common:profile.validation.emailInvalid') },
    ],
  },
  {
    name: 'role',
    label: i18n.t('common:user.fields.roles'),
    componentType: 'Select',
    rules: [{ required: true, message: i18n.t('common:userManage.form.roleRequired') }],
    componentProps: { options: ROLE_OPTIONS },
  },
  {
    name: 'active',
    label: i18n.t('common:userManage.form.active'),
    componentType: 'Switch',
    formItemProps: {
      valuePropName: 'checked',
      normalize: (v) => Boolean(v),
    },
  },
]

export { ROLE_OPTIONS }
