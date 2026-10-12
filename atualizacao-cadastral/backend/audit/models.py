from django.db import models
from update_requests.models import Solicitacao
from users.models import Usuarios

class Log(models.Model):
    class Status(models.TextChoices):
        SUBMITING = 'SUBMITTING', 'Enviando Solicitação'
        PENDING_AGENCY_REVIEW = 'PENDING_AGENCY_REVIEW', 'Pendente Análise do GA'
        PENDING_CADASTRO = 'PENDING_CADASTRO', 'Pendente Análise do Time de Cadastro'
        NEEDS_ADJUSTMENT_GN = 'NEEDS_ADJUSTMENT_GN', 'Necessita Ajuste do GN'
        NEEDS_ADJUSTMENT_GA = 'NEEDS_ADJUSTMENT_GA', 'Necessita Ajuste do GA'
        UPDATED = 'UPDATED', 'Atualizado'
        REJECTED = 'REJECTED', 'Rejeitado'

    solicitacao = models.ForeignKey(
        Solicitacao, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        db_index=True, 
        related_name='status_logs',
        verbose_name='Solicitação'
    )
    usuario = models.ForeignKey(
        Usuarios, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        db_index=True, 
        related_name='action_logs',
        verbose_name='Usuário Responsável'
    )
    
    status_anterior = models.CharField(
        max_length=50, 
        choices=Status.choices,
        verbose_name='Status Anterior'
    )
    status_atual = models.CharField(
        max_length=50, 
        choices=Status.choices,
        verbose_name='Status Atual'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True, 
        db_index=True,
        verbose_name='Criado em'
    )

    class Meta:
        verbose_name = 'Log de Solicitação'
        verbose_name_plural = 'Logs de Solicitações'
        ordering = ['-created_at']
        db_table = 'solicitacao_log'
