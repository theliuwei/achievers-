from django.db import models
from django.utils.translation import gettext_lazy as _

from core.models import BaseModel


class ProductCategory(BaseModel):
    """
    产品线 / 类目：对应站点上的「ALLEN BRADLEY PLC Products」等，
    一般挂在一个品牌下；支持多级类目（parent）。
    """

    brand = models.ForeignKey(
        'brands.Brand',
        verbose_name=_('Brand'),
        on_delete=models.PROTECT,
        related_name='product_categories',
    )
    parent = models.ForeignKey(
        'self',
        verbose_name=_('Parent Category'),
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='children',
    )
    name = models.CharField(_('Category Name'), max_length=255, db_index=True)
    slug = models.SlugField(_('URL Slug'), max_length=280, db_index=True)
    description = models.TextField(_('Description'), blank=True)
    sort_order = models.PositiveSmallIntegerField(_('Sort Order'), default=0)
    is_active = models.BooleanField(_('Active'), default=True)
    # 若从外站同步，可用于深链或去重
    external_slug = models.CharField(
        _('External Site Slug'),
        max_length=300,
        blank=True,
        help_text=_('For example: supplier-4327614-endress-hauser-instruments'),
    )

    class Meta:
        db_table = 'ProductCategory'
        ordering = ['brand', 'sort_order', 'name']
        verbose_name = _('Product Category')
        verbose_name_plural = _('Product Categories')
        constraints = [
            models.UniqueConstraint(
                fields=['brand', 'slug'],
                name='uniq_productcategory_brand_slug',
            ),
        ]

    def __str__(self) -> str:
        return f'{self.brand} / {self.name}'


