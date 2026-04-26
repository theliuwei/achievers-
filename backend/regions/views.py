from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import AllowAny

from .filters import CityFilter, StateProvinceFilter
from .models import City, Country, StateProvince
from .serializers import CitySerializer, CountrySerializer, StateProvinceSerializer


@extend_schema(tags=['地区管理'])
class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    """国家/地区列表与详情；仅返回启用中记录。"""

    permission_classes = [AllowAny]
    serializer_class = CountrySerializer
    queryset = Country.objects.filter(is_active=True).order_by('sort_order', 'iso_alpha_2', 'id')
    filter_backends = [OrderingFilter]
    ordering_fields = ['sort_order', 'name_zh', 'name_en', 'iso_alpha_2', 'id']
    ordering = ['sort_order', 'iso_alpha_2', 'id']


@extend_schema(tags=['地区管理'])
class StateProvinceViewSet(viewsets.ReadOnlyModelViewSet):
    """省/州列表与详情；`?country=<id>` 筛选某国下的区划，仅返回启用中记录。"""

    permission_classes = [AllowAny]
    serializer_class = StateProvinceSerializer
    queryset = (
        StateProvince.objects.filter(is_active=True)
        .select_related('country')
        .order_by('country', 'sort_order', 'id')
    )
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = StateProvinceFilter
    ordering_fields = ['sort_order', 'name_zh', 'name_en', 'id']
    ordering = ['sort_order', 'id']


@extend_schema(tags=['地区管理'])
class CityViewSet(viewsets.ReadOnlyModelViewSet):
    """城市列表与详情；`?state=<id>` 筛选某省/州下城市，仅返回启用中记录。"""

    permission_classes = [AllowAny]
    serializer_class = CitySerializer
    queryset = (
        City.objects.filter(is_active=True)
        .select_related('state', 'state__country')
        .order_by('state', 'sort_order', 'id')
    )
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = CityFilter
    ordering_fields = ['sort_order', 'name_zh', 'name_en', 'id']
    ordering = ['sort_order', 'id']
