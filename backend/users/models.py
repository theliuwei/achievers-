from django.conf import settings
from django.db import models

from core.models import BaseModel


class Permission(BaseModel):
    """细粒度权限点，供角色绑定；code 在业务代码中用于校验。"""

    code = models.CharField('权限代码', max_length=128, unique=True, db_index=True)
    name = models.CharField('名称', max_length=150)
    description = models.TextField('说明', blank=True)
    sort_order = models.PositiveSmallIntegerField('排序', default=0)

    class Meta:
        ordering = ['sort_order', 'code']
        verbose_name = '权限'
        verbose_name_plural = '权限'

    def __str__(self) -> str:
        return f'{self.name} ({self.code})'


class Role(BaseModel):
    """角色：多对多绑定 Permission，用户通过 UserProfile.roles 获得权限。"""

    code = models.SlugField('角色代码', max_length=64, unique=True, db_index=True)
    name = models.CharField('名称', max_length=100)
    description = models.TextField('说明', blank=True)
    is_active = models.BooleanField('启用', default=True)
    is_system = models.BooleanField(
        '系统内置',
        default=False,
        help_text='内置角色不建议删除，仅可通过后台管理权限集合。',
    )
    permissions = models.ManyToManyField(
        Permission,
        verbose_name='权限',
        blank=True,
        related_name='roles',
    )

    class Meta:
        ordering = ['code']
        verbose_name = '角色'
        verbose_name_plural = '角色'

    def __str__(self) -> str:
        return self.name


class UserProfile(BaseModel):
    """与 User 一对一，承载 RBAC 角色。"""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rbac_profile',
        verbose_name='用户',
    )
    roles = models.ManyToManyField(
        Role,
        verbose_name='角色',
        blank=True,
        related_name='user_profiles',
    )
    pending_approval = models.BooleanField(
        '待审批注册',
        default=False,
        db_index=True,
        help_text='公开注册且尚未通过管理员审批时为 True；审批通过后清零。',
    )

    class Meta:
        verbose_name = '用户扩展(RBAC)'
        verbose_name_plural = '用户扩展(RBAC)'

    def __str__(self) -> str:
        return f'RBAC:{self.user_id}'

    def get_permission_codes(self) -> set[str]:
        """当前用户通过所有启用角色继承的权限代码集合。"""
        codes: set[str] = set()
        role_qs = self.roles.filter(is_active=True).prefetch_related('permissions')
        for role in role_qs:
            codes.update(role.permissions.values_list('code', flat=True))
        return codes

    def has_permission(self, code: str) -> bool:
        user = self.user
        if not user.is_active:
            return False
        if user.is_superuser:
            return True
        return code in self.get_permission_codes()


def user_has_rbac_permission(user, code: str) -> bool:
    """供视图 / DRF Permission 调用。"""
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    try:
        return user.rbac_profile.has_permission(code)
    except UserProfile.DoesNotExist:
        return False
