from .models import Solicitacao
from .serializers import PostRequestSerializer, GetRequestsSerializer, GetRequestInfoSerializer
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from services.permissions import HasRole
from django.shortcuts import get_object_or_404
from documents.models import DocumentosSolicitacao
from django.db import transaction

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
        serializer = PostRequestSerializer(data=request.data, context={'request': request})
        print(request.data)

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
        requests = Solicitacao.objects.filter(status__in=['PENDING_AGENCY_REVIEW', 'NEEDS_ADJUSTMENT_GA'])
        serializer = GetRequestsSerializer(requests, many=True)
        
        return Response(
            {'usuario': {
                'nome': user.username,
                'role': user.role,
            },
            'solicitacoes': serializer.data},
            status=status.HTTP_200_OK)

class CADRequestsQueueView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['CADASTRO']

    def get(self, request):
        user = request.user
        requests = Solicitacao.objects.filter(status='PENDING_CADASTRO')
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
    allowed_roles = ['GN', 'GA', 'CADASTRO']

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
    allowed_roles = ['GA', 'CADASTRO']
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        solicitacao = get_object_or_404(Solicitacao, pk=pk)
        acao = request.data.get('action')
        parecer = request.FILES.get('parecer')
        status_solicitacao = None

        if acao not in ['REPROVAR', 'SOLICITAR_AJUSTE_GN', 'SOLICITAR_AJUSTE_GA']:
            return Response({'detail': 'Ação inválida'}, status=status.HTTP_400_BAD_REQUEST)

        if not parecer:
            return Response({'detail': 'A inclusão do parecer é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)

        DocumentosSolicitacao.objects.create(solicitacao=solicitacao, arquivo=parecer)

        match acao:
            case 'REPROVAR':
                status_solicitacao = 'REJECTED'
            case 'SOLICITAR_AJUSTE_GN':
                status_solicitacao = 'NEEDS_ADJUSTMENT_GN'
            case _:
                status_solicitacao = 'NEEDS_ADJUSTMENT_GA'

        solicitacao.status = status_solicitacao
        solicitacao.save()

        return Response({
            'mensagem': 'Documento anexado com sucesso.'
            }, status=status.HTTP_200_OK
        )

class CADAcceptRequest(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['CADASTRO']

    @transaction.atomic
    def post(self, request, pk):
        parecer = request.FILES.get('parecer')

        if not parecer:
            return Response({
                'detail': 'O parecer é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        solicitacao = get_object_or_404(Solicitacao, pk=pk)
        if solicitacao.status == 'UPDATED':
            return Response({
                'detail': 'Solicitação já efetivada'
                }, status=status.HTTP_409_CONFLICT)
        
        if solicitacao.status != 'PENDING_CADASTRO':
            return Response({
                'detail': 'A solicitação não está em análise.'
                }, status=status.HTTP_400_BAD_REQUEST)

        cliente = solicitacao.cliente
        dados_novos = solicitacao.dados_novos.first()

        if not dados_novos:
            return Response({
                'detail': 'Dados novos não encontrados na solicitação'
            }, status=status.HTTP_400_BAD_REQUEST)

        if dados_novos.salario:
            cliente.salario = dados_novos.salario

        if dados_novos.residencia_endereco:
            cliente.residencia_endereco = dados_novos.residencia_endereco

        if dados_novos.residencia_cep:
            cliente.residencia_cep = dados_novos.residencia_cep

        novos_imoveis = dados_novos.imoveis.all()
        if novos_imoveis.exists():
            for imovel_novo in novos_imoveis:
                cliente.imoveis.create(
                    endereco=imovel_novo.endereco,
                    bairro=imovel_novo.bairro,
                    cidade=imovel_novo.cidade,
                    cep=imovel_novo.cep
                )

        novos_veiculos = dados_novos.veiculos.all()
        if novos_veiculos.exists():
            for veiculo_novo in novos_veiculos:
                cliente.veiculos.create(
                    renavam=veiculo_novo.renavam,
                    placa=veiculo_novo.placa,
                    marca_modelo=veiculo_novo.marca_modelo,
                    ano=veiculo_novo.ano
                )

        DocumentosSolicitacao.objects.create(solicitacao=solicitacao, arquivo=parecer)

        solicitacao.status = 'UPDATED'
        solicitacao.save()
        cliente.save()

        return Response({
            'mensagem': 'Solicitação efetivada'
        }, status=status.HTTP_200_OK)
