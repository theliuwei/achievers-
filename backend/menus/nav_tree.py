from __future__ import annotations

from typing import Any

from django.contrib.auth.models import AbstractUser

from users.models import user_has_rbac_permission

from .models import NavMenuItem


def build_nav_tree_for_user(user: AbstractUser) -> list[dict[str, Any]]:
    """按 RBAC 过滤后返回前端可用的菜单树（含 Ant Menu 的 key）。"""

    def visit(parent: NavMenuItem | None) -> list[dict[str, Any]]:
        result: list[dict[str, Any]] = []
        qs = NavMenuItem.objects.filter(parent=parent, is_active=True).order_by(
            'sort_order', 'id'
        )
        for item in qs:
            if item.permission_code and not user_has_rbac_permission(
                user, item.permission_code
            ):
                continue
            children = visit(item)
            has_path = bool(item.path and item.path.strip())
            if not has_path and not children:
                continue
            key = item.path.strip() if item.path else f'__group_{item.pk}'
            node: dict[str, Any] = {
                'key': key,
                'title': item.title,
                'icon': item.icon or '',
                'path': (item.path or '').strip(),
            }
            if children:
                node['children'] = children
            result.append(node)
        return result

    return visit(None)
