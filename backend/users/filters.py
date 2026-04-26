import django_filters
from django.contrib.auth import get_user_model

from .models import Department, Role, Tenant, TenantMembership, TenantRegistrationApplication

UserInfo = get_user_model()


class RoleFilter(django_filters.FilterSet):
    id = django_filters.NumberFilter(field_name='id')
    code = django_filters.CharFilter(field_name='code', lookup_expr='icontains')
    name = django_filters.CharFilter(field_name='name', lookup_expr='icontains')
    description = django_filters.CharFilter(field_name='description', lookup_expr='icontains')
    data_scope = django_filters.CharFilter(field_name='data_scope')
    is_active = django_filters.BooleanFilter(field_name='is_active')
    is_system = django_filters.BooleanFilter(field_name='is_system')
    permissions = django_filters.NumberFilter(field_name='permissions')

    class Meta:
        model = Role
        fields = ['id', 'code', 'name', 'description', 'data_scope', 'is_active', 'is_system', 'permissions']


class TenantFilter(django_filters.FilterSet):
    id = django_filters.NumberFilter(field_name='id')
    name = django_filters.CharFilter(field_name='name', lookup_expr='icontains')
    code = django_filters.CharFilter(field_name='code', lookup_expr='icontains')
    address = django_filters.CharFilter(field_name='address', lookup_expr='icontains')
    contact_name = django_filters.CharFilter(field_name='contact_name', lookup_expr='icontains')
    contact_phone = django_filters.CharFilter(field_name='contact_phone', lookup_expr='icontains')
    contact_email = django_filters.CharFilter(field_name='contact_email', lookup_expr='icontains')
    primary_admin = django_filters.NumberFilter(field_name='primary_admin')
    is_active = django_filters.BooleanFilter(field_name='is_active')

    class Meta:
        model = Tenant
        fields = [
            'id',
            'name',
            'code',
            'address',
            'contact_name',
            'contact_phone',
            'contact_email',
            'primary_admin',
            'is_active',
        ]


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
    department = django_filters.NumberFilter(field_name='department')
    reports_to = django_filters.NumberFilter(field_name='reports_to')

    class Meta:
        model = TenantMembership
        fields = ['id', 'tenant', 'user', 'status', 'title', 'department', 'reports_to', 'invited_by']


class DepartmentFilter(django_filters.FilterSet):
    id = django_filters.NumberFilter(field_name='id')
    name = django_filters.CharFilter(field_name='name', lookup_expr='icontains')
    manager = django_filters.NumberFilter(field_name='manager')

    class Meta:
        model = Department
        fields = ['id', 'tenant', 'name', 'parent', 'manager', 'is_active']


class PendingRegistrationFilter(django_filters.FilterSet):
    id = django_filters.NumberFilter(field_name='id')
    username = django_filters.CharFilter(field_name='username', lookup_expr='icontains')
    email = django_filters.CharFilter(field_name='email', lookup_expr='icontains')
    first_name = django_filters.CharFilter(field_name='first_name', lookup_expr='icontains')
    last_name = django_filters.CharFilter(field_name='last_name', lookup_expr='icontains')

    class Meta:
        model = UserInfo
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class TenantRegistrationApplicationFilter(django_filters.FilterSet):
    id = django_filters.NumberFilter(field_name='id')
    company_name = django_filters.CharFilter(field_name='company_name', lookup_expr='icontains')
    company_code = django_filters.CharFilter(field_name='company_code', lookup_expr='icontains')
    company_address = django_filters.CharFilter(field_name='company_address', lookup_expr='icontains')
    contact_name = django_filters.CharFilter(field_name='contact_name', lookup_expr='icontains')
    contact_phone = django_filters.CharFilter(field_name='contact_phone', lookup_expr='icontains')
    contact_email = django_filters.CharFilter(field_name='contact_email', lookup_expr='icontains')
    admin_username = django_filters.CharFilter(field_name='admin_username', lookup_expr='icontains')
    admin_email = django_filters.CharFilter(field_name='admin_email', lookup_expr='icontains')
    status = django_filters.CharFilter(field_name='status')

    class Meta:
        model = TenantRegistrationApplication
        fields = [
            'id',
            'company_name',
            'company_code',
            'company_address',
            'contact_name',
            'contact_phone',
            'contact_email',
            'admin_username',
            'admin_email',
            'status',
        ]
