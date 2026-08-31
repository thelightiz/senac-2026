from django.db import models
from update_requests.models import Solicitacao
from users.models import Usuarios

class Logs(models.Model):
    solicitacao = models.ForeignKey(Solicitacao, on_delete=models.SET_NULL, null=True, db_index=True, related_name='logs')
    usuario = models.ForeignKey(Usuarios, on_delete=models.SET_NULL, null=True, db_index=True, related_name='logs')

    STATUS_CHOICES = [
        ('DRAFT', 'Rascunho'),
        ('SUBMITTED', 'Enviado'),
        ('PENDING_AGENCY_REVIEW', 'Pendente Análise'),
        ('APPROVED', 'Aprovado'),
        ('NEEDS_ADJUSTMENT', 'Necessita Ajuste'),
        ('PENDING_CADASTRO', 'Pendente Cadastro'),
        ('UPDATED', 'Atualizado'),
        ('COMPLETED', 'Concluído'),
        ('REJECTED', 'Rejeitado'),
    ]
    
    status_novo = models.CharField(max_length=21, choices=STATUS_CHOICES)
    status_antigo = models.CharField(max_length=21, choices=STATUS_CHOICES)
    
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        id_solicitacao = self.solicitacao.id if self.solicitacao else 'N/A'
        return f'Log Nº. {self.id} - Solicitação {id_solicitacao}: Antes: {self.status_antigo}, Depois: {self.status_novo} | ({self.timestamp})'
