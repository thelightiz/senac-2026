from django.http import HttpResponse
from django.shortcuts import render
from .models import Cliente

def teste(request):
    #Cliente.objects.create(nome='oi', cpf='00000000000', salario=20, residencia='a', cep='00000000')
    output = Cliente.objects.get(nome='oi')
    return HttpResponse(output)