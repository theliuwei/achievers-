import django_filters
from django.contrib.auth import get_user_model

from .models import Role, Tenant, TenantMembership

UserInfo = get_user_model()


class RoleFilter(django_filters.FilterSet):
    id = django_filters.NumberFilter(field_name='id')
    code = django_filters.CharFilter(field_name='code', lookup_expr='icontains')
    name = django_filters.CharFilter(field_name='name', lookup_expr='icontains')
    description = django_filters.CharFilter(field_name='description', lookup_expr='icontains')
    is_active = django_filters.BooleanFilter(field_name='is_active')
    is_system = django_filters.BooleanFilter(field_name='is_system')
    permissions = django_filters.NumberFilter(field_name='permissions')

    class Meta:
        model = Role
        fields = ['id', 'code', 'name', 'description', 'is_active', 'is_system', 'permissions']


class TenantFilter(django_filters.FilterSet):
    id = django_filters.NumberFilter(field_name='id')
    name = django_filters.CharFilter(field_name='name', lookup_expr='icontains')
    code = django_filters.CharFilter(field_name='code', lookup_expr='icontains')
    is_active = django_filters.BooleanFilter(field_name='is_active')

    class Meta:
        model = Tenant
        fields = ['id', 'name', 'code', 'is_active']


class UserInfoFilter(django_filters.FilterSet):
    id = django_filters.NumberFilter(field_name='id')
    username = django_filters.CharFilter(field_name='username', lookup_expr='icontains')
    email = django_filters.CharFilter(field_name='email', lookup_expr='icontains')
    first_name = django_filters.CharFilter(field_name='first_name', lookup_expr='icontains')
    last_name = django_filters.CharFilter(field_name='last_name', lookup_expr='icontains')
    user_kind = django_filters.CharFilter(field_name='user_kind')
    is_active = django_filters.BooleanFilter(field_name='is_active')
    is_staff = django_filters.BooleanFilter(field_name='is_staff')

    class Meta:
        model = UserInfo
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'user_kind',
            'is_active',
            'is_staff',
            'default_tenant',
        ]


class TenantMembershipFilter(django_filters.FilterSet):
    id = django_filters.NumberFilter(field_name='id')
    title = django_filters.CharFilter(field_name='title', lookup_expr='icontains')
    invited_by = django_filters.NumberFilter(field_name='invited_by')

    class Meta:
        model = TenantMembership
        fields = ['id', 'tenant', 'user', 'status', 'title', 'invited_by']


class PendingRegistrationFilter(django_filters.FilterSet):
    id = django_filters.NumberFilter(field_name='id')
    username = django_filters.CharFilter(field_name='username', lookup_expr='icontains')
    email = django_filters.CharFilter(field_name='email', lookup_expr='icontains')
    first_name = django_filters.CharFilter(field_name='first_name', lookup_expr='icontains')
    last_name = django_filters.CharFilter(field_name='last_name', lookup_expr='icontains')

    class Meta:
        model = UserInfo
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
