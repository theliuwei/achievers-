from datetime import timedelta
from pathlib import Path
from uuid import uuid4

from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.db import transaction
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from core.viewsets import SoftDeleteModelViewSet

from .filters import (
    DepartmentFilter,
    PendingRegistrationFilter,
    RoleFilter,
    TenantFilter,
    TenantMembershipFilter,
    TenantRegistrationApplicationFilter,
    UserInfoFilter,
)
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
)
from .serializers import (
    DepartmentSerializer,
    MeSerializer,
    MePasswordChangeSerializer,
    MeUpdateSerializer,
    PermissionSerializer,
    RBACTokenObtainPairSerializer,
    RoleSerializer,
    TenantApplicationReviewSerializer,
    TenantMembershipSerializer,
    TenantRegistrationApplicationSerializer,
    TenantSerializer,
    UserRegisterSerializer,
    UserSerializer,
)
from .serializers_pending import PendingRegistrationSerializer

UserInfo = get_user_model()


@extend_schema(tags=['用户 / RBAC'])
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MeSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        serializer = MeUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(MeSerializer(request.user, context={'request': request}).data)


@extend_schema(tags=['用户 / RBAC'])
class MeAvatarUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        avatar = request.FILES.get('avatar')
        if avatar is None:
            return Response({'detail': '请上传头像文件。'}, status=status.HTTP_400_BAD_REQUEST)
        if avatar.size > 2 * 1024 * 1024:
            return Response({'detail': '头像文件不能超过 2MB。'}, status=status.HTTP_400_BAD_REQUEST)
        if not str(getattr(avatar, 'content_type', '')).startswith('image/'):
            return Response({'detail': '头像必须是图片文件。'}, status=status.HTTP_400_BAD_REQUEST)

        suffix = Path(avatar.name).suffix.lower()
        if suffix not in {'.jpg', '.jpeg', '.png', '.gif', '.webp'}:
            suffix = '.png'
        filename = f'avatars/user_{request.user.id}_{uuid4().hex}{suffix}'
        saved_path = default_storage.save(filename, avatar)
        avatar_url = request.build_absolute_uri(default_storage.url(saved_path))

        request.user.avatar_url = avatar_url
        request.user.save(update_fields=['avatar_url', 'updated_at'])
        serializer = MeSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(tags=['用户 / RBAC'])
class MePasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MePasswordChangeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': '密码已更新，请重新登录。'}, status=status.HTTP_200_OK)


@extend_schema(tags=['认证'])
class RBACTokenObtainPairView(TokenObtainPairView):
    serializer_class = RBACTokenObtainPairSerializer


@extend_schema(tags=['认证'], request=UserRegisterSerializer)
class RegisterView(APIView):
    """公开注册：创建未激活账号并标记待审批；不产生 Token，需管理员在「审批管理」通过后方可登录。"""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        profile = user.rbac_profile
        profile.pending_approval = True
        profile.save(update_fields=['pending_approval'])
        return Response(
            {
                'detail': '注册申请已提交，管理员审核通过后即可登录。',
                'username': user.username,
            },
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=['用户 / RBAC'])
class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    """权限点列表（只读，后台用于给角色打勾）。"""

    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    pagination_class = None


@extend_schema(tags=['用户 / RBAC'])
class RoleViewSet(SoftDeleteModelViewSet):
    queryset = Role.objects.prefetch_related('permissions').all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = RoleFilter
    search_fields = ['code', 'name', 'description']


@extend_schema(tags=['用户 / RBAC'])
class UserViewSet(SoftDeleteModelViewSet):
    """
    系统用户与角色：平台方走 UserProfile；企业方走 default_tenant 下 TenantMembership。
    """

    queryset = UserInfo.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = UserInfoFilter
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']


@extend_schema(tags=['用户 / RBAC'])
class TenantViewSet(SoftDeleteModelViewSet):
    queryset = Tenant.objects.all().order_by('-id')
    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = TenantFilter
    search_fields = ['name', 'code']


@extend_schema(tags=['用户 / RBAC'])
class TenantMembershipViewSet(SoftDeleteModelViewSet):
    queryset = (
        TenantMembership.objects.select_related('user', 'tenant', 'invited_by')
        .prefetch_related('roles')
        .all()
        .order_by('tenant_id', 'user_id')
    )
    serializer_class = TenantMembershipSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = TenantMembershipFilter
    search_fields = ['user__username', 'user__email', 'tenant__name', 'tenant__code', 'title']


@extend_schema(tags=['用户 / RBAC'])
class DepartmentViewSet(SoftDeleteModelViewSet):
    queryset = Department.objects.select_related('tenant', 'parent', 'manager').all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = DepartmentFilter
    search_fields = ['name', 'tenant__name', 'tenant__code', 'manager__username']


