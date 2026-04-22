from django.db import models
from ckeditor.fields import RichTextField

from core.models import BaseModel


class CompanyAbout(BaseModel):
    """
    「关于我们」单页数据：对应站点 Company Profile / About Us 结构。
    后台仅允许一条记录（见 admin）。
    """

    # --- 页眉与公司标识 ---
    company_name = models.CharField('公司英文名称', max_length=200, default='Achievers Automation Limited')
    company_name_zh = models.CharField('公司中文名称', max_length=200, blank=True)
    slogan = models.CharField('一句话简介', max_length=500, blank=True)

    # --- 信息表中常见字段（与 aboutus 侧栏 Company Details 对应）---
    business_type = models.CharField(
        '经营类型',
        max_length=300,
        blank=True,
        help_text='例如：Distributor/Wholesaler, Trading Company',
    )
    main_market = models.CharField('主要市场', max_length=200, blank=True, default='Worldwide')
    year_established = models.PositiveSmallIntegerField('成立年份', null=True, blank=True)
    employees_range = models.CharField(
        '人员规模',
        max_length=64,
        blank=True,
        help_text='例如：10~15',
    )
    annual_sales_range = models.CharField(
        '年销售额区间',
        max_length=120,
        blank=True,
        help_text='例如：3000000-5000000（USD 等由前端文案说明）',
    )
    export_percentage = models.CharField(
        '出口占比',
        max_length=64,
        blank=True,
        help_text='例如：60% - 70%',
    )
    main_brands_text = models.TextField(
        '主营品牌（文本）',
        blank=True,
        help_text='与站点 Brands 栏一致，可多行。',
    )

    # --- 四大块：HIGH QUALITY / DEVELOPMENT / MANUFACTURING / 100% SERVICE ---
    highlight_pillars = models.JSONField(
        '核心优势（四宫格）',
        default=list,
        blank=True,
        help_text='JSON 数组，每项形如 {"title": "HIGH QUALITY", "body": "..."}',
    )

    # --- 与站点 Tab：Introduction / History / Service / Our Team 对应 ---
    content_introduction = RichTextField('Introduction 正文', blank=True)
    content_history = RichTextField('History 正文', blank=True)
    content_service = RichTextField('Service 正文', blank=True)
    content_team = RichTextField('Our Team 正文', blank=True)

    # --- 法律声明 ---
    legal_disclaimer = RichTextField('法律声明 / Disclaimer', blank=True)

    # --- 联系方式 ---
    contact_person = models.CharField('联系人', max_length=120, blank=True)
    contact_phone = models.CharField('电话', max_length=64, blank=True)
    contact_email = models.EmailField('邮箱', blank=True)
    offices_description = models.TextField(
        '办公地点说明',
        blank=True,
        help_text='例如香港、深圳办公室及团队说明。',
    )

    # --- 媒体 ---
    profile_video_url = models.URLField('公司介绍视频 URL', max_length=500, blank=True)
    hero_image = models.ImageField(
        '主图（如仓库/公司图）',
        upload_to='company/about/',
        blank=True,
        null=True,
    )

    class Meta:
        verbose_name = '关于我们'
        verbose_name_plural = '关于我们'

    def __str__(self) -> str:
        return self.company_name or '关于我们'


class CompanyContact(BaseModel):
    """
    「联系我们」单页：地址、工厂、营业时间、总机说明等（站点顶部表格）。
    后台仅允许一条记录；具体对接人见 ContactPerson。
    """

    company_name = models.CharField('公司显示名称', max_length=200, default='Achievers Automation Limited')
    registered_address = models.TextField(
        '注册/办公地址',
        blank=True,
        help_text='例如香港办公地址全文。',
    )
    factory_address = models.TextField('工厂/仓库地址', blank=True)
    work_hours = models.CharField(
        '营业时间',
        max_length=200,
        blank=True,
        help_text='例如：8:00-19:00(Beijing time)',
    )
    business_phone_note = models.TextField(
        '业务电话说明',
        blank=True,
        help_text='可写多行，如 Working / Nonworking 分机说明。',
    )
    inquiry_hint = models.CharField(
        '询盘表单提示文案',
        max_length=300,
        blank=True,
        help_text='例如：Send your inquiry directly to us',
    )

    class Meta:
        verbose_name = '联系我们（页头信息）'
        verbose_name_plural = '联系我们（页头信息）'

    def __str__(self) -> str:
        return self.company_name or '联系我们'


class ContactPerson(BaseModel):
    """对接联系人：站点上可有多位（如 Caroline、Cathy）。"""

    contact_page = models.ForeignKey(
        CompanyContact,
        verbose_name='所属联系页',
        on_delete=models.CASCADE,
        related_name='persons',
    )
    name = models.CharField('姓名', max_length=120)
    job_title = models.CharField('职位', max_length=120, blank=True)
    business_phone = models.CharField('业务电话', max_length=64, blank=True)
    whatsapp = models.CharField('WhatsApp', max_length=64, blank=True)
    wechat = models.CharField('WeChat', max_length=64, blank=True)
    email = models.EmailField('邮箱', blank=True)
    sort_order = models.PositiveSmallIntegerField('排序', default=0)
    is_active = models.BooleanField('显示', default=True)

    class Meta:
        ordering = ['contact_page', 'sort_order', 'id']
        verbose_name = '联系人'
        verbose_name_plural = '联系人'

    def __str__(self) -> str:
        return self.name
