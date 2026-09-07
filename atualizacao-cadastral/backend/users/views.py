from .serializers import LoginSerializer
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data, context={"request": request})

    if serializer.is_valid():
        user = serializer.validated_data['user']
        return Response({
            "status": "success",
            "mensagem": "Login realizado com sucesso!",
            "user":{
                "id": user.id,
                "nome": user.username,
                "role": user.role}
            }, status=status.HTTP_200_OK
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    