from django.db import models

class DocumentosSolicitacao(models.Model):
    solicitacao = models.ForeignKey('update_requests.Solicitacao', on_delete=models.CASCADE, related_name='documentos')
    log = models.ForeignKey('audit.Log', on_delete=models.CASCADE, related_name='documentos')
    arquivo = models.FileField(upload_to='documentos_solicitacoes/', help_text='Arquivo do documento anexado')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Data de Envio')
