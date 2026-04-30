from django.db import models
from django.utils.translation import gettext_lazy as _

from core.models import BaseModel


class Country(BaseModel):
    """国家/地区。"""

    name_zh = models.CharField(_('Chinese Name'), max_length=128)
    name_en = models.CharField(_('English Name'), max_length=128)
    iso_alpha_2 = models.CharField(
        _('ISO 3166-1 alpha-2'),
        max_length=2,
        unique=True,
        db_index=True,
    )
    iso_alpha_3 = models.CharField(_('ISO 3166-1 alpha-3'), max_length=3, blank=True)
    phone_code = models.CharField(
        _('International Phone Code'),
        max_length=8,
        blank=True,
        help_text=_('E.g. +86, +1'),
    )
    sort_order = models.PositiveSmallIntegerField(_('Sort Order'), default=0)
    is_active = models.BooleanField(_('Active'), default=True, db_index=True)

    class Meta:
        db_table = 'Country'
        ordering = ['sort_order', 'iso_alpha_2', 'id']
        verbose_name = _('Country/Region')
        verbose_name_plural = _('Countries/Regions')

    def __str__(self) -> str:
        return f'{self.name_zh} ({self.iso_alpha_2})'


class StateProvince(BaseModel):
    """省、州、自治区等一级区划；隶属于国家/地区。"""

    country = models.ForeignKey(
        Country,
        on_delete=models.CASCADE,
        related_name='subdivisions',
        verbose_name=_('Country/Region'),
    )
    name_zh = models.CharField(_('Chinese Name'), max_length=128)
    name_en = models.CharField(_('English Name'), max_length=128)
    code = models.CharField(
        _('Subdivision/State Code'),
        max_length=32,
        blank=True,
        help_text=_('E.g. province short code or US state letters; leave empty if none.'),
    )
    sort_order = models.PositiveSmallIntegerField(_('Sort Order'), default=0)
    is_active = models.BooleanField(_('Active'), default=True, db_index=True)

    class Meta:
        db_table = 'StateProvince'
        ordering = ['country', 'sort_order', 'id']
        verbose_name = _('State/Province')
        verbose_name_plural = _('States/Provinces')

    def __str__(self) -> str:
        return f'{self.name_zh} / {self.country.iso_alpha_2}'


class City(BaseModel):
    """城市，隶属于省/州。"""

    state = models.ForeignKey(
        StateProvince,
        on_delete=models.CASCADE,
        related_name='cities',
        verbose_name=_('State/Province'),
    )
    name_zh = models.CharField(_('Chinese Name'), max_length=128)
    name_en = models.CharField(_('English Name'), max_length=128)
    sort_order = models.PositiveSmallIntegerField(_('Sort Order'), default=0)
    is_active = models.BooleanField(_('Active'), default=True, db_index=True)

    class Meta:
        db_table = 'City'
        ordering = ['state', 'sort_order', 'id']
        verbose_name = _('City')
        verbose_name_plural = _('Cities')

    def __str__(self) -> str:
        return f'{self.name_zh} / {self.state.name_zh}'
