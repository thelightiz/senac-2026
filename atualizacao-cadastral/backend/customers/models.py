from django.db import models

class Cliente(models.Model):
    id = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=200)
    cpf = models.CharField(max_length=11, unique=True)
    salario = models.DecimalField(max_digits=10, decimal_places=2)
    endereco = models.CharField(max_length=400, default='')
    cep = models.CharField(max_length=8)

class Imovel(models.Model):
    cliente = models.ForeignKey(Cliente, related_name='imoveis', on_delete=models.CASCADE)
    endereco = models.CharField(max_length=150)
    bairro = models.CharField(max_length=150)
    cidade = models.CharField(max_length=100)
    cep = models.CharField(max_length=8)

class Veiculo(models.Model):
    cliente = models.ForeignKey(Cliente, related_name='veiculos', on_delete=models.CASCADE)
    renavam = models.CharField(max_length=11)
    placa = models.CharField(max_length=7)
    marca_modelo = models.CharField(max_length=90)
    ano = models.CharField(max_length=9)
