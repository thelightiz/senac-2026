from rest_framework import serializers
from .models import Solicitacao
from customers.models import Cliente

class RequestSerializer(serializers.ModelSerializer):
    customer = serializers.SlugRelatedField(
        slug_field='nome',
        queryset=Cliente.objects.all(),
        source='cliente'
    )

    class Meta:
        model = Solicitacao
        fields = ['cliente', 'atualizacao', 'dados_antigos', 'dados_novos', 'documento']
