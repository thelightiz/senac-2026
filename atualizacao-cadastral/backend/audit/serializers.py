from rest_framework import serializers
from .models import Log

class LogHistorySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    previous_status = serializers.CharField(source='get_status_anterior_display', read_only=True)
    new_status = serializers.CharField(source='get_status_atual_display', read_only=True)

    class Meta:
        model = Log
        fields = [
            'id', 
            'previous_status', 
            'new_status', 
            'user_username',
            'created_at'
        ]
