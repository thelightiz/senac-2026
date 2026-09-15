from .permissions import HasRole
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
            key='access_token',
            value=access_token,
            httponly=True,
            secure=True,
            samesite='None',
            max_age=15 * 60
        )

        # Atualizacao do token para longa duracao
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite='None',
            max_age=7 * 24 * 60 * 60
        )

        return response

class AuthView(APIView):
    def get(self, request):
        user = request.user
        if user.is_authenticated:
            return Response({"role": user.role}, status=status.HTTP_200_OK)
        return Response({"mensagem": "Usuário não autenticado"}, status=status.HTTP_401_UNAUTHORIZED)

class GNMyRequestsView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GN']

    def get(self, request):
        return Response({"mensagem": "ok"}, status=status.HTTP_200_OK)
