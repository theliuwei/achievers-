from django.contrib import admin

from .models import ConsentLog, VATRate


@admin.register(VATRate)
class VATRateAdmin(admin.ModelAdmin):
    list_display = (
        'country_code',
        'name',
        'rate',
        'is_price_included_default',
        'effective_from',
        'effective_to',
        'is_active',
    )
    list_filter = ('country_code', 'is_active', 'is_price_included_default')
    search_fields = ('country_code', 'name')


@admin.register(ConsentLog)
class ConsentLogAdmin(admin.ModelAdmin):
    list_display = (
        'consent_type',
        'action',
        'user',
        'tenant',
        'policy_version',
        'created_at',
    )
    list_filter = ('consent_type', 'action')
    search_fields = ('policy_version', 'user__username', 'tenant__name', 'ip_address')
    readonly_fields = ('created_at', 'updated_at')
