from .models import Solicitacao
from .serializers import PushRequestSerializer, GetRequestSerializer
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
        requests = Solicitacao.objects.filter(criado_por=user)
        serializer = GetRequestSerializer(requests, many=True)
        
        return Response(
            {'usuario': {
                'nome': user.username,
                'role': user.role,
            },
            'solicitacoes': serializer.data},
            status=status.HTTP_200_OK)

class GNCreateRequestView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GN']
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = PushRequestSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            solicitacao = serializer.save(criado_por=request.user)
            
            return Response(
                {'mensagem': 'criado', 'id': solicitacao.id, 'criado_por_id': solicitacao.criado_por_id}, status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
