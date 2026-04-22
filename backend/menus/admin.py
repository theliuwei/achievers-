from django.contrib import admin

from .models import NavMenuItem


@admin.register(NavMenuItem)
class NavMenuItemAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'path',
        'parent',
        'permission_code',
        'sort_order',
        'is_active',
    )
    list_filter = ('is_active',)
    search_fields = ('title', 'path', 'permission_code', 'icon')
    ordering = ('sort_order', 'id')
    list_editable = ('sort_order', 'is_active')
