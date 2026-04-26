from __future__ import annotations

from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from core.models import BaseModel, BaseQuerySet


class UserInfoManager(UserManager.from_queryset(BaseQuerySet)):
    """
    继承 auth 的 UserManager（含 create_user / create_superuser），
    QuerySet 与 BaseModel 一致（含软删过滤与批量软删）。
    """

    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

    use_in_migrations = True


class Permission(BaseModel):
    """细粒度权限点，供角色绑定；code 在业务代码中用于校验。"""

    code = models.CharField('权限代码', max_length=128, unique=True, db_index=True)
    name = models.CharField('名称', max_length=150)
    description = models.TextField('说明', blank=True)
    sort_order = models.PositiveSmallIntegerField('排序', default=0)

    class Meta:
        db_table = 'Permission'
        ordering = ['sort_order', 'code']
        verbose_name = '权限'
        verbose_name_plural = '权限'

    def __str__(self) -> str:
        return f'{self.name} ({self.code})'


class Role(BaseModel):
    """角色：多对多绑定 Permission；平台人员绑在 UserProfile，企业人员绑在 TenantMembership。"""

    class DataScope(models.TextChoices):
        OWN = 'own', _('本人数据')
        DEPARTMENT = 'department', _('部门/下属数据')
        TENANT = 'tenant', _('公司全部数据')
        ALL = 'all', _('平台全部数据')

    code = models.SlugField('角色代码', max_length=64, unique=True, db_index=True)
    name = models.CharField('名称', max_length=100)
    description = models.TextField('说明', blank=True)
    data_scope = models.CharField(
        '数据权限范围',
        max_length=20,
        choices=DataScope.choices,
        default=DataScope.OWN,
        db_index=True,
    )
    is_active = models.BooleanField('启用', default=True)
    is_system = models.BooleanField(
        '系统内置',
        default=False,
        help_text='内置角色不建议删除，仅可通过后台管理权限集合。',
    )
    permissions = models.ManyToManyField(
        Permission,
        verbose_name='权限',
        blank=True,
        related_name='roles',
    )

    class Meta:
        db_table = 'Role'
        ordering = ['code']
        verbose_name = '角色'
        verbose_name_plural = '角色'

    def __str__(self) -> str:
        return self.name


DATA_SCOPE_PRIORITY = {
    Role.DataScope.OWN: 10,
    Role.DataScope.DEPARTMENT: 20,
    Role.DataScope.TENANT: 30,
    Role.DataScope.ALL: 40,
}


class UserKind(models.TextChoices):
    """登录身份：平台侧（你们运营 / 支持）vs 企业侧（客户公司成员）。"""

    PLATFORM = 'platform', _('平台运营方')
    TENANT = 'tenant', _('企业用户')


class MembershipStatus(models.TextChoices):
    """用户在某租户下的成员状态。"""

    INVITED = 'invited', _('已邀请')
    ACTIVE = 'active', _('在册')
    SUSPENDED = 'suspended', _('已暂停')


class TenantApplicationStatus(models.TextChoices):
    """租户入驻申请审核状态。"""

    PENDING = 'pending', _('待审核')
    APPROVED = 'approved', _('已通过')
    REJECTED = 'rejected', _('已拒绝')


class Tenant(BaseModel):
    """
    租户 = 客户公司 / 组织。
    订阅与合同一般落在租户层，而不是用户表。
    """

    name = models.CharField('名称', max_length=200)
    code = models.SlugField('租户代码', max_length=64, unique=True, db_index=True)
    address = models.TextField('公司地址', blank=True, default='')
    contact_name = models.CharField('联系人', max_length=100, blank=True, default='')
    contact_phone = models.CharField('联系电话', max_length=32, blank=True, default='')
    contact_email = models.EmailField('联系邮箱', blank=True, default='')
    primary_admin = models.ForeignKey(
        'users.UserInfo',
        verbose_name='主管理员',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='primary_admin_tenants',
    )
    is_active = models.BooleanField('启用', default=True, db_index=True)
    subscription_starts_at = models.DateTimeField(
        '订阅/合同开始时间',
        null=True,
        blank=True,
        db_index=True,
    )
    subscription_expires_at = models.DateTimeField(
        '订阅/合同到期时间',
        null=True,
        blank=True,
        db_index=True,
        help_text='B2B SaaS：按公司维度记录；与单用户会员解耦。',
    )
    max_members = models.PositiveIntegerField('员工账号上限', default=20)
    storage_quota_mb = models.PositiveIntegerField('附件容量上限(MB)', default=1024)
    storage_used_mb = models.PositiveIntegerField('附件已用容量(MB)', default=0)
    locked_reason = models.CharField('锁定原因', max_length=200, blank=True, default='')

    class Meta:
        db_table = 'Tenant'
        ordering = ['code', 'id']
        verbose_name = '租户'
        verbose_name_plural = '租户'

    def __str__(self) -> str:
        return f'{self.name} ({self.code})'

    @property
    def is_subscription_expired(self) -> bool:
        return bool(self.subscription_expires_at and self.subscription_expires_at <= timezone.now())

    @property
    def is_available(self) -> bool:
        return self.is_active and not self.is_subscription_expired and not self.is_deleted

    def active_member_count(self) -> int:
        return self.memberships.filter(
            status=MembershipStatus.ACTIVE,
            is_deleted=False,
            user__is_active=True,
            user__is_deleted=False,
        ).count()

    def can_add_member(self, extra_count: int = 1) -> bool:
        return self.active_member_count() + extra_count <= self.max_members

    def can_use_storage(self, add_mb: int = 0) -> bool:
        return self.storage_used_mb + max(add_mb, 0) <= self.storage_quota_mb


