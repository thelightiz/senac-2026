from rest_framework import serializers
from .models import Log

class LogHistorySerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    status_anterior = serializers.CharField(source='get_status_anterior_display', read_only=True)
    status_atual = serializers.CharField(source='get_status_atual_display', read_only=True)

    class Meta:
        model = Log
        fields = [
            'id', 
            'status_anterior', 
            'status_atual', 
            'usuario_username',
            'created_at'
        ]
