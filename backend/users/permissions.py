from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import user_has_rbac_permission


class HasRBACForViewAction(BasePermission):
    """
    按钮级 / 动作级校验：根据 ViewSet 的 ``action``（list、retrieve、create、
    自定义 @action 名等）在 ``rbac_action_map`` 里查权限码。

    用法::

        class ProductViewSet(viewsets.ModelViewSet):
            permission_classes = [IsAuthenticated, HasRBACForViewAction]
            rbac_action_map = {
                'list': 'products.view',
                'retrieve': 'products.view',
                'create': 'products.create',
                'update': 'products.update',
                'partial_update': 'products.update',
                'destroy': 'products.delete',
                'upload': 'products.upload',      # @action(..., url_path='upload')
                'export': 'products.download',
            }

    未出现在 map 里的 ``action`` 默认 **拒绝**（避免误放行）；可设
    ``rbac_default_deny = False`` 改为未配置时放行（不推荐生产环境）。
    """

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        if getattr(user, 'is_superuser', False):
            return True

        mapping = getattr(view, 'rbac_action_map', None) or {}
        action = getattr(view, 'action', None)
        code = mapping.get(action)
        if code is None:
            code = getattr(view, 'required_rbac_permission', None)
        default_deny = getattr(view, 'rbac_default_deny', True)
        if not code:
            return not default_deny
        return user_has_rbac_permission(user, code)


class HasRBACPermission(BasePermission):
    """
    在视图类上设置 ``required_rbac_permission = '权限代码'``。
    未设置则仅校验已登录（与默认行为一致时需配合 IsAuthenticated）。
    """

    def has_permission(self, request, view):
        code = getattr(view, 'required_rbac_permission', None)
        if not code:
            return bool(request.user and request.user.is_authenticated)
        return user_has_rbac_permission(request.user, code)


class HasRBACPermissionOrReadOnly(BasePermission):
    """安全方法（GET/HEAD/OPTIONS）仅需登录；写操作需要 ``required_rbac_permission``。"""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        code = getattr(view, 'required_rbac_permission', None)
        if not code:
            return bool(request.user and request.user.is_authenticated)
        return user_has_rbac_permission(request.user, code)
