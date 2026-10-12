from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class HealthCheckView(APIView):
    permission_classes = []

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            return Response({"status": "healthy", "database": "connected"}, status=status.HTTP_200_OK)
        except Exception as error:
            return Response({"status": "unhealthy", "error": str(error)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
