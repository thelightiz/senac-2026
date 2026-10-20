from .models import UpdateRequest, NewData
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
        requests = UpdateRequest.objects.filter(created_by=user)
        serializer = GetRequestsSerializer(requests, many=True)
        
        return Response(
            {'user': {
                'name': user.username,
                'role': user.role,
            },
            'requests': serializer.data},
            status=status.HTTP_200_OK)

class GNCreateRequestView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GN']
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = PostRequestSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            update_request = serializer.save(created_by=request.user)
            return Response(
                {'message': 'created', 'id': update_request.id, 'created_by_id': update_request.created_by_id}, 
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GARequestsQueueView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GA']

    def get(self, request):
        user = request.user
        requests = UpdateRequest.objects.filter(status__in=['PENDING_AGENCY_REVIEW', 'NEEDS_ADJUSTMENT_GA'])
        serializer = GetRequestsSerializer(requests, many=True)
        
        return Response(
            {'user': {
                'name': user.username,
                'role': user.role,
            },
            'requests': serializer.data},
            status=status.HTTP_200_OK)

class CADRequestsQueueView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['CADASTRO']

    def get(self, request):
        user = request.user
        requests = UpdateRequest.objects.filter(status='PENDING_REGISTRATION')
        serializer = GetRequestsSerializer(requests, many=True)
        
        return Response(
            {'user': {
                'name': user.username,
                'role': user.role,
            },
            'requests': serializer.data},
            status=status.HTTP_200_OK)

class SeeRequestView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GN', 'GA', 'CADASTRO']

    def get(self, request, pk):
        update_request = get_object_or_404(UpdateRequest, id=pk)
        serializer = GetRequestInfoSerializer(update_request, context={'request': request})
        
        return Response(
            {'request': serializer.data},
            status=status.HTTP_200_OK
        )

class GAAcceptRequestView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GA']

    def post(self, request, pk):
        update_request = get_object_or_404(UpdateRequest, pk=pk)

        try:
            accept_request_service(update_request=update_request, user=request.user)
        except ValidationError as error:
            return Response(error.detail, status=status.HTTP_409_CONFLICT)
        except PermissionDenied as error:
            return Response(error.detail, status=status.HTTP_401_UNAUTHORIZED)

        return Response({'message': 'Request approved'}, status=status.HTTP_200_OK)

class HandleRequestReturnsView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GA', 'CADASTRO']
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        update_request = get_object_or_404(UpdateRequest, pk=pk)
        action = request.data.get('action')
        opinion = request.FILES.get('opinion')

        try:
            handle_request_return_service(
                update_request=update_request,
                action=action,
                opinion=opinion,
                user=request.user
            )
        except ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': 'Document attached successfully.'
        }, status=status.HTTP_200_OK)

class CADAcceptRequest(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['CADASTRO']
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        opinion = request.FILES.get('opinion')
        update_request = get_object_or_404(UpdateRequest, pk=pk)

        try:
            formalize_update_request_service(
                update_request=update_request,
                opinion=opinion,
                user=request.user
            )
        except ValidationError as error:
            detail = error.detail

            if isinstance(detail, dict) and detail.get('code') == 'already_updated':
                return Response({'detail': detail['detail']}, status=status.HTTP_409_CONFLICT)
            
            return Response(error.detail, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': 'Request finalized'
        }, status=status.HTTP_200_OK)

class GNAdjustRequestView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GN']
    parser_classes = [MultiPartParser, FormParser]
    
    def patch(self, request, pk):
        update_request = get_object_or_404(UpdateRequest, pk=pk)
        new_data = get_object_or_404(NewData, request=update_request)
        
        raw_new_data = request.data.get('new_data')
        if isinstance(raw_new_data, str):
            try:
                payload = json.loads(raw_new_data)
            except json.JSONDecodeError:
                return Response(
                    {"new_data": ["Invalid JSON format in new_data."]},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif isinstance(raw_new_data, dict):
            payload = raw_new_data
        else:
            payload = request.data

        serializer = GNAdjustRequestSerializer(new_data, data=payload, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        adjust_request_service(
            update_request=update_request,
            new_data=new_data,
            validated_data=serializer.validated_data,
            user=request.user
        )

        return Response(serializer.data, status=status.HTTP_200_OK)

class SystemMetricsView(APIView):
    def get(self, request):
        metrics = UpdateRequest.objects.aggregate(
            total_requests_created=Count('id'),
            total_requests_finalized=Count('id', filter=Q(status='UPDATED')),
            total_requests_rejected=Count('id', filter=Q(status='REJECTED')),
            requests_pending_agency_review=Count('id', filter=Q(status='PENDING_AGENCY_REVIEW')),
            requests_pending_registration=Count('id', filter=Q(status='PENDING_REGISTRATION')),
            requests_pending_adjustment_gn=Count('id', filter=Q(status='NEEDS_ADJUSTMENT_GN')),
            requests_pending_adjustment_ga=Count('id', filter=Q(status='NEEDS_ADJUSTMENT_GA'))
        )
        return Response(metrics, status=status.HTTP_200_OK)
