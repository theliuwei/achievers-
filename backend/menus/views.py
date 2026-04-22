from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import NavMenuItem
from .nav_tree import build_nav_tree_for_user
from .permissions import HasNavMenuItemRBAC
from .serializers import NavMenuItemSerializer


@extend_schema(tags=['导航菜单'])
class NavMenuView(APIView):
    """当前登录用户可见的后台侧边栏菜单（由数据库配置 + RBAC 过滤）。"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(build_nav_tree_for_user(request.user))


@extend_schema(tags=['导航菜单'])
class NavMenuItemViewSet(viewsets.ModelViewSet):
    """导航菜单项 CRUD；权限与前端工具栏一致（menus.query / refresh / create / update / delete）。"""

    queryset = NavMenuItem.objects.all().order_by('sort_order', 'id')
    serializer_class = NavMenuItemSerializer
    permission_classes = [IsAuthenticated, HasNavMenuItemRBAC]
