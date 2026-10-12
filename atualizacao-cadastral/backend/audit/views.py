from rest_framework.views import APIView
from services.permissions import HasRole
from .models import Log
from .serializers import LogHistorySerializer
from rest_framework.response import Response

class RequestLogHistoryView(APIView):
    permission_classes = [HasRole]
    allowed_roles = ['GN', 'GA', 'CADASTRO']

    def get(self, request, pk):
        logs = Log.objects.filter(solicitacao_id=pk)
        serializer = LogHistorySerializer(logs, many=True)
        
        return Response(serializer.data)
