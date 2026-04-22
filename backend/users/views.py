from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Permission, Role
from .serializers import (
    MeSerializer,
    PermissionSerializer,
    RBACTokenObtainPairSerializer,
    RoleSerializer,
    UserRegisterSerializer,
    UserSerializer,
)
from .serializers_pending import PendingRegistrationSerializer

User = get_user_model()


@extend_schema(tags=['用户 / RBAC'])
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MeSerializer(request.user, context={'request': request})
        return Response(serializer.data)


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


@extend_schema(tags=['用户 / RBAC'])
class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.prefetch_related('permissions').all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


@extend_schema(tags=['用户 / RBAC'])
class UserViewSet(viewsets.ModelViewSet):
    """系统用户与角色绑定（通过 UserProfile）。"""

    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


@extend_schema(tags=['用户 / RBAC'])
class PendingRegistrationViewSet(viewsets.ReadOnlyModelViewSet):
    """待审批的公开注册用户（is_active=False 且 pending_approval=True）。"""

    serializer_class = PendingRegistrationSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        return (
            User.objects.filter(
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
        if viewer:
            profile.roles.add(viewer)
        return Response(status=status.HTTP_200_OK)

    @extend_schema(request=None, responses={200: None})
    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        user = self.get_object()
        user.delete()
        return Response(status=status.HTTP_200_OK)
