from django.db import models

class DocumentosSolicitacao(models.Model):
    solicitacao = models.ForeignKey('update_requests.Solicitacao', on_delete=models.CASCADE, related_name='documentos')
    arquivo = models.FileField(upload_to='documentos_solicitacoes/', help_text='Arquivo do documento anexado')
