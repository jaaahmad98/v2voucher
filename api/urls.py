from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VoucherViewSet,
    register_view,
    login_view,
    logout_view,
    current_user_view
)

router = DefaultRouter()
router.register(r'vouchers', VoucherViewSet, basename='voucher')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register_view, name='register'),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/me/', current_user_view, name='current-user'),
]