@extend_schema(tags=['用户 / RBAC'])
class TenantRegistrationApplicationViewSet(SoftDeleteModelViewSet):
    queryset = TenantRegistrationApplication.objects.select_related(
        'reviewed_by',
        'tenant',
    ).all()
    serializer_class = TenantRegistrationApplicationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = TenantRegistrationApplicationFilter
    search_fields = [
        'company_name',
        'company_code',
        'company_address',
        'contact_name',
        'contact_phone',
        'contact_email',
        'admin_username',
        'admin_email',
    ]

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == 'list':
            return qs.order_by('-created_at', '-id')
        return qs

    @extend_schema(request=TenantApplicationReviewSerializer, responses={200: TenantRegistrationApplicationSerializer})
    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        application = self.get_object()
        if application.status != TenantApplicationStatus.PENDING:
            return Response({'detail': '该入驻申请已处理，不能重复审核。'}, status=status.HTTP_400_BAD_REQUEST)
        if Tenant.objects.filter(code=application.company_code).exists():
            return Response({'company_code': '该公司代码已被使用。'}, status=status.HTTP_400_BAD_REQUEST)
        if UserInfo.objects.filter(username=application.admin_username).exists():
            return Response({'admin_username': '该主管理员用户名已被使用。'}, status=status.HTTP_400_BAD_REQUEST)
        if UserInfo.objects.filter(email__iexact=application.admin_email).exists():
            return Response({'admin_email': '该主管理员邮箱已被注册。'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            starts_at = timezone.now()
            tenant = Tenant.objects.create(
                name=application.company_name,
                code=application.company_code,
                address=application.company_address,
                contact_name=application.contact_name,
                contact_phone=application.contact_phone,
                contact_email=application.contact_email,
                is_active=True,
                subscription_starts_at=starts_at,
                subscription_expires_at=starts_at + timedelta(days=365),
                max_members=application.requested_max_members,
                storage_quota_mb=application.requested_storage_quota_mb,
            )
            admin_user = UserInfo.objects.create(
                username=application.admin_username,
                email=application.admin_email,
                first_name=application.admin_first_name,
                last_name=application.admin_last_name,
                phone=application.admin_phone,
                password=application.admin_password_hash,
                is_active=True,
                is_staff=True,
                user_kind=UserKind.TENANT,
                default_tenant=tenant,
            )
            tenant.primary_admin = admin_user
            tenant.save(update_fields=['primary_admin', 'updated_at'])
            membership = TenantMembership.objects.create(
                user=admin_user,
                tenant=tenant,
                status=MembershipStatus.ACTIVE,
                title='主管理员',
            )
            tenant_admin = Role.objects.filter(code='tenant_admin', is_active=True).first()
            if tenant_admin:
                membership.roles.add(tenant_admin)

            application.status = TenantApplicationStatus.APPROVED
            application.reviewed_by = request.user
            application.reviewed_at = starts_at
            application.tenant = tenant
            application.reject_reason = ''
            application.save(
                update_fields=[
                    'status',
                    'reviewed_by',
                    'reviewed_at',
                    'tenant',
                    'reject_reason',
                    'updated_at',
                ]
            )
        serializer = self.get_serializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(request=TenantApplicationReviewSerializer, responses={200: TenantRegistrationApplicationSerializer})
    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        application = self.get_object()
        if application.status != TenantApplicationStatus.PENDING:
            return Response({'detail': '该入驻申请已处理，不能重复审核。'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = TenantApplicationReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application.status = TenantApplicationStatus.REJECTED
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.reject_reason = serializer.validated_data.get('reject_reason', '')
        application.save(
            update_fields=[
                'status',
                'reviewed_by',
                'reviewed_at',
                'reject_reason',
                'updated_at',
            ]
        )
        return Response(self.get_serializer(application).data, status=status.HTTP_200_OK)


@extend_schema(tags=['用户 / RBAC'])
class PendingRegistrationViewSet(viewsets.ReadOnlyModelViewSet):
    """待审批的公开注册用户（is_active=False 且 pending_approval=True）。"""

    serializer_class = PendingRegistrationSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = PendingRegistrationFilter
    search_fields = ['username', 'email', 'first_name', 'last_name']

    def get_queryset(self):
        return (
            UserInfo.objects.filter(
                is_active=False,
                rbac_profile__pending_approval=True,
            )
            .select_related('rbac_profile')
            .order_by('-date_joined')
        )

    @extend_schema(request=None, responses={200: None})
    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save(update_fields=['is_active'])
        profile = user.rbac_profile
        profile.pending_approval = False
        profile.save(update_fields=['pending_approval'])
        viewer = Role.objects.filter(code='viewer', is_active=True).first()
        target_tenant = user.default_tenant or Tenant.objects.filter(is_active=True).order_by('id').first()
        if user.user_kind == UserKind.TENANT and target_tenant:
            if not user.default_tenant_id:
                user.default_tenant = target_tenant
                user.save(update_fields=['default_tenant'])
            m, _ = TenantMembership.objects.get_or_create(
                user=user,
                tenant=target_tenant,
                defaults={'status': MembershipStatus.ACTIVE},
            )
            if viewer and not m.roles.filter(pk=viewer.pk).exists():
                m.roles.add(viewer)
        elif viewer:
            profile.roles.add(viewer)
        return Response(status=status.HTTP_200_OK)

    @extend_schema(request=None, responses={200: None})
    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        user = self.get_object()
        user.delete()
        return Response(status=status.HTTP_200_OK)