class Product(BaseModel):
    """
    通用商品主档：订货号、标题、富文本描述、扩展规格(JSON)。
    品牌通过 category.brand 取得；同一订货号在不同品牌下可并存。
    """

    class Status(models.TextChoices):
        DRAFT = 'draft', _('Draft')
        ACTIVE = 'active', _('Active')
        ARCHIVED = 'archived', _('Archived')

    category = models.ForeignKey(
        ProductCategory,
        verbose_name=_('Category'),
        on_delete=models.PROTECT,
        related_name='products',
    )
    sku = models.CharField(
        _('SKU / Model'),
        max_length=160,
        null=True,
        blank=True,
        db_index=True,
        help_text=_('Vendor part number or model, usually matching site title.'),
    )
    name = models.CharField(_('Name'), max_length=500)
    slug = models.SlugField(_('URL Slug'), max_length=520, unique=True, db_index=True)
    summary = models.CharField(_('Summary'), max_length=1000, blank=True)
    description = models.TextField(_('Description'), blank=True)
    attributes = models.JSONField(
        _('Attributes'),
        default=dict,
        blank=True,
        help_text=_('JSON fields like voltage, protocol, channel count, and more.'),
    )
    origin_country = models.CharField(_('Origin Country'), max_length=100, blank=True)
    source_url = models.URLField(_('Source URL'), max_length=800, blank=True)
    external_id = models.CharField(
        _('External System ID'),
        max_length=120,
        blank=True,
        db_index=True,
        help_text=_('Optional ID from external sync/crawler systems.'),
    )
    status = models.CharField(
        _('Status'),
        max_length=16,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    sort_order = models.PositiveSmallIntegerField(_('Sort Order'), default=0)

    class Meta:
        db_table = 'Product'
        ordering = ['category', 'sort_order', 'sku', 'name']
        verbose_name = _('Product')
        verbose_name_plural = _('Products')
        constraints = [
            models.UniqueConstraint(
                fields=['category', 'sku'],
                name='uniq_product_category_sku_when_sku_set',
                condition=models.Q(sku__isnull=False),
            ),
        ]

    def __str__(self) -> str:
        return self.name

    @property
    def brand(self):
        return self.category.brand


class ProductImage(BaseModel):
    """商品图片：支持外链（抓取站点多用 CDN 地址）。"""

    product = models.ForeignKey(
        Product,
        verbose_name=_('Product'),
        on_delete=models.CASCADE,
        related_name='images',
    )
    image_url = models.URLField(_('Image URL'), max_length=800)
    alt_text = models.CharField(_('Alt Text'), max_length=255, blank=True)
    sort_order = models.PositiveSmallIntegerField(_('Sort Order'), default=0)
    is_primary = models.BooleanField(_('Primary Image'), default=False)

    class Meta:
        db_table = 'ProductImage'
        ordering = ['product', 'sort_order', 'id']
        verbose_name = _('Product Image')
        verbose_name_plural = _('Product Images')

    def __str__(self) -> str:
        return f'{self.product_id}: {self.image_url[:60]}'


class ProductCategoryTranslation(BaseModel):
    """Localized fields for ProductCategory."""

    class LanguageCode(models.TextChoices):
        EN = 'en', _('English')
        ZH_HANS = 'zh-hans', _('Simplified Chinese')
        ID = 'id', _('Indonesian')
        VI = 'vi', _('Vietnamese')
        RU = 'ru', _('Russian')
        DE = 'de', _('German')
        FR = 'fr', _('French')
        ES = 'es', _('Spanish')
        IT = 'it', _('Italian')
        PT = 'pt', _('Portuguese')
        PL = 'pl', _('Polish')
        NL = 'nl', _('Dutch')
        TH = 'th', _('Thai')

    category = models.ForeignKey(
        ProductCategory,
        verbose_name=_('Category'),
        on_delete=models.CASCADE,
        related_name='translations',
    )
    language = models.CharField(_('Language'), max_length=10, choices=LanguageCode.choices, db_index=True)
    name = models.CharField(_('Name'), max_length=255)
    description = models.TextField(_('Description'), blank=True, default='')
    seo_title = models.CharField(_('SEO Title'), max_length=255, blank=True, default='')
    seo_description = models.CharField(_('SEO Description'), max_length=500, blank=True, default='')

    class Meta:
        db_table = 'ProductCategoryTranslation'
        verbose_name = _('Product Category Translation')
        verbose_name_plural = _('Product Category Translations')
        ordering = ['category_id', 'language']
        constraints = [
            models.UniqueConstraint(
                fields=['category', 'language'],
                name='uniq_product_category_translation_category_language',
            ),
        ]

    def __str__(self) -> str:
        return f'{self.category_id}:{self.language}'


class ProductTranslation(BaseModel):
    """Localized fields for Product."""

    class LanguageCode(models.TextChoices):
        EN = 'en', _('English')
        ZH_HANS = 'zh-hans', _('Simplified Chinese')
        ID = 'id', _('Indonesian')
        VI = 'vi', _('Vietnamese')
        RU = 'ru', _('Russian')
        DE = 'de', _('German')
        FR = 'fr', _('French')
        ES = 'es', _('Spanish')
        IT = 'it', _('Italian')
        PT = 'pt', _('Portuguese')
        PL = 'pl', _('Polish')
        NL = 'nl', _('Dutch')
        TH = 'th', _('Thai')

    product = models.ForeignKey(
        Product,
        verbose_name=_('Product'),
        on_delete=models.CASCADE,
        related_name='translations',
    )
    language = models.CharField(_('Language'), max_length=10, choices=LanguageCode.choices, db_index=True)
    name = models.CharField(_('Name'), max_length=500)
    summary = models.CharField(_('Summary'), max_length=1000, blank=True, default='')
    description = models.TextField(_('Description'), blank=True, default='')
    seo_title = models.CharField(_('SEO Title'), max_length=255, blank=True, default='')
    seo_description = models.CharField(_('SEO Description'), max_length=500, blank=True, default='')

    class Meta:
        db_table = 'ProductTranslation'
        verbose_name = _('Product Translation')
        verbose_name_plural = _('Product Translations')
        ordering = ['product_id', 'language']
        constraints = [
            models.UniqueConstraint(
                fields=['product', 'language'],
                name='uniq_product_translation_product_language',
            ),
        ]

    def __str__(self) -> str:
        return f'{self.product_id}:{self.language}'


class ProductLocalizedImage(BaseModel):
    """Optional language-specific images for Product."""

    product = models.ForeignKey(
        Product,
        verbose_name=_('Product'),
        on_delete=models.CASCADE,
        related_name='localized_images',
    )
    language = models.CharField(_('Language'), max_length=10, choices=ProductTranslation.LanguageCode.choices, db_index=True)
    image_url = models.URLField(_('Image URL'), max_length=800)
    alt_text = models.CharField(_('Alt Text'), max_length=255, blank=True, default='')
    sort_order = models.PositiveSmallIntegerField(_('Sort Order'), default=0)
    is_primary = models.BooleanField(_('Primary Image'), default=False)

    class Meta:
        db_table = 'ProductLocalizedImage'
        verbose_name = _('Product Localized Image')
        verbose_name_plural = _('Product Localized Images')
        ordering = ['product_id', 'language', 'sort_order', 'id']

    def __str__(self) -> str:
        return f'{self.product_id}:{self.language}'
