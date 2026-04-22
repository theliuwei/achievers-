"""
按钮级 / 接口级权限码约定（存入 Permission.code，JWT 与 /api/v1/me/ 会返回）。

命名：<资源>.<动作>，全小写。常用动作：view、create、update、delete、upload、download。

前端：用 permission_codes 判断按钮是否渲染，例如
codes.includes('products.delete') 或 codes.includes('*')（超管）。

后端：ViewSet 上使用 HasRBACForViewAction + rbac_action_map，或用
users.mixins.rbac_map_for_resource('products') 生成默认映射。
"""

from __future__ import annotations


def p(resource: str, action: str) -> str:
    """生成权限码：``p('products', 'view') -> 'products.view'``。"""
    return f'{resource}.{action}'


# ---- 用户与系统（与 seed_rbac 一致，可在后台再增删）----
USERS_VIEW_RBAC = 'users.view_rbac'
USERS_MANAGE_ROLES = 'users.manage_roles'
USERS_MANAGE_USERS = 'users.manage_users'
API_DOCS = 'api.docs'

# ---- 示例资源：产品（可按项目复制 brands / company 等）----
PRODUCTS = 'products'
BRANDS = 'brands'
COMPANY = 'company'


def resource_actions(resource: str) -> dict[str, str]:
    """某业务资源一组标准 CRUD + 传下载码，便于填 rbac_action_map。"""
    return {
        'list': p(resource, 'view'),
        'retrieve': p(resource, 'view'),
        'create': p(resource, 'create'),
        'update': p(resource, 'update'),
        'partial_update': p(resource, 'update'),
        'destroy': p(resource, 'delete'),
        'upload': p(resource, 'upload'),
        'download': p(resource, 'download'),
    }