class TenantRegistrationApplication(BaseModel):
    """客户公司公开入驻申请，审核通过后创建租户与主管理员。"""

    company_name = models.CharField('公司名称', max_length=200)
    company_code = models.SlugField('公司代码', max_length=64, db_index=True)
    company_address = models.TextField('公司地址', blank=True, default='')
    contact_name = models.CharField('联系人', max_length=100, blank=True, default='')
    contact_phone = models.CharField('联系电话', max_length=32, blank=True, default='')
    contact_email = models.EmailField('联系邮箱', blank=True, default='')
    admin_username = models.CharField('主管理员用户名', max_length=150, db_index=True)
    admin_email = models.EmailField('主管理员邮箱', db_index=True)
    admin_first_name = models.CharField('主管理员名', max_length=150, blank=True, default='')
    admin_last_name = models.CharField('主管理员姓', max_length=150, blank=True, default='')
    admin_phone = models.CharField('主管理员手机', max_length=32, blank=True, default='')
    admin_password_hash = models.CharField('主管理员密码哈希', max_length=128)
    requested_max_members = models.PositiveIntegerField('申请员工账号上限', default=20)
    requested_storage_quota_mb = models.PositiveIntegerField('申请附件容量(MB)', default=1024)
    status = models.CharField(
        '审核状态',
        max_length=16,
        choices=TenantApplicationStatus.choices,
        default=TenantApplicationStatus.PENDING,
        db_index=True,
    )
    reviewed_by = models.ForeignKey(
        'users.UserInfo',
        verbose_name='审核人',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='reviewed_tenant_applications',
    )
    reviewed_at = models.DateTimeField('审核时间', null=True, blank=True)
    reject_reason = models.TextField('拒绝原因', blank=True, default='')
    tenant = models.OneToOneField(
        Tenant,
        verbose_name='创建的租户',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='registration_application',
    )

    class Meta:
        db_table = 'TenantRegistrationApplication'
        ordering = ['-created_at', '-id']
        verbose_name = '租户入驻申请'
        verbose_name_plural = '租户入驻申请'

    def __str__(self) -> str:
        return f'{self.company_name} ({self.get_status_display()})'


class Department(BaseModel):
    """租户内组织部门，用于部门级数据权限。"""

    tenant = models.ForeignKey(
        Tenant,
        verbose_name='租户',
        on_delete=models.CASCADE,
        related_name='departments',
    )
    name = models.CharField('部门名称', max_length=100)
    parent = models.ForeignKey(
        'self',
        verbose_name='上级部门',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='children',
    )
    manager = models.ForeignKey(
        'users.UserInfo',
        verbose_name='部门负责人',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='managed_departments',
    )
    sort_order = models.PositiveIntegerField('排序', default=0)
    is_active = models.BooleanField('启用', default=True, db_index=True)

    class Meta:
        db_table = 'Department'
        ordering = ['tenant_id', 'sort_order', 'id']
        verbose_name = '部门'
        verbose_name_plural = '部门'
        constraints = [
            models.UniqueConstraint(
                fields=('tenant', 'name'),
                condition=models.Q(is_deleted=False),
                name='users_department_tenant_name_uniq_active',
            ),
        ]

    def __str__(self) -> str:
        return f'{self.tenant_id}:{self.name}'


