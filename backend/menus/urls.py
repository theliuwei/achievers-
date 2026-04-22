from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import NavMenuItemViewSet, NavMenuView

router = DefaultRouter()
router.register('nav-menu-items', NavMenuItemViewSet, basename='nav-menu-item')

urlpatterns = [
    path('me/nav-menu/', NavMenuView.as_view(), name='nav_menu'),
    path('', include(router.urls)),
]
