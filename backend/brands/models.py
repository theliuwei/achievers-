from django.db import models
from django.utils.translation import gettext_lazy as _

from core.models import BaseModel


class Brand(BaseModel):
    """制造商 / 品牌（如 ALLEN BRADLEY、YOKOGAWA、Endress+Hauser）。"""

    name = models.CharField(_('Name'), max_length=200, db_index=True)
    slug = models.SlugField(_('URL Slug'), max_length=220, unique=True, db_index=True)
    short_name = models.CharField(
        _('Short Name'),
        max_length=120,
        blank=True,
        help_text=_('Used in list or next to logo; can be same as name.'),
    )
    description = models.TextField(_('Description'), blank=True)
    website = models.URLField(_('Website'), blank=True)
    sort_order = models.PositiveSmallIntegerField(_('Sort Order'), default=0)
    is_active = models.BooleanField(_('Active'), default=True)

    class Meta:
        db_table = 'Brand'
        ordering = ['sort_order', 'name']
        verbose_name = _('Brand')
        verbose_name_plural = _('Brands')

    def __str__(self) -> str:
        return self.name