class TenantMembership(BaseModel):
    """
    用户在某租户下的成员关系 + 在该租户内的 RBAC 角色。
    一人可加入多家公司（多条 membership），登录后通过 default_tenant 或 X-Tenant-Id 切换上下文。
    """

    user = models.ForeignKey(
        'users.UserInfo',
        verbose_name='用户',
        on_delete=models.CASCADE,
        related_name='tenant_memberships',
    )
    tenant = models.ForeignKey(
        Tenant,
        verbose_name='租户',
        on_delete=models.CASCADE,
        related_name='memberships',
    )
    status = models.CharField(
        '成员状态',
        max_length=16,
        choices=MembershipStatus.choices,
        default=MembershipStatus.ACTIVE,
        db_index=True,
    )
    title = models.CharField('职位/备注', max_length=100, blank=True, default='')
    department = models.ForeignKey(
        Department,
        verbose_name='所属部门',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='memberships',
    )
    reports_to = models.ForeignKey(
        'self',
        verbose_name='直属上级',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='direct_reports',
    )
    invited_by = models.ForeignKey(
        'users.UserInfo',
        verbose_name='邀请人',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='invited_memberships',
    )
    roles = models.ManyToManyField(
        Role,
        verbose_name='角色（本租户内）',
        blank=True,
        related_name='tenant_memberships',
    )

    class Meta:
        db_table = 'TenantMembership'
        verbose_name = '租户成员'
        verbose_name_plural = '租户成员'
        constraints = [
            models.UniqueConstraint(
                fields=('user', 'tenant'),
                name='users_tenantmembership_user_tenant_uniq',
            ),
        ]
        ordering = ['tenant_id', 'user_id']

    def __str__(self) -> str:
        return f'{self.user_id}@{self.tenant_id}'

    def get_permission_codes(self) -> set[str]:
        codes: set[str] = set()
        role_qs = self.roles.filter(is_active=True, is_deleted=False).prefetch_related('permissions')
        for role in role_qs:
            codes.update(role.permissions.values_list('code', flat=True))
        return codes

    def get_data_scope(self) -> str:
        scope = Role.DataScope.OWN
        role_qs = self.roles.filter(is_active=True, is_deleted=False)
        for role in role_qs:
            if DATA_SCOPE_PRIORITY.get(role.data_scope, 0) > DATA_SCOPE_PRIORITY.get(scope, 0):
                scope = role.data_scope
        return scope

    def get_department_user_ids(self) -> set[int]:
        if not self.department_id:
            return {self.user_id}
        memberships = TenantMembership.objects.filter(
            tenant=self.tenant,
            department=self.department,
            status=MembershipStatus.ACTIVE,
            is_deleted=False,
        )
        return set(memberships.values_list('user_id', flat=True))

    def get_subordinate_user_ids(self) -> set[int]:
        seen_membership_ids = {self.id}
        user_ids = {self.user_id}
        queue = [self.id]
        while queue:
            current_id = queue.pop(0)
            reports = TenantMembership.objects.filter(
                reports_to_id=current_id,
                tenant=self.tenant,
                status=MembershipStatus.ACTIVE,
                is_deleted=False,
            ).values_list('id', 'user_id')
            for membership_id, user_id in reports:
                if membership_id in seen_membership_ids:
                    continue
                seen_membership_ids.add(membership_id)
                user_ids.add(user_id)
                queue.append(membership_id)
        return user_ids

    def get_accessible_user_ids(self) -> set[int] | None:
        scope = self.get_data_scope()
        if scope == Role.DataScope.ALL:
            return None
        if scope == Role.DataScope.TENANT:
            return set(
                TenantMembership.objects.filter(
                    tenant=self.tenant,
                    status=MembershipStatus.ACTIVE,
                    is_deleted=False,
                ).values_list('user_id', flat=True)
            )
        if scope == Role.DataScope.DEPARTMENT:
            return self.get_department_user_ids() | self.get_subordinate_user_ids()
        return {self.user_id}

    def has_permission(self, code: str) -> bool:
        user = self.user
        if not user.is_active:
            return False
        if user.is_superuser:
            return True
        if not self.tenant.is_available:
            return False
        if self.status != MembershipStatus.ACTIVE:
            return False
        return code in self.get_permission_codes()


