from rest_framework.permissions import BasePermission

class HasRole(BasePermission):
    def has_permission(self, request, view):
        allowed_roles = getattr(view, 'allowed_roles', [])

        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in allowed_roles)
