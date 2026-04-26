from django.contrib.auth import get_user_model, password_validation
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    Department,
    MembershipStatus,
    Permission,
    Role,
    Tenant,
    TenantApplicationStatus,
    TenantMembership,
    TenantRegistrationApplication,
    UserKind,
    UserProfile,
    resolve_tenant_for_rbac,
)

UserInfo = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    """公开注册：字段与 Django User 对齐，密码不少于 8 位（与 UserSerializer 一致）。"""

    password = serializers.CharField(write_only=True, min_length=8, allow_blank=False)
    password_confirm = serializers.CharField(write_only=True, min_length=8, allow_blank=False)

    class Meta:
        model = UserInfo
        fields = (
            'username',
            'email',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
        )

    def validate_username(self, value: str) -> str:
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('请填写用户名')
        if UserInfo.objects.filter(username=value).exists():
            raise serializers.ValidationError('该用户名已被使用')
        return value

    def validate_email(self, value: str) -> str:
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('请填写邮箱')
        if UserInfo.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('该邮箱已被注册')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': '两次输入的密码不一致'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        validated_data['email'] = validated_data['email'].strip()
        return UserInfo.objects.create_user(
            password=password, is_active=False, **validated_data
        )


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ('id', 'code', 'name', 'description', 'sort_order')


