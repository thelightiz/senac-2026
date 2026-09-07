from rest_framework import serializers
from django.contrib.auth import authenticate

class LoginSerializer(serializers.Serializer):
    usuario = serializers.CharField(max_length=150, write_only=True)
    senha = serializers.CharField(write_only=True)

    def validate(self, data):
        usuario = data.get('usuario')
        senha = data.get('senha')

        if not usuario or not senha:
            raise serializers.ValidationError('Usuário e senha são obrigatórios.')

        user = authenticate(
            request=self.context.get('request'),
            username=usuario,
            password=senha
        )

        if not user:
            raise serializers.ValidationError('Credenciais inválidas.')
        
        data['user'] = user
        return data