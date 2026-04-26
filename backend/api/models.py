from django.db import models

from core.models import BaseModel


class Customer(BaseModel):
    class Level(models.TextChoices):
        NORMAL = 'normal', '普通'
        IMPORTANT = 'important', '重点'

    tenant = models.ForeignKey(
        'users.Tenant',
        verbose_name='租户',
        on_delete=models.CASCADE,
        related_name='customers',
    )
    name = models.CharField('客户姓名', max_length=120)
    company_name = models.CharField('客户公司', max_length=200, blank=True, default='')
    country = models.CharField('国家/地区', max_length=120, blank=True, default='')
    email = models.EmailField('邮箱', blank=True, default='')
    phone = models.CharField('电话', max_length=64, blank=True, default='')
    whatsapp = models.CharField('WhatsApp', max_length=64, blank=True, default='')
    source = models.CharField('来源', max_length=120, blank=True, default='')
    level = models.CharField('客户等级', max_length=20, choices=Level.choices, default=Level.NORMAL)
    notes = models.TextField('备注', blank=True, default='')
    owner = models.ForeignKey(
        'users.UserInfo',
        verbose_name='负责人',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='owned_customers',
    )

    class Meta:
        db_table = 'Customer'
        ordering = ['-updated_at', 'id']
        verbose_name = '客户'
        verbose_name_plural = '客户'

    def __str__(self) -> str:
        return self.name


class Inquiry(BaseModel):
    class Status(models.TextChoices):
        NEW = 'new', '新询盘'
        CONTACTED = 'contacted', '已联系'
        QUOTED = 'quoted', '已报价'
        WON = 'won', '已成交'
        INVALID = 'invalid', '无效'

    tenant = models.ForeignKey(
        'users.Tenant',
        verbose_name='租户',
        on_delete=models.CASCADE,
        related_name='inquiries',
    )
    customer = models.ForeignKey(
        Customer,
        verbose_name='客户',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inquiries',
    )
    subject = models.CharField('询盘主题', max_length=240)
    product_name = models.CharField('询盘产品', max_length=240, blank=True, default='')
    message = models.TextField('询盘内容', blank=True, default='')
    country = models.CharField('国家/地区', max_length=120, blank=True, default='')
    source = models.CharField('来源', max_length=120, blank=True, default='官网')
    status = models.CharField('状态', max_length=20, choices=Status.choices, default=Status.NEW)
    assignee = models.ForeignKey(
        'users.UserInfo',
        verbose_name='负责人',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_inquiries',
    )

    class Meta:
        db_table = 'Inquiry'
        ordering = ['-created_at', 'id']
        verbose_name = '询盘'
        verbose_name_plural = '询盘'

    def __str__(self) -> str:
        return self.subject


class Quotation(BaseModel):
    class Status(models.TextChoices):
        DRAFT = 'draft', '草稿'
        SENT = 'sent', '已发送'
        CONFIRMED = 'confirmed', '已确认'
        WON = 'won', '已成交'
        LOST = 'lost', '已失效'

    tenant = models.ForeignKey(
        'users.Tenant',
        verbose_name='租户',
        on_delete=models.CASCADE,
        related_name='quotations',
    )
    customer = models.ForeignKey(
        Customer,
        verbose_name='客户',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quotations',
    )
    inquiry = models.ForeignKey(
        Inquiry,
        verbose_name='关联询盘',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quotations',
    )
    quote_no = models.CharField('报价单号', max_length=64, unique=True, db_index=True)
    currency = models.CharField('币种', max_length=12, default='USD')
    total_amount = models.DecimalField('报价总额', max_digits=12, decimal_places=2, default=0)
    trade_term = models.CharField('贸易条款', max_length=120, blank=True, default='')
    status = models.CharField('状态', max_length=20, choices=Status.choices, default=Status.DRAFT)
    valid_until = models.DateField('有效期至', null=True, blank=True)
    owner = models.ForeignKey(
        'users.UserInfo',
        verbose_name='负责人',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='owned_quotations',
    )

    class Meta:
        db_table = 'Quotation'
        ordering = ['-created_at', 'id']
        verbose_name = '报价'
        verbose_name_plural = '报价'

    def __str__(self) -> str:
        return self.quote_no


class QuotationItem(BaseModel):
    quotation = models.ForeignKey(
        Quotation,
        verbose_name='报价单',
        on_delete=models.CASCADE,
        related_name='items',
    )
    product = models.ForeignKey(
        'products.Product',
        verbose_name='产品',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quotation_items',
    )
    product_name = models.CharField('产品名称', max_length=240)
    sku = models.CharField('型号/SKU', max_length=120, blank=True, default='')
    quantity = models.PositiveIntegerField('数量', default=1)
    unit_price = models.DecimalField('单价', max_digits=12, decimal_places=2, default=0)
    total_price = models.DecimalField('小计', max_digits=12, decimal_places=2, default=0)
    remark = models.CharField('备注', max_length=240, blank=True, default='')

    class Meta:
        db_table = 'QuotationItem'
        ordering = ['quotation_id', 'id']
        verbose_name = '报价明细'
        verbose_name_plural = '报价明细'

    def __str__(self) -> str:
        return self.product_name
