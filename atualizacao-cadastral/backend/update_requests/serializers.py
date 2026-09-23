from django.db import transaction
from rest_framework import serializers
from .models import Solicitacao, DadosAntigos, DadosNovos, SnapshotImovel, SnapshotVeiculo
from customers.models import Cliente

class RequestSerializer(serializers.ModelSerializer):
    cliente = serializers.SlugRelatedField(
        slug_field='nome',
        queryset=Cliente.objects.all()
    )
    dados_novos = serializers.DictField(required=True)

    class Meta:
        model = Solicitacao
        fields = [
            'id', 'criado_por', 'cliente', 'atualizacao', 'status',
            'documento', 'dados_novos',
        ]

    @transaction.atomic
    def create(self, validated_data):
        cliente = validated_data.pop('cliente')
        dados_novos_data = validated_data.pop('dados_novos')

        solicitacao = Solicitacao.objects.create(**validated_data, cliente=cliente)

        dados_antigos = DadosAntigos.objects.create(
            solicitacao=solicitacao,
            dados_referencia=cliente,
            salario_snapshot=cliente.salario,
            endereco_snapshot=cliente.endereco,
            cep_snapshot=cliente.cep,
            tem_imoveis_snapshot=cliente.tem_imoveis,
            tem_veiculos_snapshot=cliente.tem_veiculos,
            qtd_imoveis_snapshot=cliente.imoveis.count(),
            qtd_veiculos_snapshot=cliente.veiculos.count(),
        )

        for imovel in cliente.imoveis.all():
            SnapshotImovel.objects.create(
                dados_antigos=dados_antigos,
                endereco=imovel.endereco,
                bairro=imovel.bairro,
                cidade=imovel.cidade,
                cep=imovel.cep,
            )

        for veiculo in cliente.veiculos.all():
            SnapshotVeiculo.objects.create(
                dados_antigos=dados_antigos,
                renavam=veiculo.renavam,
                placa=veiculo.placa,
                marca_modelo=veiculo.marca_modelo,
                ano=veiculo.ano,
            )

        DadosNovos.objects.create(
            solicitacao=solicitacao,
            cliente=cliente,
            **dados_novos_data
        )

        return solicitacao
