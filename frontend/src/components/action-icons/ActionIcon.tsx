import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import type { CSSProperties } from 'react'

export type ActionIconType = 'query' | 'add' | 'edit' | 'delete' | 'refresh'

const ICON_MAP = {
  query: SearchOutlined,
  add: PlusOutlined,
  edit: EditOutlined,
  delete: DeleteOutlined,
  refresh: ReloadOutlined,
} as const

export type ActionIconProps = {
  type: ActionIconType
  className?: string
  style?: CSSProperties
  /** 像素字号，默认 16，与 Ant Design Button `icon` 常见尺寸一致 */
  size?: number
  /** 装饰性图标时建议 true（默认），由屏幕阅读器忽略 */
  'aria-hidden'?: boolean
}

/**
 * 通用操作图标：查询、新增、修改、删除、刷新。仅负责展示，业务与权限在页面层处理。
 */
export const ActionIcon = ({
  type,
  className,
  style,
  size = 16,
  'aria-hidden': ariaHidden = true,
}: ActionIconProps) => {
  const Cmp = ICON_MAP[type]
  return (
    <Cmp
      className={className}
      style={{ fontSize: size, ...style }}
      aria-hidden={ariaHidden}
    />
  )
}

export type ActionIconShortcutProps = Omit<ActionIconProps, 'type'>

export const QueryIcon = (props: ActionIconShortcutProps) => (
  <ActionIcon type="query" {...props} />
)

export const AddIcon = (props: ActionIconShortcutProps) => (
  <ActionIcon type="add" {...props} />
)

export const EditIcon = (props: ActionIconShortcutProps) => (
  <ActionIcon type="edit" {...props} />
)

export const DeleteIcon = (props: ActionIconShortcutProps) => (
  <ActionIcon type="delete" {...props} />
)

export const RefreshIcon = (props: ActionIconShortcutProps) => (
  <ActionIcon type="refresh" {...props} />
)
