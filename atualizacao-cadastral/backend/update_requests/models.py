from django.db import models
from customers.models import Cliente

class Solicitacao(models.Model):
    id = models.AutoField(primary_key=True)
    id_gn = models.IntegerField()
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='solicitacoes')
    dados_antigos = models.ForeignKey('DadosAntigos', on_delete=models.SET_NULL, null=True, blank=True, related_name='solicitacoes_com_dados_antigos')
    dados_novos = models.ForeignKey('DadosNovos', on_delete=models.SET_NULL, null=True, blank=True, related_name='solicitacoes_com_dados')

    TIPO_ATUALIZACAO = [
        ('Renda', 'Atualização de Renda'),
        ('Patrimônio', 'Atualização de Patrimônio'),
        ('Endereço', 'Atualização de Endereço'),
    ]
    atualizacao = models.CharField(max_length=20, choices=TIPO_ATUALIZACAO)

    STATUS_CHOICES = [
        ('DRAFT', 'Rascunho'),
        ('SUBMITTED', 'Enviado'),
        ('PENDING_AGENCY_REVIEW', 'Pendente Análise'),
        ('APPROVED', 'Aprovado'),
        ('NEEDS_ADJUSTMENT', 'Necessita Ajuste'),
        ('PENDING_CADASTRO', 'Pendente Cadastro'),
        ('UPDATED', 'Atualizado'),
        ('COMPLETED', 'Concluído'),
        ('REJECTED', 'Rejeitado'),
    ]
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='DRAFT')

    documento = models.URLField(help_text='URL do documento anexado')

    def __str__(self):
        return f'Solicitação {self.id} - {self.cliente.nome} ({self.get_status_display()})'


class DadosAntigos(models.Model):
    solicitacao = models.ForeignKey(Solicitacao, related_name='dados_solicitacao_antigos', on_delete=models.CASCADE)
    dados_referencia = models.ForeignKey(Cliente, on_delete=models.SET_NULL, null=True, blank=True)

    salario_snapshot = models.DecimalField(max_digits=10, decimal_places=2)
    endereco_snapshot = models.CharField(max_length=400)
    cep_snapshot = models.CharField(max_length=8)

    tem_imoveis_snapshot = models.BooleanField(default=False)
    tem_veiculos_snapshot = models.BooleanField(default=False)
    qtd_imoveis_snapshot = models.IntegerField(default=0)
    qtd_veiculos_snapshot = models.IntegerField(default=0)

    def get_imoveis_info(self):
        return self.qtd_imoveis_snapshot

    def get_veiculos_info(self):
        return self.qtd_veiculos_snapshot

    def tem_ativos(self):
        return self.tem_imoveis_snapshot or self.tem_veiculos_snapshot


class SnapshotImovel(models.Model):
    dados_antigos = models.ForeignKey(DadosAntigos, related_name='imoveis_snapshot', on_delete=models.CASCADE)
    
    endereco = models.CharField(max_length=150)
    bairro = models.CharField(max_length=150)
    cidade = models.CharField(max_length=100)
    cep = models.CharField(max_length=8)
    
    def __str__(self):
        return f'Imóvel em {self.cidade} (Snapshot ID: {self.dados_antigos.id})'

class SnapshotVeiculo(models.Model):
    dados_antigos = models.ForeignKey(DadosAntigos, related_name='veiculos_snapshot', on_delete=models.CASCADE)
    
    enavam = models.CharField(max_length=11, blank=True, null=True)
    placa = models.CharField(max_length=7, blank=True, null=True)
    marca_modelo = models.CharField(max_length=90, blank=True, null=True)
    ano = models.CharField(max_length=9, blank=True, null=True) # Mantido como Char para validação de formato se necessário
    
    def __str__(self):
        return f'RENAVAM {self.veiculo_renavam} (Snapshot ID: {self.dados_antigos.id})'

class DadosNovos(models.Model):
    solicitacao = models.ForeignKey(Solicitacao, related_name='dados_solicitacoes_novos', on_delete=models.CASCADE)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)

    salario = models.DecimalField(max_digits=10, decimal_places=2)
    residencia_endereco = models.CharField(max_length=400)
    residencia_cep = models.CharField(max_length=8)

    imovel_endereco = models.CharField(max_length=150, blank=True, null=True)
    imovel_bairro = models.CharField(max_length=150, blank=True, null=True)
    imovel_cidade = models.CharField(max_length=100, blank=True, null=True)
    imovel_cep = models.CharField(max_length=8, blank=True, null=True)

    veiculo_renavam = models.CharField(max_length=11, blank=True, null=True)
    veiculo_placa = models.CharField(max_length=7, blank=True, null=True)
    veiculo_marca_modelo = models.CharField(max_length=90, blank=True, null=True)
    veiculo_ano = models.CharField(max_length=9, blank=True, null=True)

    def __str__(self):
        return f'Dados Atualizados da Solicitação {self.solicitacao.id}'