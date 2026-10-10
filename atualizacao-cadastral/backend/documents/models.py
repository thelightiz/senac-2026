from django.db import models

class RequestDocument(models.Model):
    class DocumentCategory(models.TextChoices):
        SUPPORTING = 'SUPPORTING', 'Documento Comprobatório'
        REVIEW = 'REVIEW', 'Parecer / Justificativa'

    class DocumentType(models.TextChoices):
        SALARY = 'SALARY', 'Comprovante de Renda'
        ADDRESS = 'ADDRESS', 'Comprovante de Endereço'
        PROPERTY = 'PROPERTY', 'Documento de Imóvel'
        VEHICLE = 'VEHICLE', 'Documento de Veículo'
        JUSTIFICATION = 'JUSTIFICATION', 'Justificativa de Ajuste/Reprovação'
        APPROVAL_NOTE = 'APPROVAL_NOTE', 'Termo de Efetivação'

    request = models.ForeignKey(
        'update_requests.Request',
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name="Solicitação"
    )
    category = models.CharField(
        max_length=20,
        choices=DocumentCategory.choices,
        default=DocumentCategory.SUPPORTING,
        verbose_name="Categoria do Documento"
    )
    document_type = models.CharField(
        max_length=30,
        choices=DocumentType.choices,
        verbose_name="Tipo de Documento"
    )
    display_name = models.CharField(
        max_length=255,
        verbose_name="Nome de Exibição",
        help_text="Nome do arquivo para exibição na interface"
    )
    file = models.FileField(
        upload_to='request_documents/',
        verbose_name="Arquivo",
        help_text="Arquivo do documento anexado"
    )
    related_item_index = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name="Índice do Item Relacionado"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")

    class Meta:
        verbose_name = "Documento da Solicitação"
        verbose_name_plural = "Documentos da Solicitação"

    def __str__(self):
        category_label = self.get_category_display()
        return f"{self.display_name} ({category_label}) - Solicitação #{self.request_id}"
