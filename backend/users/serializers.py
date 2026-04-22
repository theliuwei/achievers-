from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Permission, Role, UserProfile

User = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    """公开注册：字段与 Django User 对齐，密码不少于 8 位（与 UserSerializer 一致）。"""

    password = serializers.CharField(write_only=True, min_length=8, allow_blank=False)
    password_confirm = serializers.CharField(write_only=True, min_length=8, allow_blank=False)

    class Meta:
        model = User
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
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('该用户名已被使用')
        return value

    def validate_email(self, value: str) -> str:
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('请填写邮箱')
        if User.objects.filter(email__iexact=value).exists():
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
        return User.objects.create_user(
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
            'code',
            'name',
            'description',
            'is_active',
            'is_system',
            'permissions',
        )


class RoleListSerializer(serializers.ModelSerializer):
    """列表用精简字段。"""

    class Meta:
        model = Role
        fields = ('id', 'code', 'name', 'is_active', 'is_system')


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8, allow_blank=False)
    role_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Role.objects.filter(is_active=True),
        required=False,
        write_only=True,
    )
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'is_active',
            'is_staff',
            'is_superuser',
            'roles',
            'role_ids',
        )
        read_only_fields = ('is_superuser',)

    def get_roles(self, obj):
        try:
            qs = obj.rbac_profile.roles.filter(is_active=True)
            return RoleListSerializer(qs, many=True).data
        except UserProfile.DoesNotExist:
            return []

    def create(self, validated_data):
        role_ids = validated_data.pop('role_ids', None)
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': '创建用户时必须提供密码'})
        user = User.objects.create_user(password=password, **validated_data)
        if role_ids is not None:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.roles.set(role_ids)
        return user

    def update(self, instance, validated_data):
        role_ids = validated_data.pop('role_ids', None)
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save(update_fields=['password'])
        if role_ids is not None:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.roles.set(role_ids)
        return user


class MeSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    permission_codes = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_staff',
            'is_superuser',
            'roles',
            'permission_codes',
        )
        read_only_fields = fields

    def get_roles(self, obj):
        try:
            qs = obj.rbac_profile.roles.filter(is_active=True)
            return RoleListSerializer(qs, many=True).data
        except UserProfile.DoesNotExist:
            return []

    def get_permission_codes(self, obj):
        if obj.is_superuser:
            return ['*']
        try:
            return sorted(obj.rbac_profile.get_permission_codes())
        except UserProfile.DoesNotExist:
            return []


class RBACTokenObtainPairSerializer(TokenObtainPairSerializer):
    """在 JWT 中附带权限代码与角色代码，便于前端路由与按钮控制。"""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        if user.is_superuser:
            token['permissions'] = ['*']
            token['roles'] = ['superuser']
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
