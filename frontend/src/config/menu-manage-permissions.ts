/**
 * 与后端 Permission.code、NavMenuItemViewSet RBAC 一致；在 Django Admin 为角色勾选即可控制按钮显隐。
 */
export const MENU_MANAGE_PERMS = {
  query: 'menus.query',
  refresh: 'menus.refresh',
  create: 'menus.create',
  update: 'menus.update',
  delete: 'menus.delete',
} as const

export type MenuManagePermKey = keyof typeof MENU_MANAGE_PERMS
