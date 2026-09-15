from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import UntypedToken

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        token = request.COOKIES.get('access_token')

        if not token:
            return None

        try:
            untyped_token = UntypedToken(token)
            
            try:
                payload = untyped_token.payload
            except AttributeError:
                return None

            if not isinstance(payload, dict):
                return None
            
            user_id = payload.get('user_id')

            if not user_id:
                return None

            User = get_user_model()
            
            try:
                user = User.objects.get(pk=user_id)
                return (user, token)
            except User.DoesNotExist:
                return None
            
        except (InvalidToken, TokenError):
            return None
