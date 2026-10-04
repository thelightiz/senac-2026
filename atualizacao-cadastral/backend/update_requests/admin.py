from django.contrib import admin
from .models import Solicitacao, DadosAntigos, DadosNovos, Imovel, Veiculo

admin.site.register(Solicitacao)
admin.site.register(DadosNovos)
admin.site.register(DadosAntigos)
admin.site.register(Imovel)
admin.site.register(Veiculo)