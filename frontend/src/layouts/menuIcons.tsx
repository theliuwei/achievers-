/**
 * 图标名由后端菜单数据的 icon 字段传入，此处仅做展示层映射（非业务规则）。
 */
import {
  ApiOutlined,
  AppstoreOutlined,
  AuditOutlined,
  DashboardOutlined,
  FolderOutlined,
  HomeOutlined,
  MenuOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import type { ComponentType, ReactNode } from 'react'

/** 与后台 NavMenuItem.icon 对应；新增图标名时在此注册 */
const ICON_MAP: Record<string, ComponentType<object>> = {
  DashboardOutlined,
  SettingOutlined,
  ApiOutlined,
  AppstoreOutlined,
  AuditOutlined,
  FolderOutlined,
  HomeOutlined,
  MenuOutlined,
  TeamOutlined,
  UserOutlined,
}

export const renderMenuIcon = (name: string): ReactNode => {
  if (!name) {
    return undefined
  }
  const Cmp = ICON_MAP[name]
  return Cmp ? <Cmp /> : <AppstoreOutlined />
}
