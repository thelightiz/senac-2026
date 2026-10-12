from django.contrib import admin
from .models import Log

@admin.register(Log)
class LogAdmin(admin.ModelAdmin):
    list_display = ('solicitacao', 'usuario', 'status_anterior', 'status_atual', 'created_at')
    readonly_fields = ('created_at',)
