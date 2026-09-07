from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuarios(AbstractUser):
    ROLES = [
        ('GN', 'Gerente de Negócios'),
        ('GA', 'Gerente de Agência'),
        ('CADASTRO', 'Time de Cadastro'),
        ('ADMIN', 'Administrador')
    ]
    role = models.CharField(max_length=8, choices=ROLES)
