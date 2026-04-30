from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AboutView,
    AdminBrandViewSet,
    AdminProductCategoryViewSet,
    AdminProductCategoryTranslationViewSet,
    AdminProductViewSet,
    AdminProductTranslationViewSet,
    BrandViewSet,
    ContactView,
    ConsentLogViewSet,
    CustomerViewSet,
    GDPRDataDeleteView,
    GDPRDataExportView,
    InquiryViewSet,
    ProductCategoryViewSet,
    ProductViewSet,
    QuotationItemViewSet,
    QuotationViewSet,
    VATRateViewSet,
)

router = DefaultRouter()
router.register('brands', BrandViewSet, basename='brand')
router.register('product-categories', ProductCategoryViewSet, basename='product-category')
router.register('products', ProductViewSet, basename='product')
router.register('admin-brands', AdminBrandViewSet, basename='admin-brand')
router.register('admin-product-categories', AdminProductCategoryViewSet, basename='admin-product-category')
router.register('admin-products', AdminProductViewSet, basename='admin-product')
router.register('admin-product-translations', AdminProductTranslationViewSet, basename='admin-product-translation')
router.register('admin-product-category-translations', AdminProductCategoryTranslationViewSet, basename='admin-product-category-translation')
router.register('customers', CustomerViewSet, basename='customer')
router.register('inquiries', InquiryViewSet, basename='inquiry')
router.register('quotations', QuotationViewSet, basename='quotation')
router.register('quotation-items', QuotationItemViewSet, basename='quotation-item')
router.register('vat-rates', VATRateViewSet, basename='vat-rate')
router.register('consent-logs', ConsentLogViewSet, basename='consent-log')

urlpatterns = [
    path('about/', AboutView.as_view(), name='about'),
    path('contact/', ContactView.as_view(), name='contact'),
    path('gdpr/export/', GDPRDataExportView.as_view(), name='gdpr-export'),
    path('gdpr/delete/', GDPRDataDeleteView.as_view(), name='gdpr-delete'),
    path('', include(router.urls)),
]
