from rest_framework import permissions
from .models import UserProfile


class IsSuperAdmin(permissions.BasePermission):
    """
    Permission class to check if user has super admin role.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            user_profile = request.user.userprofile
            return user_profile.role == 'super_admin'
        except UserProfile.DoesNotExist:
            return False

