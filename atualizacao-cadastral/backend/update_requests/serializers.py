from django.db import transaction
from rest_framework import serializers
from .models import Solicitacao, DadosAntigos, DadosNovos, SnapshotImovel, SnapshotVeiculo, Imovel, Veiculo
from documents.models import DocumentosSolicitacao
from customers.models import Cliente
import json

class PostRequestImovelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Imovel
        fields = ['id', 'endereco', 'bairro', 'cidade', 'cep']
        extra_kwargs = {
            'endereco': {'allow_null': True, 'allow_blank': True, 'required': False},
            'bairro': {'allow_null': True, 'allow_blank': True, 'required': False},
            'cidade': {'allow_null': True, 'allow_blank': True, 'required': False},
            'cep': {'allow_null': True, 'allow_blank': True, 'required': False},
        }

class PostRequestVeiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Veiculo
        fields = ['id', 'renavam', 'placa', 'marca_modelo', 'ano']
        extra_kwargs = {
            'renavam': {'allow_null': True, 'allow_blank': True, 'required': False},
            'placa': {'allow_null': True, 'allow_blank': True, 'required': False},
            'marca_modelo': {'allow_null': True, 'allow_blank': True, 'required': False},
            'ano': {'allow_null': True, 'allow_blank': True, 'required': False},
        }

class PostRequestDadosNovosSerializer(serializers.ModelSerializer):
    imovel = PostRequestImovelSerializer(source='imoveis', many=True, required=False)
    veiculo = PostRequestVeiculoSerializer(source='veiculos', many=True, required=False)

    class Meta:
        model = DadosNovos
        fields = ['salario', 'residencia_endereco', 'residencia_cep', 'imovel', 'veiculo']

class PostRequestSerializer(serializers.ModelSerializer):
    cliente = serializers.SlugRelatedField(
        slug_field='cpf',
        queryset=Cliente.objects.all()
    )
    dados_novos = PostRequestDadosNovosSerializer()

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

    def to_internal_value(self, data):
        if hasattr(data, 'getlist'):
            data_dict = {}
            for key in data.keys():
                if key == 'documentos':
                    data_dict[key] = data.getlist(key)
                else:
                    data_dict[key] = data.get(key)
            data = data_dict
        elif hasattr(data, 'copy'):
            data = data.copy()

        dados_novos_raw = data.get('dados_novos')
        if isinstance(dados_novos_raw, str):
            try:
                data['dados_novos'] = json.loads(dados_novos_raw)
            except (ValueError, TypeError, json.JSONDecodeError):
                raise serializers.ValidationError({
                    'dados_novos': 'A string enviada não é um JSON válido.'
                })

        return super().to_internal_value(data)

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

        imoveis_data = dados_novos_data.pop('imoveis', [])
        veiculos_data = dados_novos_data.pop('veiculos', [])

        dados_novos_instance = DadosNovos.objects.create(
            solicitacao=solicitacao,
            cliente=cliente,
            **dados_novos_data
        )

        for imovel_dict in imoveis_data:
            if any(imovel_dict.values()):
                Imovel.objects.create(
                    dados_novos=dados_novos_instance,
                    **imovel_dict
                )

        for veiculo_dict in veiculos_data:
            if any(veiculo_dict.values()):
                Veiculo.objects.create(
                    dados_novos=dados_novos_instance,
                    **veiculo_dict
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

        return solicitacao

class GetRequestsSerializer(serializers.ModelSerializer):
    cliente = serializers.StringRelatedField() 
    status = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Solicitacao
        fields = ['id', 'criado_por', 'cliente', 'atualizacao', 'status', 'documentos']

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
    imovel = PostRequestImovelSerializer(source='imoveis', many=True, read_only=True)
    veiculo = PostRequestVeiculoSerializer(source='veiculos', many=True, read_only=True)

    class Meta:
        model = DadosNovos
        fields = ['salario', 'residencia_endereco', 'residencia_cep', 'imovel', 'veiculo']

class GetRequestInfoSerializer(serializers.ModelSerializer):
    criado_por = serializers.StringRelatedField()
    cliente = serializers.StringRelatedField()
    status = serializers.CharField(source='get_status_display', read_only=True)
    dados_antigos = GetRequestDadosAntigosSerializer(many=True, read_only=True)
    dados_novos = GetRequestDadosNovosSerializer(many=True, read_only=True)
    documentos = GetRequestDocumentsSerializer(many=True, read_only=True)

    class Meta:
        model = Solicitacao
        fields = '__all__'
