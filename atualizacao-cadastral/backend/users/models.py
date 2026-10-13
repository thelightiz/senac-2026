from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        GN = 'GN', 'Gerente de Negócios'
        GA = 'GA', 'Gerente de Agência'
        CADASTRO = 'CADASTRO', 'Time de Cadastro'
        ADMIN = 'ADMIN', 'Administrador'

    role = models.CharField(
        max_length=8, 
        choices=Role.choices,
        verbose_name='Função',
        help_text='Função do usuário no sistema.'
    )

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        db_table = 'user'

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
