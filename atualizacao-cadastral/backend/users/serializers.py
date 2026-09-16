from rest_framework import serializers
from django.contrib.auth import authenticate

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, write_only=True)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        print(data)
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            raise serializers.ValidationError('Usuário e senha são obrigatórios.')

        username = authenticate(
            request=self.context.get('request'),
            username=username,
            password=password
        )

        if not username:
            raise serializers.ValidationError('Credenciais inválidas.')
        
        data['username'] = username
        return data