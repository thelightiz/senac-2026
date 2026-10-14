from django.contrib import admin
from .models import Log

@admin.register(Log)
class LogAdmin(admin.ModelAdmin):
    list_display = ('update_request', 'user', 'previous_status', 'current_status', 'created_at')
    readonly_fields = ('created_at',)
