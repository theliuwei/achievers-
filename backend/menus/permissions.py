from rest_framework.permissions import BasePermission

from users.models import user_has_rbac_permission


class HasNavMenuItemRBAC(BasePermission):
    """
    导航菜单项接口与前端工具栏权限码一致：
    - list/retrieve：menus.query 或 menus.refresh（刷新列表与查询共用读接口）
    - create / update / partial_update / destroy：对应写权限
    """

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        if getattr(user, 'is_superuser', False):
            return True

        action = getattr(view, 'action', None)
        if action in ('list', 'retrieve'):
            return user_has_rbac_permission(user, 'menus.query', request) or user_has_rbac_permission(
                user, 'menus.refresh', request
            )

        action_code = {
            'create': 'menus.create',
            'update': 'menus.update',
            'partial_update': 'menus.update',
            'destroy': 'menus.delete',
        }.get(action)
        if not action_code:
            return False
        return user_has_rbac_permission(user, action_code, request)
