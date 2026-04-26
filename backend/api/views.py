from drf_spectacular.utils import extend_schema
import django_filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from brands.models import Brand
from company.models import CompanyAbout, CompanyContact
from core.viewsets import SoftDeleteModelViewSet
from products.models import Product, ProductCategory

from .filters import ProductCategoryFilter, ProductFilter
from .models import Customer, Inquiry, Quotation, QuotationItem
from .serializers import (
    BrandSerializer,
    CompanyAboutSerializer,
    CompanyContactSerializer,
    CustomerSerializer,
    InquirySerializer,
    ProductCategorySerializer,
    ProductSerializer,
    QuotationItemSerializer,
    QuotationSerializer,
)


class AdminProductFilter(django_filters.FilterSet):
    id = django_filters.NumberFilter(field_name='id')
    sku = django_filters.CharFilter(field_name='sku', lookup_expr='icontains')
    name = django_filters.CharFilter(field_name='name', lookup_expr='icontains')
    slug = django_filters.CharFilter(field_name='slug', lookup_expr='icontains')
    summary = django_filters.CharFilter(field_name='summary', lookup_expr='icontains')
    origin_country = django_filters.CharFilter(field_name='origin_country', lookup_expr='icontains')
    external_id = django_filters.CharFilter(field_name='external_id', lookup_expr='icontains')

    class Meta:
        model = Product
        fields = ['id', 'sku', 'name', 'slug', 'summary', 'category', 'origin_country', 'external_id', 'status']


class CustomerFilter(django_filters.FilterSet):
    id = django_filters.NumberFilter(field_name='id')
    name = django_filters.CharFilter(field_name='name', lookup_expr='icontains')
    company_name = django_filters.CharFilter(field_name='company_name', lookup_expr='icontains')
    country = django_filters.CharFilter(field_name='country', lookup_expr='icontains')
    email = django_filters.CharFilter(field_name='email', lookup_expr='icontains')
    phone = django_filters.CharFilter(field_name='phone', lookup_expr='icontains')
    whatsapp = django_filters.CharFilter(field_name='whatsapp', lookup_expr='icontains')
    source = django_filters.CharFilter(field_name='source', lookup_expr='icontains')
    owner = django_filters.NumberFilter(field_name='owner')

    class Meta:
        model = Customer
        fields = [
            'id',
            'tenant',
            'name',
            'company_name',
            'country',
            'email',
            'phone',
            'whatsapp',
            'source',
            'level',
            'owner',
        ]


class InquiryFilter(django_filters.FilterSet):
    id = django_filters.NumberFilter(field_name='id')
    subject = django_filters.CharFilter(field_name='subject', lookup_expr='icontains')
    product_name = django_filters.CharFilter(field_name='product_name', lookup_expr='icontains')
    country = django_filters.CharFilter(field_name='country', lookup_expr='icontains')
    source = django_filters.CharFilter(field_name='source', lookup_expr='icontains')
    assignee = django_filters.NumberFilter(field_name='assignee')

    class Meta:
        model = Inquiry
        fields = [
            'id',
            'tenant',
            'customer',
            'subject',
            'product_name',
            'country',
            'source',
            'status',
            'assignee',
        ]


class QuotationFilter(django_filters.FilterSet):
    id = django_filters.NumberFilter(field_name='id')
    quote_no = django_filters.CharFilter(field_name='quote_no', lookup_expr='icontains')
    currency = django_filters.CharFilter(field_name='currency', lookup_expr='icontains')
    trade_term = django_filters.CharFilter(field_name='trade_term', lookup_expr='icontains')
    owner = django_filters.NumberFilter(field_name='owner')

    class Meta:
        model = Quotation
        fields = [
            'id',
            'tenant',
            'customer',
            'inquiry',
            'quote_no',
            'currency',
            'trade_term',
            'status',
            'owner',
        ]


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


@extend_schema(tags=['后台管理'])
class AdminBrandViewSet(SoftDeleteModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = BrandSerializer
    queryset = Brand.objects.all().order_by('sort_order', 'name')
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'slug', 'short_name', 'description']
    ordering_fields = ['sort_order', 'name', 'id', 'created_at', 'updated_at']


@extend_schema(tags=['后台管理'])
class AdminProductCategoryViewSet(SoftDeleteModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = ProductCategorySerializer
    queryset = ProductCategory.objects.select_related('brand').all().order_by('brand', 'sort_order', 'name')
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['brand', 'parent', 'is_active']
    search_fields = ['name', 'slug', 'description', 'external_slug']
    ordering_fields = ['sort_order', 'name', 'id', 'created_at', 'updated_at']


@extend_schema(tags=['后台管理'])
class AdminProductViewSet(SoftDeleteModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = ProductSerializer
    queryset = Product.objects.select_related('category', 'category__brand').prefetch_related('images').all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = AdminProductFilter
    search_fields = ['name', 'sku', 'slug', 'summary', 'external_id']
    ordering_fields = ['sort_order', 'name', 'id', 'created_at', 'updated_at']


@extend_schema(tags=['外贸业务'])
class CustomerViewSet(SoftDeleteModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = CustomerSerializer
    queryset = Customer.objects.select_related('tenant', 'owner').all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = CustomerFilter
    search_fields = ['name', 'company_name', 'country', 'email', 'whatsapp', 'source']
    ordering_fields = ['id', 'created_at', 'updated_at', 'name']


@extend_schema(tags=['外贸业务'])
class InquiryViewSet(SoftDeleteModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = InquirySerializer
    queryset = Inquiry.objects.select_related('tenant', 'customer', 'assignee').all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = InquiryFilter
    search_fields = ['subject', 'product_name', 'message', 'country', 'source']
    ordering_fields = ['id', 'created_at', 'updated_at', 'subject']


@extend_schema(tags=['外贸业务'])
class QuotationViewSet(SoftDeleteModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = QuotationSerializer
    queryset = Quotation.objects.select_related('tenant', 'customer', 'inquiry', 'owner').prefetch_related('items').all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = QuotationFilter
    search_fields = ['quote_no', 'currency', 'trade_term']
    ordering_fields = ['id', 'created_at', 'updated_at', 'quote_no', 'total_amount']


@extend_schema(tags=['外贸业务'])
class QuotationItemViewSet(SoftDeleteModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = QuotationItemSerializer
    queryset = QuotationItem.objects.select_related('quotation', 'product').all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['quotation', 'product']
    search_fields = ['product_name', 'sku', 'remark']
    ordering_fields = ['id', 'created_at', 'updated_at', 'quantity', 'total_price']
