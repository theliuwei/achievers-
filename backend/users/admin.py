from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Permission, Role, UserProfile

User = get_user_model()


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


class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)


# User 的注册放在 UsersConfig.ready()，确保在 django.contrib.auth.admin
# 等模块加载完成后再挂载，避免出现 /admin/auth/user/ 404。
