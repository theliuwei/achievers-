import django_filters
from drf_spectacular.utils import extend_schema
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.viewsets import SoftDeleteModelViewSet

from .models import NavMenuItem
from .nav_tree import build_nav_tree_for_user
from .permissions import HasNavMenuItemRBAC
from .serializers import NavMenuItemSerializer


class NavMenuItemFilter(django_filters.FilterSet):
    id = django_filters.NumberFilter(field_name='id')
    parent = django_filters.NumberFilter(field_name='parent')
    title = django_filters.CharFilter(field_name='title', lookup_expr='icontains')
    path = django_filters.CharFilter(field_name='path', lookup_expr='icontains')
    icon = django_filters.CharFilter(field_name='icon', lookup_expr='icontains')
    permission_code = django_filters.CharFilter(field_name='permission_code', lookup_expr='icontains')
    sort_order = django_filters.NumberFilter(field_name='sort_order')
    is_active = django_filters.BooleanFilter(field_name='is_active')

    class Meta:
        model = NavMenuItem
        fields = ['id', 'parent', 'title', 'path', 'icon', 'permission_code', 'sort_order', 'is_active']


@extend_schema(tags=['导航菜单'])
class NavMenuView(APIView):
    """当前登录用户可见的后台侧边栏菜单（由数据库配置 + RBAC 过滤）。"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(build_nav_tree_for_user(request.user, request))


@extend_schema(tags=['导航菜单'])
class NavMenuItemViewSet(SoftDeleteModelViewSet):
    """导航菜单项 CRUD；权限与前端工具栏一致（menus.query / refresh / create / update / delete）。"""

    queryset = NavMenuItem.objects.all().order_by('sort_order', 'id')
    serializer_class = NavMenuItemSerializer
    permission_classes = [IsAuthenticated, HasNavMenuItemRBAC]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = NavMenuItemFilter
    search_fields = ['title', 'path', 'icon', 'permission_code']

    def get_queryset(self):
        queryset = super().get_queryset()
        # 前端列名叫“前端路由”，字段实际是 path；这里显式兜底，确保路由查询生效。
        route = (
            self.request.query_params.get('path')
            or self.request.query_params.get('frontend_path')
            or self.request.query_params.get('route')
        )
        if route:
            queryset = queryset.filter(path__icontains=route.strip())
        return queryset
