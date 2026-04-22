import type { ActionIconType } from './ActionIcon'

/** 与 ActionIcon 类型对应的中文文案，便于按钮、Tooltip、aria-label */
export const ACTION_ICON_LABELS: Record<ActionIconType, string> = {
  query: '查询',
  add: '新增',
  edit: '修改',
  delete: '删除',
  refresh: '刷新',
}
