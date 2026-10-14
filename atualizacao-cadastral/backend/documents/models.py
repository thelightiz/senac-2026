from django.db import models

class RequestDocument(models.Model):
    request = models.ForeignKey(
        'update_requests.UpdateRequest', 
        on_delete=models.CASCADE, 
        related_name='documents',
        verbose_name='Solicitação'
    )
    log = models.ForeignKey(
        'audit.Log', 
        on_delete=models.CASCADE, 
        related_name='request_documents', 
        verbose_name='Log'
    )
    file = models.FileField(
        upload_to='request_documents/', 
        help_text='Arquivo do documento anexado',
        verbose_name='Arquivo'
    )
    created_at = models.DateTimeField(
        auto_now_add=True, 
        verbose_name='Data de Envio'
    )

    class Meta:
        verbose_name = 'Documento da Solicitação'
        verbose_name_plural = 'Documentos da Solicitação'
        db_table = 'request_document'

    def __str__(self):
        return f"Documento #{self.id}"
