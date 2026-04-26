from django.db import models

from core.models import BaseModel


class Country(BaseModel):
    """国家/地区。"""

    name_zh = models.CharField('中文名称', max_length=128)
    name_en = models.CharField('英文名称', max_length=128)
    iso_alpha_2 = models.CharField(
        'ISO 3166-1 alpha-2',
        max_length=2,
        unique=True,
        db_index=True,
    )
    iso_alpha_3 = models.CharField('ISO 3166-1 alpha-3', max_length=3, blank=True)
    phone_code = models.CharField(
        '国际电话区号',
        max_length=8,
        blank=True,
        help_text='如 +86、+1',
    )
    sort_order = models.PositiveSmallIntegerField('排序', default=0)
    is_active = models.BooleanField('启用', default=True, db_index=True)

    class Meta:
        db_table = 'Country'
        ordering = ['sort_order', 'iso_alpha_2', 'id']
        verbose_name = '国家/地区'
        verbose_name_plural = '国家/地区'

    def __str__(self) -> str:
        return f'{self.name_zh} ({self.iso_alpha_2})'


class StateProvince(BaseModel):
    """省、州、自治区等一级区划；隶属于国家/地区。"""

    country = models.ForeignKey(
        Country,
        on_delete=models.CASCADE,
        related_name='subdivisions',
        verbose_name='国家/地区',
    )
    name_zh = models.CharField('中文名称', max_length=128)
    name_en = models.CharField('英文名称', max_length=128)
    code = models.CharField(
        '区划/州代码',
        max_length=32,
        blank=True,
        help_text='如省简称、美州两字母等，无则留空',
    )
    sort_order = models.PositiveSmallIntegerField('排序', default=0)
    is_active = models.BooleanField('启用', default=True, db_index=True)

    class Meta:
        db_table = 'StateProvince'
        ordering = ['country', 'sort_order', 'id']
        verbose_name = '省/州'
        verbose_name_plural = '省/州'

    def __str__(self) -> str:
        return f'{self.name_zh} / {self.country.iso_alpha_2}'


class City(BaseModel):
    """城市，隶属于省/州。"""

    state = models.ForeignKey(
        StateProvince,
        on_delete=models.CASCADE,
        related_name='cities',
        verbose_name='省/州',
    )
    name_zh = models.CharField('中文名称', max_length=128)
    name_en = models.CharField('英文名称', max_length=128)
    sort_order = models.PositiveSmallIntegerField('排序', default=0)
    is_active = models.BooleanField('启用', default=True, db_index=True)

    class Meta:
        db_table = 'City'
        ordering = ['state', 'sort_order', 'id']
        verbose_name = '城市'
        verbose_name_plural = '城市'

    def __str__(self) -> str:
        return f'{self.name_zh} / {self.state.name_zh}'
