from .serializers import LoginSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = Response(
            {"status": "success",
                "mensagem": "Login realizado com sucesso!",
                "user": {
                    "id": user.id,
                    "nome": user.username,
                    "role": user.role}
            }, status=status.HTTP_200_OK
        )

        # Token de acesso
        response.set_cookie(
            key='refresh_token',
            value=access_token,
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=15 * 60
        )

        # Atualizacao do token para longa duracao
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=7 * 24 * 60 * 60
        )

        return response
