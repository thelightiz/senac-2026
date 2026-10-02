from django.utils.decorators import method_decorator
from django.views.decorators.clickjacking import xframe_options_exempt
from rest_framework.views import APIView
from services.permissions import HasRole
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from update_requests.models import Solicitacao
from .models import DocumentosSolicitacao

@method_decorator(xframe_options_exempt, name='dispatch')
class SeePDFView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GN', 'GA', 'CAD']

    def get(self, request, pk):
        documento = get_object_or_404(DocumentosSolicitacao, pk=pk)

        if not documento.arquivo:
            return Response(
                {"detail": "Nenhum arquivo anexado a este registro."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        return FileResponse(documento.arquivo.open('rb'), content_type='application/pdf')
    