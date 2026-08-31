from django.db import models

class Usuarios(models.Model):
    id = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100)
    senha = models.CharField(max_length=50)
    ROLES = [
        ('GN', 'Gerente de Negócios'),
        ('GA', 'Gerente de Agência'),
        ('CADASTRO', 'Time de Cadastro'),
        ('ADMIN', 'Administrador')
    ]
    role = models.CharField(max_length=8, choices=ROLES)