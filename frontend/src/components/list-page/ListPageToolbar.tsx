import type { CSSProperties, ReactNode } from 'react'
import { Button, Card, Space } from 'antd'
import { QueryIcon } from '../action-icons'
import { ACTION_ICON_LABELS } from '../action-icons'

export interface ListPageToolbarProps {
  /** 为 false 时不展示「查询」切换按钮及查询区（仅保留 children，如无列表筛选权限时） */
  showSearchToggle?: boolean
  /**
   * 是否展开「查询条件」区域。
   * 工具栏第一个按钮为「查询」，用于展开/收起；区域内的表单由各模块自定义（字段与列表列对应）。
   */
  searchExpanded: boolean
  onToggleSearch: () => void
  /** 展开时显示在表格上方的查询内容（如 SearchForm、关键词 Input 等） */
  searchContent?: ReactNode
  /** 为 true 时禁用「查询」切换按钮 */
  toggleSearchDisabled?: boolean
  /**
   * 紧挨在「查询」右侧的操作按钮（新增、修改、删除、刷新等），
   * 建议使用多个 `<Button />`，由父级用权限等方式控制展示。
   */
  children?: ReactNode
  className?: string
  style?: CSSProperties
  /** 仅作用于顶部按钮行 */
  toolbarStyle?: CSSProperties
  /** 查询区 Card 的 className */
  searchPanelClassName?: string
}

/**
 * 列表页通用工具栏：所有按钮靠右排列；「查询」控制查询条件面板的展示。
 */
export function ListPageToolbar({
  showSearchToggle = true,
  searchExpanded,
  onToggleSearch,
  searchContent,
  toggleSearchDisabled = false,
  children,
  className,
  style,
  toolbarStyle,
  searchPanelClassName,
}: ListPageToolbarProps) {
  const panelVisible = showSearchToggle && searchExpanded && searchContent != null

  return (
    <div className={className} style={style}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 12,
          ...toolbarStyle,
        }}
      >
        <Space wrap style={{ justifyContent: 'flex-end' }}>
          {showSearchToggle ? (
            <Button
              icon={<QueryIcon />}
              type={searchExpanded ? 'primary' : 'default'}
              disabled={toggleSearchDisabled}
              onClick={onToggleSearch}
              title={ACTION_ICON_LABELS.query}
              aria-label={ACTION_ICON_LABELS.query}
            />
          ) : null}
          {children}
        </Space>
      </div>
      {panelVisible ? (
        <Card size="small" className={searchPanelClassName} style={{ marginBottom: 16 }}>
          {searchContent}
        </Card>
      ) : null}
    </div>
  )
}
