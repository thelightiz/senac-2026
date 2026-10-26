from rest_framework import serializers
from .models import Log

class LogHistorySerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    previous_status = serializers.CharField(source='get_previous_status_display', read_only=True)
    current_status = serializers.CharField(source='get_current_status_display', read_only=True)

    class Meta:
        model = Log
        fields = [
            'id', 
            'previous_status', 
            'current_status', 
            'user_username',
            'created_at'
        ]