class UserInfo(AbstractUser, BaseModel):
    """
    登录主体 / 用户账号（全球唯一）：与「在某家公司下的成员关系」解耦 ——
    后者见 TenantMembership。平台运营方人员与企业在各自 RBAC 空间内授权。
    """

    class AccountStatus(models.TextChoices):
        ACTIVE = 'active', _('正常')
        SUSPENDED = 'suspended', _('已停用')
        PENDING = 'pending', _('待审核/待激活')
        CLOSED = 'closed', _('已关闭')

    class Gender(models.TextChoices):
        UNKNOWN = '', _('未设置')
        MALE = 'male', _('男')
        FEMALE = 'female', _('女')
        OTHER = 'other', _('其他')

    email = models.EmailField('邮箱', unique=True, null=True, blank=True, db_index=True)
    account_status = models.CharField(
        '账号状态',
        max_length=20,
        choices=AccountStatus.choices,
        default=AccountStatus.ACTIVE,
        db_index=True,
    )
    failed_login_count = models.PositiveIntegerField('连续登录失败次数', default=0)
    lockout_started_at = models.DateTimeField('账户锁定起始时间', null=True, blank=True, db_index=True)
    mfa_enabled = models.BooleanField('启用双因素认证', default=False, db_index=True)
    avatar_url = models.URLField('头像地址', max_length=500, blank=True, default='')
    gender = models.CharField('性别', max_length=8, choices=Gender.choices, blank=True, default='')
    phone = models.CharField(
        '手机号码 (E.164)',
        max_length=20,
        blank=True,
        default='',
        db_index=True,
        help_text='国际 E.164，如 +8613800138000',
    )
    email_verified_at = models.DateTimeField('邮箱验证完成时间', null=True, blank=True, db_index=True)
    phone_verified_at = models.DateTimeField('手机验证完成时间', null=True, blank=True, db_index=True)
    user_kind = models.CharField(
        '身份类型',
        max_length=20,
        choices=UserKind.choices,
        default=UserKind.TENANT,
        db_index=True,
        help_text='平台 = 可跨租户的运营/支持；企业 = 客户侧成员，权限按 TenantMembership 生效。',
    )
    default_tenant = models.ForeignKey(
        Tenant,
        verbose_name='默认工作租户',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users_with_default_tenant',
        db_index=True,
        help_text='多公司成员时，登录后默认进入的组织；可配合请求头 X-Tenant-Id 切换。',
    )
    wechat_bound_at = models.DateTimeField('微信绑定时间', null=True, blank=True)
    extra = models.JSONField('扩展字段', default=dict, blank=True, help_text='非结构化键值，业务自定义')

    objects = UserInfoManager()
    all_objects = models.Manager()

    class Meta:
        db_table = 'UserInfo'
        verbose_name = '用户'
        verbose_name_plural = '用户'
        ordering = ['-date_joined', 'id']

    def __str__(self) -> str:
        return self.username

    @property
    def is_email_verified(self) -> bool:
        return self.email_verified_at is not None

    @property
    def is_phone_verified(self) -> bool:
        return self.phone_verified_at is not None

    @property
    def is_lockout_active(self) -> bool:
        if not self.lockout_started_at:
            return False
        from datetime import timedelta

        from django.conf import settings

        window = getattr(settings, 'USER_LOCKOUT_DURATION', timedelta(minutes=30))
        if isinstance(window, (int, float)):
            window = timedelta(seconds=window)
        return self.lockout_started_at + window > timezone.now()

    @property
    def is_platform_user(self) -> bool:
        return self.user_kind == UserKind.PLATFORM


class UserProfile(BaseModel):
    """
    与 UserInfo 一对一：仅「平台侧」人员在此绑定角色；企业用户在企业内的角色在 TenantMembership。
    """

    user = models.OneToOneField(
        'users.UserInfo',
        on_delete=models.CASCADE,
        related_name='rbac_profile',
        verbose_name='用户',
    )
    roles = models.ManyToManyField(
        Role,
        verbose_name='角色',
        blank=True,
        related_name='user_profiles',
    )
    pending_approval = models.BooleanField(
        '待审批注册',
        default=False,
        db_index=True,
        help_text='公开注册且尚未通过管理员审批时为 True；审批通过后清零。',
    )

    class Meta:
        db_table = 'UserProfile'
        verbose_name = '用户扩展(RBAC)'
        verbose_name_plural = '用户扩展(RBAC)'

    def __str__(self) -> str:
        return f'RBAC:{self.user_id}'

    def get_permission_codes(self) -> set[str]:
        """当前用户通过所有启用角色继承的权限代码集合。"""
        codes: set[str] = set()
        role_qs = self.roles.filter(is_active=True).prefetch_related('permissions')
        for role in role_qs:
            codes.update(role.permissions.values_list('code', flat=True))
        return codes

    def has_permission(self, code: str) -> bool:
        user = self.user
        if not user.is_active:
            return False
        if user.is_superuser:
            return True
        if getattr(user, 'user_kind', None) == UserKind.TENANT:
            return False
        return code in self.get_permission_codes()


