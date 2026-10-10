from .models import Request

def get_requests_for_gn(user):
    return Request.objects.filter(created_by=user).select_related('customer', 'created_by')

def get_ga_review_queue():
    return Request.objects.filter(
        status__in=[Request.RequestStatus.PENDING_AGENCY_REVIEW, Request.RequestStatus.NEEDS_ADJUSTMENT_GA]
    ).select_related('customer', 'created_by')

def get_cadastro_queue():
    return Request.objects.filter(
        status=Request.RequestStatus.PENDING_REGISTRATION
    ).select_related('customer', 'created_by')

def get_request_detail(request_id):
    from django.shortcuts import get_object_or_404
    return get_object_or_404(Request.objects.select_related('customer', 'created_by'), id=request_id)
