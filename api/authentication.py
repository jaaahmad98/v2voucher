from rest_framework.authentication import SessionAuthentication


class CSRFExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication that doesn't enforce CSRF checks.
    Use this for API endpoints that need session authentication but don't require CSRF tokens.
    """
    
    def enforce_csrf(self, request):
        """
        Override to skip CSRF enforcement.
        """
        return  # Do nothing, skip CSRF check

