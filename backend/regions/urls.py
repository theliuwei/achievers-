from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CityViewSet, CountryViewSet, StateProvinceViewSet

router = DefaultRouter()
router.register('countries', CountryViewSet, basename='country')
router.register('state-provinces', StateProvinceViewSet, basename='state-province')
router.register('cities', CityViewSet, basename='city')

urlpatterns = [path('', include(router.urls))]
