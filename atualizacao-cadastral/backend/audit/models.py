from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from users.models import User

class AuditLog(models.Model):
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        db_index=True, 
        related_name='audit_logs',
        verbose_name="Usuário"
    )
    request = models.ForeignKey(
        'update_requests.Request', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='audit_logs',
        verbose_name="Solicitação"
    )
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True, verbose_name="Data/Hora")

    IP_ADDRESS = models.GenericIPAddressField(null=True, blank=True, verbose_name="Endereço IP")
    user_agent = models.TextField(null=True, blank=True, verbose_name="User Agent")

    class ActionChoices(models.TextChoices):
        CREATE = 'CREATE', 'Criação'
        APPROVE = 'APPROVE', 'Aprovação'
        REJECT = 'REJECT', 'Reprovação'
        REQUEST_ADJUSTMENT = 'REQUEST_ADJUSTMENT', 'Solicitação de Ajuste'
        EDIT = 'EDIT', 'Solicitação Ajustada'
        EFFECT = 'EFFECT', 'Efetivação'
        STATUS_CHANGE = 'STATUS_CHANGE', 'Mudança de Status'

    action = models.CharField(
        max_length=20, 
        choices=ActionChoices.choices, 
        default=ActionChoices.STATUS_CHANGE,
        verbose_name="Ação Executada"
    )

    previous_status = models.CharField(max_length=50, blank=True, null=True, verbose_name="Status Anterior")
    new_status = models.CharField(max_length=50, blank=True, null=True, verbose_name="Novo Status")

    justification = models.TextField(blank=True, null=True, verbose_name="Justificativa / Parecer")

    changes_payload = models.JSONField(null=True, blank=True, verbose_name="Payload de Alterações")

    class Meta:
        verbose_name = "Log de Auditoria"
        verbose_name_plural = "Logs de Auditoria"

    def __str__(self):
        user_name = self.user.username if self.user else "Sistema"
        return f"Log #{self.id} | {user_name} - {self.get_action_display()} ({self.timestamp})"
