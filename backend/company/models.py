from django.db import models
from ckeditor.fields import RichTextField
from django.utils.translation import gettext_lazy as _

from core.models import BaseModel


class CompanyAbout(BaseModel):
    """
    「关于我们」单页数据：对应站点 Company Profile / About Us 结构。
    后台仅允许一条记录（见 admin）。
    """

    # --- 页眉与公司标识 ---
    company_name = models.CharField(_('Company English Name'), max_length=200, default='Achievers Automation Limited')
    company_name_zh = models.CharField(_('Company Chinese Name'), max_length=200, blank=True)
    slogan = models.CharField(_('Slogan'), max_length=500, blank=True)

    # --- 信息表中常见字段（与 aboutus 侧栏 Company Details 对应）---
    business_type = models.CharField(
        _('Business Type'),
        max_length=300,
        blank=True,
        help_text=_('Example: Distributor/Wholesaler, Trading Company'),
    )
    main_market = models.CharField(_('Main Market'), max_length=200, blank=True, default='Worldwide')
    year_established = models.PositiveSmallIntegerField(_('Year Established'), null=True, blank=True)
    employees_range = models.CharField(
        _('Employees Range'),
        max_length=64,
        blank=True,
        help_text=_('Example: 10~15'),
    )
    annual_sales_range = models.CharField(
        _('Annual Sales Range'),
        max_length=120,
        blank=True,
        help_text=_('Example: 3000000-5000000 (USD note is handled by frontend text)'),
    )
    export_percentage = models.CharField(
        _('Export Percentage'),
        max_length=64,
        blank=True,
        help_text=_('Example: 60% - 70%'),
    )
    main_brands_text = models.TextField(
        _('Main Brands (Text)'),
        blank=True,
        help_text=_('Keep aligned with Brands section on site; supports multiple lines.'),
    )

    # --- 四大块：HIGH QUALITY / DEVELOPMENT / MANUFACTURING / 100% SERVICE ---
    highlight_pillars = models.JSONField(
        _('Core Highlights (4-grid)'),
        default=list,
        blank=True,
        help_text=_('JSON array, each item like {"title":"HIGH QUALITY","body":"..."}'),
    )

    # --- 与站点 Tab：Introduction / History / Service / Our Team 对应 ---
    content_introduction = RichTextField(_('Introduction Content'), blank=True)
    content_history = RichTextField(_('History Content'), blank=True)
    content_service = RichTextField(_('Service Content'), blank=True)
    content_team = RichTextField(_('Our Team Content'), blank=True)

    # --- 法律声明 ---
    legal_disclaimer = RichTextField(_('Legal Disclaimer'), blank=True)

    # --- 联系方式 ---
    contact_person = models.CharField(_('Contact Person'), max_length=120, blank=True)
    contact_phone = models.CharField(_('Phone'), max_length=64, blank=True)
    contact_email = models.EmailField(_('Email'), blank=True)
    offices_description = models.TextField(
        _('Office Description'),
        blank=True,
        help_text=_('Example: descriptions of Hong Kong/Shenzhen offices and teams.'),
    )

    # --- 媒体 ---
    profile_video_url = models.URLField(_('Company Profile Video URL'), max_length=500, blank=True)
    hero_image = models.ImageField(
        _('Hero Image (warehouse/company image)'),
        upload_to='company/about/',
        blank=True,
        null=True,
    )

    class Meta:
        db_table = 'CompanyAbout'
        verbose_name = _('About Us')
        verbose_name_plural = _('About Us')

    def __str__(self) -> str:
        return self.company_name or _('About Us')


class CompanyContact(BaseModel):
    """
    「联系我们」单页：地址、工厂、营业时间、总机说明等（站点顶部表格）。
    后台仅允许一条记录；具体对接人见 ContactPerson。
    """

    company_name = models.CharField(_('Display Company Name'), max_length=200, default='Achievers Automation Limited')
    registered_address = models.TextField(
        _('Registered/Office Address'),
        blank=True,
        help_text=_('Example: full Hong Kong office address.'),
    )
    factory_address = models.TextField(_('Factory/Warehouse Address'), blank=True)
    work_hours = models.CharField(
        _('Business Hours'),
        max_length=200,
        blank=True,
        help_text=_('Example: 8:00-19:00 (Beijing time)'),
    )
    business_phone_note = models.TextField(
        _('Business Phone Note'),
        blank=True,
        help_text=_('Supports multiline notes, e.g. Working/Nonworking extension details.'),
    )
    inquiry_hint = models.CharField(
        _('Inquiry Hint Text'),
        max_length=300,
        blank=True,
        help_text=_('Example: Send your inquiry directly to us'),
    )

    class Meta:
        db_table = 'CompanyContact'
        verbose_name = _('Contact Us (Header Info)')
        verbose_name_plural = _('Contact Us (Header Info)')

    def __str__(self) -> str:
        return self.company_name or _('Contact Us')


class ContactPerson(BaseModel):
    """对接联系人：站点上可有多位（如 Caroline、Cathy）。"""

    contact_page = models.ForeignKey(
        CompanyContact,
        verbose_name=_('Contact Page'),
        on_delete=models.CASCADE,
        related_name='persons',
    )
    name = models.CharField(_('Name'), max_length=120)
    job_title = models.CharField(_('Job Title'), max_length=120, blank=True)
    business_phone = models.CharField(_('Business Phone'), max_length=64, blank=True)
    whatsapp = models.CharField('WhatsApp', max_length=64, blank=True)
    wechat = models.CharField('WeChat', max_length=64, blank=True)
    email = models.EmailField(_('Email'), blank=True)
    sort_order = models.PositiveSmallIntegerField(_('Sort Order'), default=0)
    is_active = models.BooleanField(_('Visible'), default=True)

    class Meta:
        db_table = 'ContactPerson'
        ordering = ['contact_page', 'sort_order', 'id']
        verbose_name = _('Contact Person')
        verbose_name_plural = _('Contact Persons')

    def __str__(self) -> str:
        return self.name
