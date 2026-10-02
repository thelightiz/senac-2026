from django.db import transaction
from rest_framework import serializers
from .models import Solicitacao, DadosAntigos, DadosNovos, SnapshotImovel, SnapshotVeiculo
from documents.models import DocumentosSolicitacao
from customers.models import Cliente

class PushRequestSerializer(serializers.ModelSerializer):
    cliente = serializers.SlugRelatedField(
        slug_field='cpf',
        queryset=Cliente.objects.all()
    )
    dados_novos = serializers.DictField(required=True)

    documentos = serializers.ListField(
        child=serializers.FileField(),
        required=False,
        write_only=True
    )

    criado_por = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )

    class Meta:
        model = Solicitacao
        fields = [
            'id', 'criado_por', 'cliente', 'atualizacao', 'status',
            'documentos', 'dados_novos',
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
        validated_data.pop('documentos', None)

        solicitacao = Solicitacao.objects.create(**validated_data, cliente=cliente)

        request = self.context.get('request')
        if request and request.FILES:
            arquivos = request.FILES.getlist('documentos')
            for arquivo in arquivos:
                DocumentosSolicitacao.objects.create(
                    solicitacao=solicitacao,
                    arquivo=arquivo
                )

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
            qtd_veiculos_snapshot=qtd_veiculos,
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
        fields = ['id', 'criado_por', 'cliente', 'atualizacao', 'status', 'documentos',]

class GetRequestDocumentsSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = DocumentosSolicitacao
        fields = '__all__'

    def get_url(self, obj):
        request = self.context.get('request')
        relative_url = f'/api/documentos/{obj.id}/visualizar'

        if request:
            return request.build_absolute_uri(relative_url)

        return relative_url

class GetImovelSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = SnapshotImovel
        fields = '__all__'

class GetVeiculoSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = SnapshotVeiculo
        fields = '__all__'

class GetRequestDadosAntigosSerializer(serializers.ModelSerializer):
    imoveis_snapshot = GetImovelSnapshotSerializer(many=True, read_only=True)
    veiculos_snapshot = GetVeiculoSnapshotSerializer(many=True, read_only=True)

    class Meta:
        model = DadosAntigos
        fields = '__all__'
                  
class GetRequestDadosNovosSerializer(serializers.ModelSerializer):
    imovel = serializers.SerializerMethodField()
    veiculo = serializers.SerializerMethodField()

    class Meta:
        model = DadosNovos
        fields = ['salario', 'residencia_endereco', 'residencia_cep', 'imovel', 'veiculo']

    def get_imovel(self, obj):
        if obj.imovel_endereco or obj.imovel_bairro or obj.imovel_cidade or obj.imovel_cep:
            return [{
                'endereco': obj.imovel_endereco,
                'bairro': obj.imovel_bairro,
                'cidade': obj.imovel_cidade,
                'cep': obj.imovel_cep
            }]
        return list()

    def get_veiculo(self, obj):
        if obj.veiculo_renavam or obj.veiculo_placa or obj.veiculo_marca_modelo or obj.veiculo_ano:
            return [{
                'renavam': obj.veiculo_renavam,
                'placa': obj.veiculo_placa,
                'ano_modelo': obj.veiculo_marca_modelo,
                'ano': obj.veiculo_ano
            }]
        return list()

class GetRequestInfoSerializer(serializers.ModelSerializer):
    criado_por = serializers.StringRelatedField()
    cliente = serializers.StringRelatedField()
    status = serializers.CharField(source='get_status_display', read_only=True)
    dados_solicitacao_antigos = GetRequestDadosAntigosSerializer(many=True, read_only=True)
    dados_solicitacoes_novos = GetRequestDadosNovosSerializer(many=True, read_only=True)
    documentos = GetRequestDocumentsSerializer(many=True, read_only=True)

    class Meta:
        model = Solicitacao
        fields = '__all__'
