from django.db import models
from django.conf import settings
from customers.models import Customer

from django.contrib.auth import get_user_model
User = get_user_model()

class Request(models.Model):
    class RequestStatus(models.TextChoices):
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
        verbose_name="Criado por",
        help_text="Usuário que criou a solicitação"
    )
    customer = models.ForeignKey(
        Customer, 
        on_delete=models.CASCADE, 
        related_name='requests',
        verbose_name="Cliente"
    )
    
    has_salary_update = models.BooleanField(default=False, verbose_name="Atualiza Renda?")
    has_address_update = models.BooleanField(default=False, verbose_name="Atualiza Endereço?")
    has_property_update = models.BooleanField(default=False, verbose_name="Atualiza Imóveis?")
    has_vehicle_update = models.BooleanField(default=False, verbose_name="Atualiza Veículos?")

    status = models.CharField(
        max_length=30, 
        choices=RequestStatus.choices, 
        default=RequestStatus.PENDING_AGENCY_REVIEW,
        verbose_name="Status"
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        verbose_name = "Solicitação"
        verbose_name_plural = "Solicitações"

    def __str__(self):
        creator_name = self.created_by.username if self.created_by else "N/A"
        return f"Request #{self.id} - {self.customer.name} | Criado por: {creator_name}"

class PreviousData(models.Model):
    request = models.ForeignKey(
        Request, 
        related_name='previous_data', 
        on_delete=models.CASCADE,
        verbose_name="Solicitação"
    )
    reference_customer = models.ForeignKey(
        Customer, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Cliente de Referência"
    )

    salary_snapshot = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name="Snapshot de Salário"
    )
    address_snapshot = models.CharField(
        max_length=400,
        verbose_name="Snapshot de Endereço"
    )
    cep_snapshot = models.CharField(
        max_length=8,
        verbose_name="Snapshot de CEP"
    )

    has_properties_snapshot = models.BooleanField(
        default=False,
        verbose_name="Possui Imóveis (Snapshot)"
    )
    has_vehicles_snapshot = models.BooleanField(
        default=False,
        verbose_name="Possui Veículos (Snapshot)"
    )
    properties_count_snapshot = models.IntegerField(
        default=0,
        verbose_name="Qtd. Imóveis (Snapshot)"
    )
    vehicles_count_snapshot = models.IntegerField(
        default=0,
        verbose_name="Qtd. Veículos (Snapshot)"
    )

    class Meta:
        verbose_name = "Dados Anteriores (Snapshot)"
        verbose_name_plural = "Dados Anteriores (Snapshots)"

    def get_properties_info(self):
        return self.properties_count_snapshot

    def get_vehicles_info(self):
        return self.vehicles_count_snapshot

    def has_assets(self):
        return self.has_properties_snapshot or self.has_vehicles_snapshot

    def __str__(self):
        return f"Previous Data for Request #{self.request_id}"

class PropertySnapshot(models.Model):
    previous_data = models.ForeignKey(
        PreviousData, 
        related_name='property_snapshots', 
        on_delete=models.CASCADE,
        verbose_name="Dados Anteriores"
    )
    address = models.CharField(max_length=150, verbose_name="Endereço")
    neighborhood = models.CharField(max_length=150, verbose_name="Bairro")
    city = models.CharField(max_length=100, verbose_name="Cidade")
    cep = models.CharField(max_length=8, verbose_name="CEP")

    class Meta:
        verbose_name = "Snapshot de Imóvel"
        verbose_name_plural = "Snapshots de Imóveis"

    def __str__(self):
        return f"Imóvel em {self.city} (Snapshot ID: {self.previous_data_id})"

class VehicleSnapshot(models.Model):
    previous_data = models.ForeignKey(
        PreviousData, 
        related_name='vehicle_snapshots', 
        on_delete=models.CASCADE,
        verbose_name="Dados Anteriores"
    )
    renavam = models.CharField(max_length=11, blank=True, null=True, verbose_name="RENAVAM")
    plate = models.CharField(max_length=7, blank=True, null=True, verbose_name="Placa")
    brand_model = models.CharField(max_length=90, blank=True, null=True, verbose_name="Marca/Modelo")
    year = models.CharField(max_length=9, blank=True, null=True, verbose_name="Ano")

    class Meta:
        verbose_name = "Snapshot de Veículo"
        verbose_name_plural = "Snapshots de Veículos"

    def __str__(self):
        return f"RENAVAM {self.renavam} (Snapshot ID: {self.previous_data_id})"

class ProposedData(models.Model):
    request = models.ForeignKey(
        Request, 
        related_name='proposed_data', 
        on_delete=models.CASCADE,
        verbose_name="Solicitação"
    )
    customer = models.ForeignKey(
        Customer, 
        on_delete=models.CASCADE,
        verbose_name="Cliente"
    )

    salary = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name="Salário Proposto"
    )
    residence_address = models.CharField(
        max_length=400, 
        blank=True, 
        null=True,
        verbose_name="Endereço Residencial Proposto"
    )
    residence_cep = models.CharField(
        max_length=8, 
        blank=True, 
        null=True,
        verbose_name="CEP Residencial Proposto"
    )

    class Meta:
        verbose_name = "Dados Propostos"
        verbose_name_plural = "Dados Propostos"

    def __str__(self):
        return f"Proposed Data for Request #{self.request_id}"

class ProposedProperty(models.Model):
    proposed_data = models.ForeignKey(
        ProposedData, 
        related_name='properties', 
        on_delete=models.CASCADE,
        verbose_name="Dados Propostos"
    )
    address = models.CharField(max_length=150, blank=True, null=True, verbose_name="Endereço")
    neighborhood = models.CharField(max_length=150, blank=True, null=True, verbose_name="Bairro")
    city = models.CharField(max_length=100, blank=True, null=True, verbose_name="Cidade")
    cep = models.CharField(max_length=8, blank=True, null=True, verbose_name="CEP")

    class Meta:
        verbose_name = "Imóvel Proposto"
        verbose_name_plural = "Imóveis Propostos"

    def __str__(self):
        return f"Proposed Property - {self.city}"

class ProposedVehicle(models.Model):
    proposed_data = models.ForeignKey(
        ProposedData, 
        related_name='vehicles', 
        on_delete=models.CASCADE,
        verbose_name="Dados Propostos"
    )
    renavam = models.CharField(max_length=11, blank=True, null=True, verbose_name="RENAVAM")
    plate = models.CharField(max_length=7, blank=True, null=True, verbose_name="Placa")
    brand_model = models.CharField(max_length=90, blank=True, null=True, verbose_name="Marca/Modelo")
    year = models.CharField(max_length=9, blank=True, null=True, verbose_name="Ano")

    class Meta:
        verbose_name = "Veículo Proposto"
        verbose_name_plural = "Veículos Propostos"

    def __str__(self):
        return f"Proposed Vehicle - {self.plate}"
