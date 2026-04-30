from django.db import models
from django.utils.translation import gettext_lazy as _

from core.models import BaseModel


class NavMenuItem(BaseModel):
    """后台侧边栏菜单（树形）；可在 Django Admin 中维护。"""

    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name=_('Parent'),
    )
    title = models.CharField(_('Title'), max_length=100)
    path = models.CharField(
        _('Frontend Route'),
        max_length=255,
        blank=True,
        help_text=_('For example /admin/products; leave empty for group nodes.'),
    )
    icon = models.CharField(
        _('Icon'),
        max_length=64,
        blank=True,
        help_text=_('Ant Design icon component name, e.g. DashboardOutlined'),
    )
    permission_code = models.CharField(
        _('Required Permission'),
        max_length=128,
        blank=True,
        db_index=True,
        help_text=_('Maps to Permission.code; empty means visible to authenticated users.'),
    )
    sort_order = models.PositiveSmallIntegerField(_('Sort Order'), default=0)
    is_active = models.BooleanField(_('Active'), default=True)

    class Meta:
        db_table = 'NavMenuItem'
        ordering = ['sort_order', 'id']
        verbose_name = _('Navigation Menu Item')
        verbose_name_plural = _('Navigation Menu Items')

    def __str__(self) -> str:
        return self.title
