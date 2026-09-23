from .models import Solicitacao
from .serializers import RequestSerializer
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
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
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = RequestSerializer(data=request.data)

        if serializer.is_valid():
            solicitacao = serializer.save(id_gn=request.user.id)
            
            return Response(
                {'mensagem': 'criado', 'id': solicitacao.id},
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
