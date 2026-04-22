from django.contrib import admin

from .models import CompanyAbout, CompanyContact, ContactPerson


class ContactPersonInline(admin.TabularInline):
    model = ContactPerson
    extra = 0


@admin.register(CompanyContact)
class CompanyContactAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'work_hours', 'updated_at')
    inlines = [ContactPersonInline]

    def has_add_permission(self, request):
        return not CompanyContact.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(ContactPerson)
class ContactPersonAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_page', 'job_title', 'business_phone', 'email', 'sort_order', 'is_active')
    list_filter = ('contact_page', 'is_active')
    search_fields = ('name', 'email', 'business_phone')


@admin.register(CompanyAbout)
class CompanyAboutAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'year_established', 'contact_person', 'updated_at')

    fieldsets = (
        ('公司信息', {
            'fields': (
                'company_name',
                'company_name_zh',
                'slogan',
                'business_type',
                'main_market',
                'year_established',
                'employees_range',
                'annual_sales_range',
                'export_percentage',
                'main_brands_text',
            ),
        }),
        ('核心优势（四宫格，JSON）', {
            'fields': ('highlight_pillars',),
            'description': '示例：[{"title": "HIGH QUALITY", "body": "..."}, {"title": "DEVELOPMENT", "body": "..."}]',
        }),
        ('页面正文（Tab）', {
            'fields': (
                'content_introduction',
                'content_history',
                'content_service',
                'content_team',
            ),
        }),
        ('法律声明', {
            'fields': ('legal_disclaimer',),
        }),
        ('联系方式', {
            'fields': (
                'contact_person',
                'contact_phone',
                'contact_email',
                'offices_description',
            ),
        }),
        ('图片与视频', {
            'fields': ('profile_video_url', 'hero_image'),
        }),
    )

    def has_add_permission(self, request):
        return not CompanyAbout.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
