from django.db import models

from core.models import BaseModel


class Brand(BaseModel):
    """制造商 / 品牌（如 ALLEN BRADLEY、YOKOGAWA、Endress+Hauser）。"""

    name = models.CharField('名称', max_length=200, db_index=True)
    slug = models.SlugField('URL 标识', max_length=220, unique=True, db_index=True)
    short_name = models.CharField(
        '简称',
        max_length=120,
        blank=True,
        help_text='列表或徽标旁展示用，可与 name 相同。',
    )
    description = models.TextField('简介', blank=True)
    website = models.URLField('官网', blank=True)
    sort_order = models.PositiveSmallIntegerField('排序', default=0)
    is_active = models.BooleanField('启用', default=True)

    class Meta:
        ordering = ['sort_order', 'name']
        verbose_name = '品牌'
        verbose_name_plural = '品牌'

    def __str__(self) -> str:
        return self.name
