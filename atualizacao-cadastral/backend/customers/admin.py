from django.contrib import admin
from .models import Cliente, Imovel, Veiculo

admin.site.register(Cliente)
admin.site.register(Imovel)
admin.site.register(Veiculo)