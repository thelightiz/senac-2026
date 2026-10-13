from django.db import models
from django.conf import settings
from customers.models import Customer

from django.contrib.auth import get_user_model
User = get_user_model()

class UpdateRequest(models.Model):
    class UpdateType(models.TextChoices):
        INCOME = 'INCOME', 'Atualização de Renda'
        PROPERTY = 'PROPERTY', 'Atualização de Patrimônio Relacionado a Imóveis'
        VEHICLE = 'VEHICLE', 'Atualização de Patrimônio Relacionado a Veículos'
        ADDRESS = 'ADDRESS', 'Atualização de Endereço'

    class Status(models.TextChoices):
        SUBMITTING = 'SUBMITTING', 'Enviando Solicitação'
        PENDING_AGENCY_REVIEW = 'PENDING_AGENCY_REVIEW', 'Pendente Análise do GA'
        PENDING_REGISTRATION = 'PENDING_REGISTRATION', 'Pendente Análise do Time de Cadastro'
        NEEDS_ADJUSTMENT_GN = 'NEEDS_ADJUSTMENT_GN', 'Necessita Ajuste do GN'
        NEEDS_ADJUSTMENT_GA = 'NEEDS_ADJUSTMENT_GA', 'Necessita Ajuste do GA'
        UPDATED = 'UPDATED', 'Atualizado'
        REJECTED = 'REJECTED', 'Rejeitado'

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_requests',
        help_text="Usuário que criou a solicitação",
        verbose_name='Criado por'
    )
    customer = models.ForeignKey(
        Customer, 
        on_delete=models.CASCADE, 
        related_name='requests',
        verbose_name='Cliente'
    )
    update_type = models.CharField(
        max_length=20, 
        choices=UpdateType.choices,
        verbose_name='Tipo de Atualização'
    )
    status = models.CharField(
        max_length=30, 
        choices=Status.choices, 
        default=Status.PENDING_AGENCY_REVIEW,
        verbose_name='Status'
    )

    class Meta:
        verbose_name = 'Solicitação'
        verbose_name_plural = 'Solicitações'
        db_table = 'update_request'

    def __str__(self):
        creator = self.created_by.username if self.created_by else "N/A"
        return f'Solicitação {self.id} - {self.customer.name} | Criado por: {creator}'


class OldData(models.Model):
    request = models.ForeignKey(
        UpdateRequest, 
        related_name='old_data', 
        on_delete=models.CASCADE,
        verbose_name='Solicitação'
    )
    reference_customer = models.ForeignKey(
        Customer, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name='Cliente de Referência'
    )

    salary_snapshot = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Snapshot de Salário')
    address_snapshot = models.CharField(max_length=400, verbose_name='Snapshot de Endereço')
    zip_code_snapshot = models.CharField(max_length=8, verbose_name='Snapshot de CEP')

    has_properties_snapshot = models.BooleanField(default=False, verbose_name='Tem Imóveis (Snapshot)')
    has_vehicles_snapshot = models.BooleanField(default=False, verbose_name='Tem Veículos (Snapshot)')
    properties_count_snapshot = models.IntegerField(default=0, verbose_name='Qtd. Imóveis (Snapshot)')
    vehicles_count_snapshot = models.IntegerField(default=0, verbose_name='Qtd. Veículos (Snapshot)')

    class Meta:
        verbose_name = 'Dados Antigos'
        verbose_name_plural = 'Dados Antigos'
        db_table = 'old_data'

    def get_properties_info(self):
        return self.properties_count_snapshot

    def get_vehicles_info(self):
        return self.vehicles_count_snapshot

    def has_assets(self):
        return self.has_properties_snapshot or self.has_vehicles_snapshot


class PropertySnapshot(models.Model):
    old_data = models.ForeignKey(
        OldData, 
        related_name='property_snapshots', 
        on_delete=models.CASCADE,
        verbose_name='Dados Antigos'
    )
    
    address = models.CharField(max_length=150, verbose_name='Endereço')
    neighborhood = models.CharField(max_length=150, verbose_name='Bairro')
    city = models.CharField(max_length=100, verbose_name='Cidade')
    zip_code = models.CharField(max_length=8, verbose_name='CEP')

    class Meta:
        verbose_name = 'Snapshot de Imóvel'
        verbose_name_plural = 'Snapshots de Imóveis'
        db_table = 'property_snapshot'
    
    def __str__(self):
        return f'Imóvel em {self.city} (Snapshot ID: {self.old_data.id})'


class VehicleSnapshot(models.Model):
    old_data = models.ForeignKey(
        OldData, 
        related_name='vehicle_snapshots', 
        on_delete=models.CASCADE,
        verbose_name='Dados Antigos'
    )
    
    renavam = models.CharField(max_length=11, blank=True, null=True, verbose_name='RENAVAM')
    license_plate = models.CharField(max_length=7, blank=True, null=True, verbose_name='Placa')
    brand_model = models.CharField(max_length=90, blank=True, null=True, verbose_name='Marca/Modelo')
    year = models.CharField(max_length=9, blank=True, null=True, verbose_name='Ano')

    class Meta:
        verbose_name = 'Snapshot de Veículo'
        verbose_name_plural = 'Snapshots de Veículos'
        db_table = 'vehicle_snapshot'
    
    def __str__(self):
        return f'RENAVAM {self.renavam} (Snapshot ID: {self.old_data.id})'


class NewData(models.Model):
    request = models.ForeignKey(
        UpdateRequest, 
        related_name='new_data', 
        on_delete=models.CASCADE,
        verbose_name='Solicitação'
    )
    customer = models.ForeignKey(
        Customer, 
        on_delete=models.CASCADE,
        verbose_name='Cliente'
    )

    salary = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name='Salário')
    residence_address = models.CharField(max_length=400, blank=True, null=True, verbose_name='Endereço Residencial')
    residence_zip_code = models.CharField(max_length=8, blank=True, null=True, verbose_name='CEP Residencial')

    class Meta:
        verbose_name = 'Dados Novos'
        verbose_name_plural = 'Dados Novos'
        db_table = 'new_data'

    def __str__(self):
        return f'Dados Atualizados da Solicitação {self.request.id}'


class RequestProperty(models.Model):
    new_data = models.ForeignKey(
        NewData, 
        related_name='properties', 
        on_delete=models.CASCADE,
        verbose_name='Dados Novos'
    )
    address = models.CharField(max_length=150, blank=True, null=True, verbose_name='Endereço')
    neighborhood = models.CharField(max_length=150, blank=True, null=True, verbose_name='Bairro')
    city = models.CharField(max_length=100, blank=True, null=True, verbose_name='Cidade')
    zip_code = models.CharField(max_length=8, blank=True, null=True, verbose_name='CEP')

    class Meta:
        verbose_name = 'Imóvel da Solicitação'
        verbose_name_plural = 'Imóveis da Solicitação'
        db_table = 'request_property'


class RequestVehicle(models.Model):
    new_data = models.ForeignKey(
        NewData, 
        related_name='vehicles', 
        on_delete=models.CASCADE,
        verbose_name='Dados Novos'
    )
    renavam = models.CharField(max_length=11, blank=True, null=True, verbose_name='RENAVAM')
    license_plate = models.CharField(max_length=7, blank=True, null=True, verbose_name='Placa')
    brand_model = models.CharField(max_length=90, blank=True, null=True, verbose_name='Marca/Modelo')
    year = models.CharField(max_length=9, blank=True, null=True, verbose_name='Ano')

    class Meta:
        verbose_name = 'Veículo da Solicitação'
        verbose_name_plural = 'Veículos da Solicitação'
        db_table = 'request_vehicle'
