from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Permission, Role, Tenant, TenantMembership, UserProfile

UserInfo = get_user_model()


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    filter_horizontal = ('roles',)
    extra = 0


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'sort_order')
    search_fields = ('code', 'name')
    ordering = ('sort_order', 'code')


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'is_active', 'is_system')
    list_filter = ('is_active', 'is_system')
    search_fields = ('code', 'name')
    filter_horizontal = ('permissions',)


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'code', 'is_active', 'subscription_expires_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'code')


@admin.register(TenantMembership)
class TenantMembershipAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'tenant', 'status', 'title', 'is_deleted')
    list_filter = ('status', 'is_deleted', 'tenant')
    filter_horizontal = ('roles',)
    raw_id_fields = ('user', 'invited_by', 'tenant')
    search_fields = ('user__username', 'tenant__name', 'tenant__code')


class UserInfoAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = (
        *BaseUserAdmin.list_display,
        'user_kind',
        'default_tenant',
    )
    list_filter = (
        *BaseUserAdmin.list_filter,
        'user_kind',
    )
    fieldsets = (
        *BaseUserAdmin.fieldsets,
        (
            'SaaS 多租户',
            {'fields': ('user_kind', 'default_tenant')},
        ),
    )
    add_fieldsets = (
        *BaseUserAdmin.add_fieldsets,
        (
            'SaaS 多租户',
            {'fields': ('user_kind', 'default_tenant')},
        ),
    )


# UserInfo 的注册放在 UsersConfig.ready()，确保在 django.contrib.auth.admin
# 等模块加载完成后再挂载，避免出现 /admin/auth/user/ 404。
