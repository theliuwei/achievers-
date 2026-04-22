from django.db import models

from core.models import BaseModel


class ProductCategory(BaseModel):
    """
    产品线 / 类目：对应站点上的「ALLEN BRADLEY PLC Products」等，
    一般挂在一个品牌下；支持多级类目（parent）。
    """

    brand = models.ForeignKey(
        'brands.Brand',
        verbose_name='品牌',
        on_delete=models.PROTECT,
        related_name='product_categories',
    )
    parent = models.ForeignKey(
        'self',
        verbose_name='上级类目',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='children',
    )
    name = models.CharField('类目名称', max_length=255, db_index=True)
    slug = models.SlugField('URL 标识', max_length=280, db_index=True)
    description = models.TextField('说明', blank=True)
    sort_order = models.PositiveSmallIntegerField('排序', default=0)
    is_active = models.BooleanField('启用', default=True)
    # 若从外站同步，可用于深链或去重
    external_slug = models.CharField(
        '外部站点 slug',
        max_length=300,
        blank=True,
        help_text='例如 supplier-4327614-endress-hauser-instruments',
    )

    class Meta:
        ordering = ['brand', 'sort_order', 'name']
        verbose_name = '产品类目'
        verbose_name_plural = '产品类目'
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
        DRAFT = 'draft', '草稿'
        ACTIVE = 'active', '上架'
        ARCHIVED = 'archived', '归档'

    category = models.ForeignKey(
        ProductCategory,
        verbose_name='类目',
        on_delete=models.PROTECT,
        related_name='products',
    )
    sku = models.CharField(
        '订货号 / 型号',
        max_length=160,
        null=True,
        blank=True,
        db_index=True,
        help_text='厂商订货号或型号，可与站点标题中一致。',
    )
    name = models.CharField('名称', max_length=500)
    slug = models.SlugField('URL 标识', max_length=520, unique=True, db_index=True)
    summary = models.CharField('摘要', max_length=1000, blank=True)
    description = models.TextField('详情', blank=True)
    attributes = models.JSONField(
        '扩展属性',
        default=dict,
        blank=True,
        help_text='JSON，存放电压、协议、通道数等差异化字段。',
    )
    origin_country = models.CharField('原产地', max_length=100, blank=True)
    source_url = models.URLField('来源页 URL', max_length=800, blank=True)
    external_id = models.CharField(
        '外部系统 ID',
        max_length=120,
        blank=True,
        db_index=True,
        help_text='同步或爬虫侧主键，可选。',
    )
    status = models.CharField(
        '状态',
        max_length=16,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    sort_order = models.PositiveSmallIntegerField('排序', default=0)

    class Meta:
        ordering = ['category', 'sort_order', 'sku', 'name']
        verbose_name = '产品'
        verbose_name_plural = '产品'
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
        verbose_name='产品',
        on_delete=models.CASCADE,
        related_name='images',
    )
    image_url = models.URLField('图片 URL', max_length=800)
    alt_text = models.CharField('替代文本', max_length=255, blank=True)
    sort_order = models.PositiveSmallIntegerField('排序', default=0)
    is_primary = models.BooleanField('主图', default=False)

    class Meta:
        ordering = ['product', 'sort_order', 'id']
        verbose_name = '产品图片'
        verbose_name_plural = '产品图片'

    def __str__(self) -> str:
        return f'{self.product_id}: {self.image_url[:60]}'
