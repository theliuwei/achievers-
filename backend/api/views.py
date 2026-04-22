from drf_spectacular.utils import extend_schema
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from brands.models import Brand
from company.models import CompanyAbout, CompanyContact
from products.models import Product, ProductCategory

from .filters import ProductCategoryFilter, ProductFilter
from .serializers import (
    BrandSerializer,
    CompanyAboutSerializer,
    CompanyContactSerializer,
    ProductCategorySerializer,
    ProductSerializer,
)


@extend_schema(tags=['站点内容'])
class AboutView(APIView):
    """关于我们（单条配置）。"""

    permission_classes = [AllowAny]

    def get(self, request):
        obj = CompanyAbout.objects.first()
        if not obj:
            return Response({'detail': '未配置关于我们'}, status=404)
        return Response(
            CompanyAboutSerializer(obj, context={'request': request}).data,
        )


@extend_schema(tags=['站点内容'])
class ContactView(APIView):
    """联系我们（页头信息 + 启用中的联系人）。"""

    permission_classes = [AllowAny]

    def get(self, request):
        obj = CompanyContact.objects.prefetch_related('persons').first()
        if not obj:
            return Response({'detail': '未配置联系我们'}, status=404)
        return Response(
            CompanyContactSerializer(obj, context={'request': request}).data,
        )


@extend_schema(tags=['产品目录'])
class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    """品牌列表与详情（按 slug 查详情）。"""

    permission_classes = [AllowAny]
    serializer_class = BrandSerializer
    queryset = Brand.objects.filter(is_active=True)
    lookup_field = 'slug'


@extend_schema(tags=['产品目录'])
class ProductCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """产品线 / 类目。详情按主键 id；slug 在同一品牌下唯一，列表可用 brand_slug 筛选。"""

    permission_classes = [AllowAny]
    serializer_class = ProductCategorySerializer
    queryset = ProductCategory.objects.filter(is_active=True).select_related('brand')
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = ProductCategoryFilter
    ordering_fields = ['sort_order', 'name', 'id', 'updated_at']
    ordering = ['sort_order', 'name']


@extend_schema(tags=['产品目录'])
class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """产品列表与详情；仅返回上架状态。"""

    permission_classes = [AllowAny]
    serializer_class = ProductSerializer
    queryset = (
        Product.objects.filter(status=Product.Status.ACTIVE)
        .select_related('category', 'category__brand')
        .prefetch_related('images')
    )
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'sku', 'summary']
    ordering_fields = ['sort_order', 'updated_at', 'name', 'id', 'created_at']
    ordering = ['sort_order', 'name']
    lookup_field = 'slug'
