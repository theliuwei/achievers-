"""
与 ``HasRBACForViewAction`` 搭配使用，减少重复填写 ``rbac_action_map``。
"""

from __future__ import annotations

from users.rbac_codes import p, resource_actions


def rbac_map_for_resource(resource: str) -> dict[str, str]:
    """
    返回标准 CRUD + upload/download 的映射；自定义 @action 请在返回 dict 上
    用 | {'export': p(resource, 'download')} 合并。
    """
    return resource_actions(resource)


__all__ = ['p', 'rbac_map_for_resource', 'resource_actions']
