from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from services.permissions import HasRole
from django.shortcuts import get_object_or_404
import json

from .selectors import get_requests_for_gn, get_ga_review_queue, get_cadastro_queue, get_request_detail
from .services import create_request_service, ga_accept_request_service, handle_request_return_service, finalize_request_service
from .serializers import PostRequestSerializer, GetRequestsSerializer, GetRequestInfoSerializer, GNAdjustRequestSerializer
from .models import Request, ProposedData

class GNMyRequestsView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GN']

    def get(self, request):
        requests = get_requests_for_gn(request.user)
        serializer = GetRequestsSerializer(requests, many=True)

        return Response({'user': {'name': request.user.username, 'role': request.user.role}, 'update_requests': serializer.data}, status=status.HTTP_200_OK)

class GNCreateRequestView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GN']
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = PostRequestSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            ip = request.META.get('REMOTE_ADDR')
            user_agent = request.META.get('HTTP_USER_AGENT')
            
            request_update = create_request_service(
                user=request.user,
                validated_data=serializer.validated_data,
                ip=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT')
            )

            return Response({'message': 'created', 'id': request_update.id}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GNAdjustRequestView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GN', 'GA', 'CADASTRO']

    def patch(self, request, pk):
        proposed_data = get_object_or_404(ProposedData, pk=pk)
        
        serializer = GNAdjustRequestSerializer(
            instance=proposed_data,
            data=request.data,
            partial=True
        )
        
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "detail": "Proposed data successfully adjusted.",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

class GARequestsQueueView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GA']

    def get(self, request):
        requests = get_ga_review_queue()
        serializer = GetRequestsSerializer(requests, many=True)

        return Response({'user': {'name': request.user.username, 'role': request.user.role}, 'update_requests': serializer.data}, status=status.HTTP_200_OK)

class CADRequestsQueueView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['CADASTRO']

    def get(self, request):
        requests = get_cadastro_queue()
        serializer = GetRequestsSerializer(requests, many=True)
        return Response({'user': {'name': request.user.username, 'role': request.user.role}, 'update_requests': serializer.data}, status=status.HTTP_200_OK)

class SeeRequestView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GN', 'GA', 'CADASTRO']

    def get(self, request, pk):
        solicitacao = get_request_detail(pk)
        serializer = GetRequestInfoSerializer(solicitacao, context={'request': request})

        return Response({'update_request': serializer.data}, status=status.HTTP_200_OK)

class GAAcceptRequestView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GA']

    def post(self, request, pk):
        solicitacao = get_request_detail(pk)

        if solicitacao.status == Request.RequestStatus.PENDING_REGISTRATION:
            return Response({'detail': 'Solicitação já foi aprovada.'}, status=status.HTTP_409_CONFLICT)
        
        ip = request.META.get('REMOTE_ADDR')
        ga_accept_request_service(solicitacao, request.user, ip=ip)

        return Response({'message': 'update request approved'}, status=status.HTTP_200_OK)

class HandleRequestReturnsView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GA', 'CADASTRO']
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        solicitacao = get_request_detail(pk)
        acao = request.data.get('action')
        parecer = request.FILES.get('parecer')

        if acao not in ['REPROVAR', 'SOLICITAR_AJUSTE_GN', 'SOLICITAR_AJUSTE_GA']:
            return Response({'detail': 'invalid action'}, status=status.HTTP_400_BAD_REQUEST)
        if not parecer:
            return Response({'detail': 'the document is mandatory'}, status=status.HTTP_400_BAD_REQUEST)

        ip = request.META.get('REMOTE_ADDR')
        handle_request_return_service(solicitacao, acao, parecer, request.user, ip=ip)
        return Response({'message': 'updated'}, status=status.HTTP_200_OK)

class CADAcceptRequest(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['CADASTRO']

    def post(self, request, pk):
        parecer = request.FILES.get('parecer')
        if not parecer:
            return Response({'detail': 'the document is mandatory'}, status=status.HTTP_400_BAD_REQUEST)
        
        solicitacao = get_request_detail(pk)
        if solicitacao.status == Request.RequestStatus.UPDATED:
            return Response({'detail': 'update request already approved'}, status=status.HTTP_409_CONFLICT)
        
        ip = request.META.get('REMOTE_ADDR')
        finalize_request_service(solicitacao, parecer, request.user, ip=ip)

        return Response({'message': 'update request approved'}, status=status.HTTP_200_OK)
