from django.db import transaction
from rest_framework import serializers
from .models import Solicitacao, DadosAntigos, DadosNovos, SnapshotImovel, SnapshotVeiculo
from customers.models import Cliente

class PushRequestSerializer(serializers.ModelSerializer):
    cliente = serializers.SlugRelatedField(
        slug_field='cpf',
        queryset=Cliente.objects.all()
    )
    dados_novos = serializers.DictField(required=True)

    criado_por = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )

    class Meta:
        model = Solicitacao
        fields = [
            'id', 'criado_por', 'cliente', 'atualizacao', 'status',
            'documento', 'dados_novos',
        ]

    def validate_dados_novos(self, value):
        if not value.get('salario'):
            cpf = self.initial_data.get('cliente')
            try:
                cliente_atual = Cliente.objects.get(cpf=cpf)
                value['salario'] = cliente_atual.salario
            except Cliente.DoesNotExist:
                raise serializers.ValidationError("Cliente não encontrado")
        return value

    @transaction.atomic
    def create(self, validated_data):
        cliente = validated_data.pop('cliente')
        dados_novos_data = validated_data.pop('dados_novos')

        solicitacao = Solicitacao.objects.create(**validated_data, cliente=cliente)

        qtd_imoveis = cliente.imoveis.count()
        qtd_veiculos = cliente.veiculos.count()

        dados_antigos = DadosAntigos.objects.create(
            solicitacao=solicitacao,
            dados_referencia=cliente,
            salario_snapshot=cliente.salario,
            endereco_snapshot=cliente.endereco,
            cep_snapshot=cliente.cep,
            tem_imoveis_snapshot=qtd_imoveis > 0,
            tem_veiculos_snapshot=qtd_veiculos > 0,
            qtd_imoveis_snapshot=qtd_imoveis,
            qtd_veiculos_snapshot=qtd_imoveis,
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

class GetRequestsSerializer(serializers.ModelSerializer):
    cliente = serializers.StringRelatedField() 
    status = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Solicitacao
        fields = ['id', 'criado_por', 'cliente', 'atualizacao', 'status', 'documento']

class GetRequestInfoSerializer(serializers.ModelSerializer):
    criado_por = serializers.StringRelatedField()
    cliente = serializers.StringRelatedField()
    status = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Solicitacao
        fields = ['id', 'criado_por', 'cliente', 'atualizacao', 'status', 'documento']
