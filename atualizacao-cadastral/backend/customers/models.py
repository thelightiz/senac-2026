from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=200, verbose_name='Nome')
    cpf = models.CharField(max_length=11, unique=True, verbose_name='CPF')
    salary = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Salário')
    address = models.CharField(max_length=400, verbose_name='Endereço')
    zip_code = models.CharField(max_length=8, verbose_name='CEP')

    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        db_table = 'customer'

    def __str__(self):
        return self.name

class Property(models.Model):
    customer = models.ForeignKey(Customer, related_name='properties', on_delete=models.CASCADE, verbose_name='Cliente')
    address = models.CharField(max_length=150, verbose_name='Endereço')
    neighborhood = models.CharField(max_length=150, verbose_name='Bairro')
    city = models.CharField(max_length=100, verbose_name='Cidade')
    zip_code = models.CharField(max_length=8, verbose_name='CEP')

    class Meta:
        verbose_name = 'Imóvel'
        verbose_name_plural = 'Imóveis'
        db_table = 'property'

    def __str__(self):
        return f"{self.address}, {self.city}"

class Vehicle(models.Model):
    customer = models.ForeignKey(Customer, related_name='vehicles', on_delete=models.CASCADE, verbose_name='Cliente')
    renavam = models.CharField(max_length=11, verbose_name='RENAVAM')
    license_plate = models.CharField(max_length=7, verbose_name='Placa')
    brand_model = models.CharField(max_length=90, verbose_name='Marca/Modelo')
    year = models.CharField(max_length=9, verbose_name='Ano')

    class Meta:
        verbose_name = 'Veículo'
        verbose_name_plural = 'Veículos'
        db_table = 'vehicle'

    def __str__(self):
        return f"{self.brand_model} ({self.license_plate})"
