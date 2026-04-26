from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AboutView,
    AdminBrandViewSet,
    AdminProductCategoryViewSet,
    AdminProductViewSet,
    BrandViewSet,
    ContactView,
    CustomerViewSet,
    InquiryViewSet,
    ProductCategoryViewSet,
    ProductViewSet,
    QuotationItemViewSet,
    QuotationViewSet,
)

router = DefaultRouter()
router.register('brands', BrandViewSet, basename='brand')
router.register('product-categories', ProductCategoryViewSet, basename='product-category')
router.register('products', ProductViewSet, basename='product')
router.register('admin-brands', AdminBrandViewSet, basename='admin-brand')
router.register('admin-product-categories', AdminProductCategoryViewSet, basename='admin-product-category')
router.register('admin-products', AdminProductViewSet, basename='admin-product')
router.register('customers', CustomerViewSet, basename='customer')
router.register('inquiries', InquiryViewSet, basename='inquiry')
router.register('quotations', QuotationViewSet, basename='quotation')
router.register('quotation-items', QuotationItemViewSet, basename='quotation-item')

urlpatterns = [
    path('about/', AboutView.as_view(), name='about'),
    path('contact/', ContactView.as_view(), name='contact'),
    path('', include(router.urls)),
]
