from django.contrib import admin
from .models import Solicitacao, DadosAntigos, DadosNovos

admin.site.register(Solicitacao)
admin.site.register(DadosNovos)
admin.site.register(DadosAntigos)