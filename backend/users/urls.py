from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    MeAvatarUploadView,
    MePasswordChangeView,
    MeView,
    PendingRegistrationViewSet,
    PermissionViewSet,
    RBACTokenObtainPairView,
    RegisterView,
    RoleViewSet,
    TenantMembershipViewSet,
    TenantViewSet,
    UserViewSet,
)

router = DefaultRouter()
router.register('permissions', PermissionViewSet, basename='permission')
router.register('roles', RoleViewSet, basename='role')
router.register('accounts', UserViewSet, basename='user')
router.register('tenants', TenantViewSet, basename='tenant')
router.register('tenant-memberships', TenantMembershipViewSet, basename='tenant-membership')
router.register(
    'pending-registrations',
    PendingRegistrationViewSet,
    basename='pending-registration',
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/token/', RBACTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('me/avatar/', MeAvatarUploadView.as_view(), name='me_avatar_upload'),
    path('me/password/', MePasswordChangeView.as_view(), name='me_password_change'),
    path('', include(router.urls)),
]
