from django.db import models
from django.utils.translation import gettext_lazy as _

from core.models import BaseModel


class Customer(BaseModel):
    class Level(models.TextChoices):
        NORMAL = 'normal', _('Normal')
        IMPORTANT = 'important', _('Important')

    tenant = models.ForeignKey(
        'users.Tenant',
        verbose_name=_('Tenant'),
        on_delete=models.CASCADE,
        related_name='customers',
    )
    name = models.CharField(_('Customer Name'), max_length=120)
    company_name = models.CharField(_('Customer Company'), max_length=200, blank=True, default='')
    country = models.CharField(_('Country/Region'), max_length=120, blank=True, default='')
    email = models.EmailField(_('Email'), blank=True, default='')
    phone = models.CharField(_('Phone'), max_length=64, blank=True, default='')
    whatsapp = models.CharField('WhatsApp', max_length=64, blank=True, default='')
    source = models.CharField(_('Source'), max_length=120, blank=True, default='')
    level = models.CharField(_('Customer Level'), max_length=20, choices=Level.choices, default=Level.NORMAL)
    notes = models.TextField(_('Notes'), blank=True, default='')
    owner = models.ForeignKey(
        'users.UserInfo',
        verbose_name=_('Owner'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='owned_customers',
    )

    class Meta:
        db_table = 'Customer'
        ordering = ['-updated_at', 'id']
        verbose_name = _('Customer')
        verbose_name_plural = _('Customers')

    def __str__(self) -> str:
        return self.name


class Inquiry(BaseModel):
    class Status(models.TextChoices):
        NEW = 'new', _('New')
        CONTACTED = 'contacted', _('Contacted')
        QUOTED = 'quoted', _('Quoted')
        WON = 'won', _('Won')
        INVALID = 'invalid', _('Invalid')

    tenant = models.ForeignKey(
        'users.Tenant',
        verbose_name=_('Tenant'),
        on_delete=models.CASCADE,
        related_name='inquiries',
    )
    customer = models.ForeignKey(
        Customer,
        verbose_name=_('Customer'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inquiries',
    )
    subject = models.CharField(_('Inquiry Subject'), max_length=240)
    product_name = models.CharField(_('Product Name'), max_length=240, blank=True, default='')
    message = models.TextField(_('Inquiry Message'), blank=True, default='')
    country = models.CharField(_('Country/Region'), max_length=120, blank=True, default='')
    source = models.CharField(_('Source'), max_length=120, blank=True, default='Website')
    status = models.CharField(_('Status'), max_length=20, choices=Status.choices, default=Status.NEW)
    assignee = models.ForeignKey(
        'users.UserInfo',
        verbose_name=_('Assignee'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_inquiries',
    )

    class Meta:
        db_table = 'Inquiry'
        ordering = ['-created_at', 'id']
        verbose_name = _('Inquiry')
        verbose_name_plural = _('Inquiries')

    def __str__(self) -> str:
        return self.subject


class Quotation(BaseModel):
    class Status(models.TextChoices):
        DRAFT = 'draft', _('Draft')
        SENT = 'sent', _('Sent')
        CONFIRMED = 'confirmed', _('Confirmed')
        WON = 'won', _('Won')
        LOST = 'lost', _('Lost')

    tenant = models.ForeignKey(
        'users.Tenant',
        verbose_name=_('Tenant'),
        on_delete=models.CASCADE,
        related_name='quotations',
    )
    customer = models.ForeignKey(
        Customer,
        verbose_name=_('Customer'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quotations',
    )
    inquiry = models.ForeignKey(
        Inquiry,
        verbose_name=_('Related Inquiry'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quotations',
    )
    quote_no = models.CharField(_('Quote Number'), max_length=64, unique=True, db_index=True)
    currency = models.CharField(_('Currency'), max_length=12, default='USD')
    total_amount = models.DecimalField(_('Total Amount'), max_digits=12, decimal_places=2, default=0)
    trade_term = models.CharField(_('Trade Term'), max_length=120, blank=True, default='')
    status = models.CharField(_('Status'), max_length=20, choices=Status.choices, default=Status.DRAFT)
    valid_until = models.DateField(_('Valid Until'), null=True, blank=True)
    owner = models.ForeignKey(
        'users.UserInfo',
        verbose_name=_('Owner'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='owned_quotations',
    )

    class Meta:
        db_table = 'Quotation'
        ordering = ['-created_at', 'id']
        verbose_name = _('Quotation')
        verbose_name_plural = _('Quotations')

    def __str__(self) -> str:
        return self.quote_no


class QuotationItem(BaseModel):
    quotation = models.ForeignKey(
        Quotation,
        verbose_name=_('Quotation'),
        on_delete=models.CASCADE,
        related_name='items',
    )
    product = models.ForeignKey(
        'products.Product',
        verbose_name=_('Product'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quotation_items',
    )
    product_name = models.CharField(_('Product Name'), max_length=240)
    sku = models.CharField('型号/SKU', max_length=120, blank=True, default='')
    quantity = models.PositiveIntegerField(_('Quantity'), default=1)
    unit_price = models.DecimalField(_('Unit Price'), max_digits=12, decimal_places=2, default=0)
    total_price = models.DecimalField(_('Subtotal'), max_digits=12, decimal_places=2, default=0)
    remark = models.CharField(_('Remark'), max_length=240, blank=True, default='')

    class Meta:
        db_table = 'QuotationItem'
        ordering = ['quotation_id', 'id']
        verbose_name = _('Quotation Item')
        verbose_name_plural = _('Quotation Items')

    def __str__(self) -> str:
        return self.product_name


class VATRate(BaseModel):
    """Tax rate configuration by country/region + date range."""

    country_code = models.CharField(_('Country Code'), max_length=8, db_index=True)
    name = models.CharField(_('VAT Name'), max_length=100)
    rate = models.DecimalField(_('VAT Rate (%)'), max_digits=5, decimal_places=2)
    is_price_included_default = models.BooleanField(_('Default Tax Included'), default=False)
    effective_from = models.DateField(_('Effective From'))
    effective_to = models.DateField(_('Effective To'), null=True, blank=True)
    is_active = models.BooleanField(_('Active'), default=True, db_index=True)

    class Meta:
        db_table = 'VATRate'
        verbose_name = _('VAT Rate')
        verbose_name_plural = _('VAT Rates')
        ordering = ['country_code', '-effective_from', '-id']

    def __str__(self) -> str:
        return f'{self.country_code}:{self.rate}%'


class ConsentLog(BaseModel):
    """Record user consent operations for GDPR/compliance."""

    class ConsentType(models.TextChoices):
        COOKIE = 'cookie', _('Cookie Consent')
        PRIVACY_POLICY = 'privacy_policy', _('Privacy Policy')
        MARKETING = 'marketing', _('Marketing Consent')
        TERMS = 'terms', _('Terms Agreement')

    class Action(models.TextChoices):
        ACCEPTED = 'accepted', _('Accepted')
        REVOKED = 'revoked', _('Revoked')
        UPDATED = 'updated', _('Updated')

    tenant = models.ForeignKey(
        'users.Tenant',
        verbose_name=_('Tenant'),
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='consent_logs',
    )
    user = models.ForeignKey(
        'users.UserInfo',
        verbose_name=_('User'),
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='consent_logs',
    )
    consent_type = models.CharField(_('Consent Type'), max_length=32, choices=ConsentType.choices, db_index=True)
    action = models.CharField(_('Action'), max_length=16, choices=Action.choices, db_index=True)
    policy_version = models.CharField(_('Policy Version'), max_length=50, blank=True, default='')
    ip_address = models.GenericIPAddressField(_('IP Address'), null=True, blank=True)
    user_agent = models.CharField('User Agent', max_length=500, blank=True, default='')
    metadata = models.JSONField(_('Metadata'), default=dict, blank=True)

    class Meta:
        db_table = 'ConsentLog'
        verbose_name = _('Consent Log')
        verbose_name_plural = _('Consent Logs')
        ordering = ['-created_at', '-id']