def _tenant_id_from_request(request) -> int | None:
    if request is None:
        return None
    raw = None
    if hasattr(request, 'headers'):
        raw = request.headers.get('X-Tenant-Id') or request.headers.get('X-Tenant-ID')
    if not raw and hasattr(request, 'META'):
        raw = request.META.get('HTTP_X_TENANT_ID')
    if not raw:
        return None
    try:
        return int(str(raw).strip())
    except (TypeError, ValueError):
        return None


def user_has_tenant_context(user, tenant: Tenant) -> bool:
    """企业用户仅在有「在册」成员关系时可访问该租户的 API 数据上下文；平台/超管不校验成员关系。"""
    if not user or not getattr(user, 'is_authenticated', False):
        return False
    if user.is_superuser or getattr(user, 'user_kind', None) == UserKind.PLATFORM:
        return True
    if not tenant.is_available:
        return False
    if getattr(user, 'user_kind', None) != UserKind.TENANT:
        return True
    return TenantMembership.objects.filter(
        user=user,
        tenant=tenant,
        status=MembershipStatus.ACTIVE,
        is_deleted=False,
    ).exists()


def resolve_tenant_for_rbac(user, request=None) -> Tenant | None:
    """
    企业用户：优先请求头 X-Tenant-Id，否则 default_tenant。
    须通过 user_has_tenant_context；否则回退为 None，避免错用他人租户角色。
    """
    if not user or not getattr(user, 'is_authenticated', False):
        return None
    if getattr(user, 'user_kind', None) != UserKind.TENANT:
        return None
    tid = _tenant_id_from_request(request)
    candidate: Tenant | None = None
    if tid is not None:
        candidate = (
            Tenant.objects.filter(pk=tid, is_active=True, is_deleted=False)
            .order_by('pk')
            .first()
        )
    if candidate is None and getattr(user, 'default_tenant_id', None):
        candidate = getattr(user, 'default_tenant', None)
    if candidate is None or not candidate.is_available or not user_has_tenant_context(user, candidate):
        return None
    return candidate


def user_has_rbac_permission(user, code: str, request=None) -> bool:
    """供视图 / DRF Permission 调用；传 request 时企业用户按 X-Tenant-Id / 默认租户解析权限。"""
    if not user or not getattr(user, 'is_authenticated', False):
        return False
    if user.is_superuser:
        return True
    kind = getattr(user, 'user_kind', None)
    if kind == UserKind.TENANT:
        tenant = resolve_tenant_for_rbac(user, request)
        if tenant is None:
            return False
        m = (
            TenantMembership.objects.filter(
                user=user,
                tenant=tenant,
                is_deleted=False,
            )
            .select_related('user')
            .first()
        )
        if m is None:
            return False
        return m.has_permission(code)
    try:
        return user.rbac_profile.has_permission(code)
    except UserProfile.DoesNotExist:
        return False


def resolve_membership_for_rbac(user, request=None) -> TenantMembership | None:
    tenant = resolve_tenant_for_rbac(user, request)
    if tenant is None:
        return None
    return (
        TenantMembership.objects.filter(
            user=user,
            tenant=tenant,
            status=MembershipStatus.ACTIVE,
            is_deleted=False,
        )
        .select_related('tenant', 'department', 'reports_to')
        .prefetch_related('roles')
        .first()
    )


def filter_queryset_by_data_scope(queryset, user, request=None, owner_field: str | None = None):
    """按企业用户的数据范围过滤业务 queryset；平台/超管不收窄。"""
    if not user or not getattr(user, 'is_authenticated', False):
        return queryset.none()
    if user.is_superuser or getattr(user, 'user_kind', None) == UserKind.PLATFORM:
        return queryset
    membership = resolve_membership_for_rbac(user, request)
    if membership is None:
        return queryset.none()
    queryset = queryset.filter(tenant=membership.tenant)
    if owner_field is None:
        return queryset
    accessible_user_ids = membership.get_accessible_user_ids()
    if accessible_user_ids is None:
        return queryset
    return queryset.filter(**{f'{owner_field}__in': accessible_user_ids})
