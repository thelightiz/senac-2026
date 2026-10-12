from .models import Solicitacao, DadosNovos
from .serializers import PostRequestSerializer, GetRequestsSerializer, GetRequestInfoSerializer, GNAdjustRequestSerializer
from .services import accept_request_service, handle_request_return_service, formalize_update_request_service, adjust_request_service
from django.db.models import Count, Q
from rest_framework import status
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from services.permissions import HasRole
from django.shortcuts import get_object_or_404
import json

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

        try:
            accept_request_service(request_update=solicitacao, user=request.user)
        except ValidationError as error:
            return Response(error.detail, status=status.HTTP_409_CONFLICT)
        except PermissionDenied as error:
            return Response(error.detail, status=status.HTTP_401_UNAUTHORIZED)

        return Response({'mensagem': 'Solicitação aprovada'}, status=status.HTTP_200_OK)

class HandleRequestReturnsView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GA', 'CADASTRO']
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        solicitacao = get_object_or_404(Solicitacao, pk=pk)
        acao = request.data.get('action')
        parecer = request.FILES.get('parecer')

        try:
            handle_request_return_service(
                update_request=solicitacao,
                action=acao,
                parecer=parecer,
                user=request.user
            )
        except ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'mensagem': 'Documento anexado com sucesso.'
        }, status=status.HTTP_200_OK)

class CADAcceptRequest(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['CADASTRO']
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        parecer = request.FILES.get('parecer')
        solicitacao = get_object_or_404(Solicitacao, pk=pk)

        try:
            formalize_update_request_service(
                update_request=solicitacao,
                parecer=parecer,
                user=request.user
            )
        except ValidationError as error:
            detail = error.detail

            if isinstance(detail, dict) and detail.get('code') == 'already_updated':
                return Response({'detail': detail['detail']}, status=status.HTTP_409_CONFLICT)
            
            return Response(error.detail, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'mensagem': 'Solicitação efetivada'
        }, status=status.HTTP_200_OK)

class GNAdjustRequestView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GN']
    parser_classes = [MultiPartParser, FormParser]
    
    def patch(self, request, pk):
        solicitacao = get_object_or_404(Solicitacao, pk=pk)
        dados_novos = get_object_or_404(DadosNovos, solicitacao=solicitacao)
        
        raw_dados_novos = request.data.get('dados_novos')
        if isinstance(raw_dados_novos, str):
            try:
                payload = json.loads(raw_dados_novos)
            except json.JSONDecodeError:
                return Response(
                    {"dados_novos": ["Formato JSON inválido em dados_novos."]},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif isinstance(raw_dados_novos, dict):
            payload = raw_dados_novos
        else:
            payload = request.data

        serializer = GNAdjustRequestSerializer(dados_novos, data=payload, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        adjust_request_service(
            request_update=solicitacao,
            new_data=dados_novos,
            validated_data=serializer.validated_data,
            user=request.user
        )

        return Response(serializer.data, status=status.HTTP_200_OK)

class SystemMetricsView(APIView):
    def get(self, request):
        metrics = Solicitacao.objects.aggregate(
            total_solicitacoes_criadas=Count('id'),
            total_solicitacoes_efetivadas=Count('id', filter=Q(status='UPDATED')),
            total_solicitacoes_rejeitadas=Count('id', filter=Q(status='REJECTED')),
            solicitacoes_pendentes_analise_ga=Count('id', filter=Q(status='PENDING_AGENCY_REVIEW')),
            solicitacoes_pendentes_analise_cad=Count('id', filter=Q(status='PENDING_CADASTRO')),
            solicitacoes_pendente_ajuste_gn=Count('id', filter=Q(status='NEEDS_ADJUSTMENT_GN')),
            solicitacoes_pendente_ajuste_ga=Count('id', filter=Q(status='NEEDS_ADJUSTMENT_GA'))
        )
        return Response(metrics, status=status.HTTP_200_OK)