class RoleSerializer(serializers.ModelSerializer):
    permissions = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Permission.objects.all(),
        required=False,
    )

    class Meta:
        model = Role
        fields = (
            'id',
            'created_at',
            'updated_at',
            'code',
            'name',
            'description',
            'data_scope',
            'is_active',
            'is_system',
            'permissions',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class RoleListSerializer(serializers.ModelSerializer):
    """列表用精简字段。"""

    class Meta:
        model = Role
        fields = ('id', 'code', 'name', 'data_scope', 'is_active', 'is_system')


class TenantSerializer(serializers.ModelSerializer):
    is_subscription_expired = serializers.BooleanField(read_only=True)
    active_member_count = serializers.SerializerMethodField()

    class Meta:
        model = Tenant
        fields = (
            'id',
            'created_at',
            'updated_at',
            'name',
            'code',
            'address',
            'contact_name',
            'contact_phone',
            'contact_email',
            'primary_admin',
            'is_active',
            'subscription_starts_at',
            'subscription_expires_at',
            'max_members',
            'storage_quota_mb',
            'storage_used_mb',
            'locked_reason',
            'is_subscription_expired',
            'active_member_count',
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'is_subscription_expired', 'active_member_count')

    def get_active_member_count(self, obj):
        return obj.active_member_count()


class TenantMembershipSerializer(serializers.ModelSerializer):
    roles = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Role.objects.all(),
        required=False,
    )

    class Meta:
        model = TenantMembership
        fields = (
            'id',
            'created_at',
            'updated_at',
            'user',
            'tenant',
            'status',
            'title',
            'department',
            'reports_to',
            'invited_by',
            'roles',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate(self, attrs):
        attrs = super().validate(attrs)
        tenant = attrs.get('tenant') or getattr(self.instance, 'tenant', None)
        status = attrs.get('status') or getattr(self.instance, 'status', None)
        if tenant and status == MembershipStatus.ACTIVE and not tenant.is_available:
            raise serializers.ValidationError({'tenant': '该公司已停用或订阅已到期'})
        if tenant and status == MembershipStatus.ACTIVE:
            is_new_active_member = self.instance is None or getattr(self.instance, 'status', None) != MembershipStatus.ACTIVE
            if is_new_active_member and not tenant.can_add_member():
                raise serializers.ValidationError(
                    {'tenant': f'该公司员工账号数量已达到上限（{tenant.max_members} 个）'}
                )
        department = attrs.get('department') or getattr(self.instance, 'department', None)
        reports_to = attrs.get('reports_to') or getattr(self.instance, 'reports_to', None)
        if tenant and department and department.tenant_id != tenant.id:
            raise serializers.ValidationError({'department': '部门必须属于当前公司'})
        if tenant and reports_to and reports_to.tenant_id != tenant.id:
            raise serializers.ValidationError({'reports_to': '直属上级必须属于当前公司'})
        return attrs


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = (
            'id',
            'created_at',
            'updated_at',
            'tenant',
            'name',
            'parent',
            'manager',
            'sort_order',
            'is_active',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate(self, attrs):
        attrs = super().validate(attrs)
        tenant = attrs.get('tenant') or getattr(self.instance, 'tenant', None)
        parent = attrs.get('parent') or getattr(self.instance, 'parent', None)
        if tenant and parent and parent.tenant_id != tenant.id:
            raise serializers.ValidationError({'parent': '上级部门必须属于当前公司'})
        return attrs


class TenantRegistrationApplicationSerializer(serializers.ModelSerializer):
    admin_password = serializers.CharField(write_only=True, min_length=8, allow_blank=False, required=False)

    class Meta:
        model = TenantRegistrationApplication
        fields = (
            'id',
            'created_at',
            'updated_at',
            'company_name',
            'company_code',
            'company_address',
            'contact_name',
            'contact_phone',
            'contact_email',
            'admin_username',
            'admin_email',
            'admin_first_name',
            'admin_last_name',
            'admin_phone',
            'admin_password',
            'requested_max_members',
            'requested_storage_quota_mb',
            'status',
            'reviewed_by',
            'reviewed_at',
            'reject_reason',
            'tenant',
        )
        read_only_fields = (
            'id',
            'created_at',
            'updated_at',
            'status',
            'reviewed_by',
            'reviewed_at',
            'reject_reason',
            'tenant',
        )

    def validate_company_code(self, value: str) -> str:
        value = (value or '').strip().lower()
        if not value:
            raise serializers.ValidationError('请填写公司代码')
        if Tenant.objects.filter(code=value).exists():
            raise serializers.ValidationError('该公司代码已被使用')
        if TenantRegistrationApplication.objects.filter(
            company_code=value,
            status=TenantApplicationStatus.PENDING,
        ).exists():
            raise serializers.ValidationError('该公司代码已有待审核申请')
        return value

    def validate_admin_username(self, value: str) -> str:
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('请填写主管理员用户名')
        if UserInfo.objects.filter(username=value).exists():
            raise serializers.ValidationError('该主管理员用户名已被使用')
        return value

    def validate_admin_email(self, value: str) -> str:
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('请填写主管理员邮箱')
        if UserInfo.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('该主管理员邮箱已被注册')
        return value

    def validate(self, attrs):
        if self.instance is None and not attrs.get('admin_password'):
            raise serializers.ValidationError({'admin_password': '请填写主管理员初始密码'})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('admin_password')
        validated_data['admin_password_hash'] = make_password(password)
        return super().create(validated_data)


class TenantApplicationReviewSerializer(serializers.Serializer):
    reject_reason = serializers.CharField(required=False, allow_blank=True, trim_whitespace=True)


def _set_user_roles(user, role_ids) -> None:
    if role_ids is None:
        return
    if getattr(user, 'user_kind', None) == UserKind.PLATFORM:
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.roles.set(role_ids)
        return
    tenant = user.default_tenant
    if not tenant:
        return
    m, _ = TenantMembership.objects.get_or_create(
        user=user,
        tenant=tenant,
        defaults={'status': MembershipStatus.ACTIVE},
    )
    m.roles.set(role_ids)


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8, allow_blank=False)
    role_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Role.objects.filter(is_active=True),
        required=False,
        write_only=True,
    )
    roles = serializers.SerializerMethodField()
    user_kind = serializers.ChoiceField(choices=UserKind.choices, required=False, default=UserKind.TENANT)
    default_tenant = serializers.PrimaryKeyRelatedField(
        queryset=Tenant.objects.filter(is_active=True, is_deleted=False),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = UserInfo
        fields = (
            'id',
            'created_at',
            'updated_at',
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'is_active',
            'is_staff',
            'is_superuser',
            'user_kind',
            'default_tenant',
            'roles',
            'role_ids',
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'is_superuser')

    def get_roles(self, obj):
        if obj.user_kind == UserKind.TENANT:
            t = obj.default_tenant
            if not t:
                return []
            m = (
                TenantMembership.objects.filter(
                    user=obj,
                    tenant=t,
                    is_deleted=False,
                )
                .first()
            )
            if not m:
                return []
            qs = m.roles.filter(is_active=True, is_deleted=False)
            return RoleListSerializer(qs, many=True).data
        try:
            qs = obj.rbac_profile.roles.filter(is_active=True)
            return RoleListSerializer(qs, many=True).data
        except UserProfile.DoesNotExist:
            return []

    def validate(self, attrs):
        attrs = super().validate(attrs)
        tenant = attrs.get('default_tenant') or getattr(self.instance, 'default_tenant', None)
        user_kind = attrs.get('user_kind') or getattr(self.instance, 'user_kind', UserKind.TENANT)
        if user_kind == UserKind.TENANT and tenant and not tenant.is_available:
            raise serializers.ValidationError({'default_tenant': '该公司已停用或订阅已到期'})
        if self.instance is None and user_kind == UserKind.TENANT and tenant and not tenant.can_add_member():
            raise serializers.ValidationError(
                {'default_tenant': f'该公司员工账号数量已达到上限（{tenant.max_members} 个）'}
            )
        return attrs

    def create(self, validated_data):
        role_ids = validated_data.pop('role_ids', None)
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': '创建用户时必须提供密码'})
        user = UserInfo.objects.create_user(password=password, **validated_data)
        _set_user_roles(user, role_ids)
        return user

    def update(self, instance, validated_data):
        role_ids = validated_data.pop('role_ids', None)
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save(update_fields=['password'])
        _set_user_roles(user, role_ids)
        return user


class _MeTenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ('id', 'code', 'name', 'is_active')


class MeSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    permission_codes = serializers.SerializerMethodField()
    memberships = serializers.SerializerMethodField()
    default_tenant = _MeTenantSerializer(read_only=True)

    class Meta:
        model = UserInfo
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'avatar_url',
            'gender',
            'phone',
            'is_staff',
            'is_superuser',
            'user_kind',
            'default_tenant',
            'memberships',
            'roles',
            'permission_codes',
        )
        read_only_fields = fields

    def get_memberships(self, obj):
        if obj.user_kind != UserKind.TENANT:
            return []
        ms = (
            obj.tenant_memberships.filter(is_deleted=False)
            .select_related('tenant')
            .prefetch_related('roles', 'roles__permissions')
            .order_by('tenant_id', 'id')
        )
        out: list[dict] = []
        for m in ms:
            out.append(
                {
                    'id': m.id,
                    'status': m.status,
                    'title': m.title,
                    'tenant': _MeTenantSerializer(m.tenant).data,
                    'roles': RoleListSerializer(
                        m.roles.filter(is_active=True, is_deleted=False), many=True
                    ).data,
                }
            )
        return out

    def get_roles(self, obj):
        if obj.is_superuser:
            return []
        if obj.user_kind == UserKind.TENANT:
            req = self.context.get('request')
            t = resolve_tenant_for_rbac(obj, req)
            if not t:
                return []
            m = (
                TenantMembership.objects.filter(
                    user=obj,
                    tenant=t,
                    is_deleted=False,
                )
                .first()
            )
            if not m:
                return []
            qs = m.roles.filter(is_active=True, is_deleted=False)
            return RoleListSerializer(qs, many=True).data
        try:
            qs = obj.rbac_profile.roles.filter(is_active=True)
            return RoleListSerializer(qs, many=True).data
        except UserProfile.DoesNotExist:
            return []

    def get_permission_codes(self, obj):
        if obj.is_superuser:
            return ['*']
        if obj.user_kind == UserKind.TENANT:
            req = self.context.get('request')
            t = resolve_tenant_for_rbac(obj, req)
            if not t:
                return []
            m = (
                TenantMembership.objects.filter(
                    user=obj,
                    tenant=t,
                    is_deleted=False,
                )
                .first()
            )
            if not m:
                return []
            return sorted(m.get_permission_codes())
        try:
            return sorted(obj.rbac_profile.get_permission_codes())
        except UserProfile.DoesNotExist:
            return []


class MeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInfo
        fields = (
            'email',
            'first_name',
            'last_name',
            'avatar_url',
            'gender',
            'phone',
        )


class MePasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(write_only=True, trim_whitespace=False, min_length=8)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('当前密码不正确。')
        return value

    def validate_new_password(self, value):
        password_validation.validate_password(value, self.context['request'].user)
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password'])
        return user


class RBACTokenObtainPairSerializer(TokenObtainPairSerializer):
    """在 JWT 中附带权限代码与角色代码，便于前端路由与按钮控制。"""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        if user.is_superuser:
            token['permissions'] = ['*']
            token['roles'] = ['superuser']
            return token
        if getattr(user, 'user_kind', None) == UserKind.TENANT:
            tenant = getattr(user, 'default_tenant', None)
            m: TenantMembership | None = None
            if tenant and tenant.is_available:
                m = (
                    TenantMembership.objects.filter(
                        user=user,
                        tenant=tenant,
                        is_deleted=False,
                        status=MembershipStatus.ACTIVE,
                    )
                    .select_related('tenant')
                    .order_by('id')
                    .first()
                )
            if m is None:
                m = (
                    user.tenant_memberships.filter(
                        is_deleted=False, status=MembershipStatus.ACTIVE
                    )
                    .select_related('tenant')
                    .order_by('id')
                    .first()
                )
            if m and m.tenant.is_available:
                token['permissions'] = sorted(m.get_permission_codes())
                token['roles'] = list(
                    m.roles.filter(is_active=True, is_deleted=False).values_list('code', flat=True)
                )
                token['tenant_id'] = m.tenant_id
            else:
                token['permissions'] = []
                token['roles'] = []
            return token
        try:
            profile = user.rbac_profile
            token['permissions'] = sorted(profile.get_permission_codes())
            token['roles'] = list(
                profile.roles.filter(is_active=True).values_list('code', flat=True)
            )
        except UserProfile.DoesNotExist:
            token['permissions'] = []
            token['roles'] = []
        return token
