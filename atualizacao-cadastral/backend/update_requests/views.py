from .models import Solicitacao
from .serializers import PushRequestSerializer, GetRequestsSerializer, GetRequestInfoSerializer
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from services.permissions import HasRole
from django.shortcuts import get_object_or_404
from documents.models import DocumentosSolicitacao

class GNMyRequestsView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GN']

    def get(self, request):
        user = request.user
        requests = Solicitacao.objects.filter(criado_por=user)
        serializer = GetRequestsSerializer(requests, many=True)
        
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

class GARequestsQueueView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GA']

    def get(self, request):
        user = request.user
        requests = Solicitacao.objects.filter(status='PENDING_AGENCY_REVIEW')
        serializer = GetRequestsSerializer(requests, many=True)
        
        return Response(
            {'usuario': {
                'nome': user.username,
                'role': user.role,
            },
            'solicitacoes': serializer.data},
            status=status.HTTP_200_OK)

class SeeRequestView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GN', 'GA', 'CAD']

    def get(self, request, pk):
        solicitacao = get_object_or_404(Solicitacao, id=pk)
        
        serializer = GetRequestInfoSerializer(solicitacao, context={'request': request})

        return Response(
            {'solicitacao': serializer.data},
            status=status.HTTP_200_OK
        )

class GAAcceptRequestView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GA']

    def post(self, request, pk):
        solicitacao = get_object_or_404(Solicitacao, pk=pk)

        if solicitacao.status == 'PENDING_CADASTRO':
            return Response({'detail': 'Solicitação já foi aprovada.'}, status=status.HTTP_409_CONFLICT)
        elif solicitacao.status != 'PENDING_AGENCY_REVIEW':
            return Response({'detail': 'Sem permissão para alterar o status da solicitação.'}, status=status.HTTP_401_UNAUTHORIZED)

        solicitacao.status = 'PENDING_CADASTRO'
        solicitacao.save()

        return Response({'mensagem': 'Solicitação aprovada'}, status=status.HTTP_200_OK)

class HandleRequestReturnsView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GA', 'CAD']
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        solicitacao = get_object_or_404(Solicitacao, pk=pk)
        acao = request.data.get('action')
        parecer = request.FILES.get('parecer')

        if acao not in ['REPROVAR', 'SOLICITAR_AJUSTE']:
            return Response({'detail': 'Ação inválida'}, status=status.HTTP_400_BAD_REQUEST)

        if not parecer:
            return Response({'detail': 'A inclusão do parecer é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)

        DocumentosSolicitacao.objects.create(solicitacao=solicitacao, arquivo=parecer)
        solicitacao.status = 'REJECTED' if acao == 'REPROVAR' else 'NEEDS_ADJUSTMENT_GN'
        solicitacao.save()

        return Response(
            {'mensagem': 'Documento anexado com sucesso.'},
            status=status.HTTP_200_OK
        )
