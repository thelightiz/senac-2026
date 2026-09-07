from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuarios

@admin.register(Usuarios)
class UsuariosAdmin(UserAdmin):
    # Exibe o campo 'role' no formulário de edição de usuário
    fieldsets = UserAdmin.fieldsets + (
        ('Função/Perfil', {'fields': ('role',)}),
    )

    # Exibe o campo 'role' no formulário de criação de usuário no Admin
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Função/Perfil', {'fields': ('role',)}),
    )

    # Colunas visíveis na tabela de listagem do Admin
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active')

    # Filtro lateral por função e status
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')