from django.utils.decorators import method_decorator
from django.views.decorators.clickjacking import xframe_options_exempt
from rest_framework.views import APIView
from services.permissions import HasRole
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from documents.models import RequestDocument

@method_decorator(xframe_options_exempt, name='dispatch')
class ViewPDFView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GN', 'GA', 'CADASTRO']

    def get(self, request, pk):
        document = get_object_or_404(RequestDocument, pk=pk)

        if not document.file:  # Ajustado para 'file' (padrão em inglês)
            return Response(
                {"detail": "No file attached to this record."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        return FileResponse(document.file.open('rb'), content_type='application/pdf')