from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        BUSINESS_MANAGER = 'GN', 'Gerente de Negócios'
        AGENCY_MANAGER = 'GA', 'Gerente de Agência'
        REGISTRATION_TEAM = 'CADASTRO', 'Time de Cadastro'
        ADMIN = 'ADMIN', 'Administrador'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.BUSINESS_MANAGER,
        verbose_name="Cargo"
    )

    class Meta:
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"

    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"
