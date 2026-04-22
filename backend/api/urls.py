from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AboutView,
    BrandViewSet,
    ContactView,
    ProductCategoryViewSet,
    ProductViewSet,
)

router = DefaultRouter()
router.register('brands', BrandViewSet, basename='brand')
router.register('product-categories', ProductCategoryViewSet, basename='product-category')
router.register('products', ProductViewSet, basename='product')

urlpatterns = [
    path('about/', AboutView.as_view(), name='about'),
    path('contact/', ContactView.as_view(), name='contact'),
    path('', include(router.urls)),
]
