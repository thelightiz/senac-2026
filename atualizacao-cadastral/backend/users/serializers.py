from rest_framework import serializers
from django.contrib.auth import authenticate

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, write_only=True)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username_input = data.get('username')
        password = data.get('password')

        if not username_input or not password:
            raise serializers.ValidationError('Usuário e senha são obrigatórios.')

        user = authenticate(
            request=self.context.get('request'),
            username=username_input,
            password=password
        )

        if not user:
            raise serializers.ValidationError('Credenciais inválidas.')
        
        data['username'] = user
        return data
