from django.db import models

from core.models import BaseModel


class NavMenuItem(BaseModel):
    """后台侧边栏菜单（树形）；可在 Django Admin 中维护。"""

    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name='上级',
    )
    title = models.CharField('标题', max_length=100)
    path = models.CharField(
        '前端路由',
        max_length=255,
        blank=True,
        help_text='如 /admin/products；仅作分组时留空',
    )
    icon = models.CharField(
        '图标',
        max_length=64,
        blank=True,
        help_text='Ant Design 图标组件名，如 DashboardOutlined',
    )
    permission_code = models.CharField(
        '所需权限',
        max_length=128,
        blank=True,
        db_index=True,
        help_text='对应 Permission.code；留空表示登录即可见',
    )
    sort_order = models.PositiveSmallIntegerField('排序', default=0)
    is_active = models.BooleanField('启用', default=True)

    class Meta:
        ordering = ['sort_order', 'id']
        verbose_name = '导航菜单项'
        verbose_name_plural = '导航菜单项'

    def __str__(self) -> str:
        return self.title
