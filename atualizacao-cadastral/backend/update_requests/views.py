from .models import Solicitacao
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from services.permissions import HasRole

class GNMyRequestsView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GN']

    def get(self, request):
        user = request.user
        return Response(
            {'usuario': {
                'nome': user.username,
                'role': user.role,
            }},
            status=status.HTTP_200_OK)

class GNCreateRequestView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GN']

    def post(self, request):
        user = request.user
        cliente = request.data.get('cliente')
        return Response({'usuario': user.username, 'cliente': cliente}, status=status.HTTP_200_OK)
    