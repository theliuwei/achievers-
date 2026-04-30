from drf_spectacular.utils import extend_schema
import django_filters
from django.utils.translation import gettext_lazy as _
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from brands.models import Brand
from company.models import CompanyAbout, CompanyContact
from core.viewsets import SoftDeleteModelViewSet
from products.models import Product, ProductCategory, ProductCategoryTranslation, ProductTranslation
from users.models import (
    TenantMembership,
    UserKind,
    filter_queryset_by_data_scope,
    resolve_membership_for_rbac,
)
from users.permissions import HasRBACForViewAction, HasRBACPermission

from .filters import ProductCategoryFilter, ProductFilter
from .models import ConsentLog, Customer, Inquiry, Quotation, QuotationItem, VATRate
from .serializers import (
    ConsentLogSerializer,
    BrandSerializer,
    CompanyAboutSerializer,
    CompanyContactSerializer,
    CustomerSerializer,
    InquirySerializer,
    ProductCategorySerializer,
    ProductCategoryTranslationSerializer,
    ProductSerializer,
    ProductTranslationSerializer,
    QuotationItemSerializer,
    QuotationSerializer,
    VATRateSerializer,
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
            return Response({'detail': _('About page is not configured.')}, status=404)
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
            return Response({'detail': _('Contact page is not configured.')}, status=404)
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
    queryset = (
        ProductCategory.objects.filter(is_active=True)
        .select_related('brand', 'parent')
        .prefetch_related('translations')
    )
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
        .prefetch_related('images', 'translations', 'category__translations')
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
    queryset = (
        ProductCategory.objects.select_related('brand', 'parent')
        .prefetch_related('translations')
        .all()
        .order_by('brand', 'sort_order', 'name')
    )
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['brand', 'parent', 'is_active']
    search_fields = ['name', 'slug', 'description', 'external_slug']
    ordering_fields = ['sort_order', 'name', 'id', 'created_at', 'updated_at']


@extend_schema(tags=['后台管理'])
class AdminProductViewSet(SoftDeleteModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = ProductSerializer
    queryset = (
        Product.objects.select_related('category', 'category__brand')
        .prefetch_related('images', 'translations', 'category__translations')
        .all()
    )
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = AdminProductFilter
    search_fields = ['name', 'sku', 'slug', 'summary', 'external_id']
    ordering_fields = ['sort_order', 'name', 'id', 'created_at', 'updated_at']


@extend_schema(tags=['后台管理'])
class AdminProductTranslationViewSet(SoftDeleteModelViewSet):
    permission_classes = [IsAuthenticated, HasRBACForViewAction]
    serializer_class = ProductTranslationSerializer
    queryset = ProductTranslation.objects.select_related('product').all().order_by('-updated_at')
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['product', 'language']
    search_fields = ['name', 'summary', 'product__name', 'product__sku', 'seo_title']
    ordering_fields = ['updated_at', 'created_at', 'id', 'language']
    rbac_action_map = {
        'list': 'product_translations.view',
        'retrieve': 'product_translations.view',
        'create': 'product_translations.create',
        'update': 'product_translations.update',
        'partial_update': 'product_translations.update',
        'destroy': 'product_translations.delete',
    }


@extend_schema(tags=['后台管理'])
class AdminProductCategoryTranslationViewSet(SoftDeleteModelViewSet):
    permission_classes = [IsAuthenticated, HasRBACForViewAction]
    serializer_class = ProductCategoryTranslationSerializer
    queryset = ProductCategoryTranslation.objects.select_related('category').all().order_by('-updated_at')
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'language']
    search_fields = ['name', 'description', 'category__name', 'seo_title']
    ordering_fields = ['updated_at', 'created_at', 'id', 'language']
    rbac_action_map = {
        'list': 'category_translations.view',
        'retrieve': 'category_translations.view',
        'create': 'category_translations.create',
        'update': 'category_translations.update',
        'partial_update': 'category_translations.update',
        'destroy': 'category_translations.delete',
    }


class TenantScopedOwnerMixin:
    owner_field: str | None = None

    def get_queryset(self):
        qs = super().get_queryset()
        return filter_queryset_by_data_scope(qs, self.request.user, self.request, owner_field=self.owner_field)

    def _tenant_save_kwargs(self, serializer):
        user = self.request.user
        if user.is_superuser or getattr(user, 'user_kind', None) == UserKind.PLATFORM:
            return {}
        membership = resolve_membership_for_rbac(user, self.request)
        if membership is None:
            raise PermissionDenied(_('No available tenant context for current user.'))
        kwargs = {'tenant': membership.tenant}
        if self.owner_field:
            owner = (
                serializer.validated_data.get(self.owner_field)
                or getattr(serializer.instance, self.owner_field, None)
                or user
            )
            accessible_user_ids = membership.get_accessible_user_ids()
            if accessible_user_ids is not None and owner.id not in accessible_user_ids:
                raise PermissionDenied(_('Cannot assign data to user outside current data scope.'))
            kwargs[self.owner_field] = owner
        return kwargs

    def perform_create(self, serializer):
        serializer.save(**self._tenant_save_kwargs(serializer))

    def perform_update(self, serializer):
        serializer.save(**self._tenant_save_kwargs(serializer))


@extend_schema(tags=['外贸业务'])
class CustomerViewSet(TenantScopedOwnerMixin, SoftDeleteModelViewSet):
    owner_field = 'owner'
    permission_classes = [IsAuthenticated, HasRBACForViewAction]
    serializer_class = CustomerSerializer
    queryset = Customer.objects.select_related('tenant', 'owner').all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = CustomerFilter
    search_fields = ['name', 'company_name', 'country', 'email', 'whatsapp', 'source']
    ordering_fields = ['id', 'created_at', 'updated_at', 'name']
    rbac_action_map = {
        'list': 'customers.view',
        'retrieve': 'customers.view',
        'create': 'customers.create',
        'update': 'customers.update',
        'partial_update': 'customers.update',
        'destroy': 'customers.delete',
    }


@extend_schema(tags=['外贸业务'])
class InquiryViewSet(TenantScopedOwnerMixin, SoftDeleteModelViewSet):
    owner_field = 'assignee'
    permission_classes = [IsAuthenticated, HasRBACForViewAction]
    serializer_class = InquirySerializer
    queryset = Inquiry.objects.select_related('tenant', 'customer', 'assignee').all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = InquiryFilter
    search_fields = ['subject', 'product_name', 'message', 'country', 'source']
    ordering_fields = ['id', 'created_at', 'updated_at', 'subject']
    rbac_action_map = {
        'list': 'inquiries.view',
        'retrieve': 'inquiries.view',
        'create': 'inquiries.create',
        'update': 'inquiries.update',
        'partial_update': 'inquiries.update',
        'destroy': 'inquiries.delete',
    }


@extend_schema(tags=['外贸业务'])
class QuotationViewSet(TenantScopedOwnerMixin, SoftDeleteModelViewSet):
    owner_field = 'owner'
    permission_classes = [IsAuthenticated, HasRBACForViewAction]
    serializer_class = QuotationSerializer
    queryset = Quotation.objects.select_related('tenant', 'customer', 'inquiry', 'owner').prefetch_related('items').all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = QuotationFilter
    search_fields = ['quote_no', 'currency', 'trade_term']
    ordering_fields = ['id', 'created_at', 'updated_at', 'quote_no', 'total_amount']
    rbac_action_map = {
        'list': 'quotations.view',
        'retrieve': 'quotations.view',
        'create': 'quotations.create',
        'update': 'quotations.update',
        'partial_update': 'quotations.update',
        'destroy': 'quotations.delete',
    }


@extend_schema(tags=['外贸业务'])
class QuotationItemViewSet(SoftDeleteModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = QuotationItemSerializer
    queryset = QuotationItem.objects.select_related('quotation', 'product').all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['quotation', 'product']
    search_fields = ['product_name', 'sku', 'remark']
    ordering_fields = ['id', 'created_at', 'updated_at', 'quantity', 'total_price']


@extend_schema(tags=['税务与合规'])
class VATRateViewSet(SoftDeleteModelViewSet):
    permission_classes = [IsAuthenticated, HasRBACForViewAction]
    serializer_class = VATRateSerializer
    queryset = VATRate.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['country_code', 'is_active', 'is_price_included_default']
    search_fields = ['country_code', 'name']
    ordering_fields = ['country_code', 'effective_from', 'rate', 'id']
    ordering = ['country_code', '-effective_from']
    rbac_action_map = {
        'list': 'vat.view',
        'retrieve': 'vat.view',
        'create': 'vat.create',
        'update': 'vat.update',
        'partial_update': 'vat.update',
        'destroy': 'vat.delete',
    }


@extend_schema(tags=['税务与合规'])
class ConsentLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, HasRBACForViewAction]
    serializer_class = ConsentLogSerializer
    queryset = ConsentLog.objects.select_related('tenant', 'user').all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['consent_type', 'action', 'tenant', 'user']
    search_fields = ['policy_version', 'ip_address', 'user_agent', 'tenant__name', 'user__username']
    ordering_fields = ['created_at', 'updated_at', 'id']
    ordering = ['-created_at']
    rbac_action_map = {
        'list': 'consent.view',
        'retrieve': 'consent.view',
    }


@extend_schema(tags=['税务与合规'])
class GDPRDataExportView(APIView):
    permission_classes = [IsAuthenticated, HasRBACPermission]
    required_rbac_permission = 'gdpr.export'

    def get(self, request):
        user = request.user
        memberships = TenantMembership.objects.filter(
            user=user,
            is_deleted=False,
        ).select_related('tenant', 'department')
        payload = {
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone,
                'account_status': user.account_status,
                'user_kind': user.user_kind,
                'date_joined': user.date_joined,
            },
            'memberships': [
                {
                    'tenant_id': item.tenant_id,
                    'tenant_name': item.tenant.name if item.tenant else None,
                    'status': item.status,
                    'title': item.title,
                    'department': item.department.name if item.department else None,
                }
                for item in memberships
            ],
            'consents': list(
                ConsentLog.objects.filter(user=user)
                .values(
                    'id',
                    'created_at',
                    'consent_type',
                    'action',
                    'policy_version',
                    'ip_address',
                    'user_agent',
                    'metadata',
                )
                .order_by('-created_at')
            ),
            'exported_at': timezone.now(),
        }
        return Response(payload)


@extend_schema(tags=['税务与合规'])
class GDPRDataDeleteView(APIView):
    permission_classes = [IsAuthenticated, HasRBACPermission]
    required_rbac_permission = 'gdpr.delete'

    def post(self, request):
        user = request.user
        # Keep auditability while disabling login and anonymizing personal data.
        user.is_active = False
        user.account_status = user.AccountStatus.CLOSED
        user.email = None
        user.first_name = ''
        user.last_name = ''
        user.phone = ''
        user.avatar_url = ''
        user.extra = {}
        user.save(
            update_fields=[
                'is_active',
                'account_status',
                'email',
                'first_name',
                'last_name',
                'phone',
                'avatar_url',
                'extra',
                'updated_at',
            ]
        )
        ConsentLog.objects.create(
            user=user,
            tenant=getattr(user, 'default_tenant', None),
            consent_type=ConsentLog.ConsentType.PRIVACY_POLICY,
            action=ConsentLog.Action.REVOKED,
            policy_version='self-service-delete',
            metadata={'source': 'gdpr_delete_api'},
        )
        return Response({'detail': _('User data anonymized and account disabled.')})
