from django.db import transaction
from rest_framework.exceptions import ValidationError, PermissionDenied
from audit.models import Log
from documents.models import DocumentosSolicitacao
from .models import Solicitacao, DadosNovos, Imovel, Veiculo, DadosAntigos, SnapshotImovel, SnapshotVeiculo
import logging

logger = logging.getLogger(__name__)

def generic_log_register_service(update_request, previous_status, actual_status, user):
    return Log.objects.create(
        solicitacao=update_request,
        status_anterior=previous_status,
        status_atual=actual_status,
        usuario=user)

@transaction.atomic
def create_update_request_service(validated_data, request, user):
    customer = validated_data.pop('cliente')
    dados_novos_data = validated_data.pop('dados_novos', {})
    validated_data.pop('documentos', None)

    update_request = Solicitacao.objects.create(
        cliente=customer,
        criado_por=user,
        status='PENDING_AGENCY_REVIEW',
        **validated_data
    )

    logger.info(
        f"Nova solicitação {update_request.id} criada pelo usuário {user.username}"
    )

    log_instance = generic_log_register_service(
        update_request=update_request,
        previous_status='SUBMITTING',
        actual_status='PENDING_AGENCY_REVIEW',
        user=user
    )

    if request:
        create_request_documents_service(update_request=update_request, request_files=request.FILES, log_instance=log_instance)

    create_update_request_new_data_service(update_request=update_request, validated_data=dados_novos_data)
    create_request_snapshots_service(update_request=update_request, customer=customer)

    return update_request

@transaction.atomic
def create_update_request_new_data_service(update_request, validated_data):
    new_data = DadosNovos.objects.create(
        solicitacao=update_request,
        cliente=update_request.cliente,
        salario=validated_data.get('salario'),
        residencia_endereco=validated_data.get('residencia_endereco'),
        residencia_cep=validated_data.get('residencia_cep')
    )

    imoveis_data = validated_data.get('imoveis', [])
    for imovel_dict in imoveis_data:
        if any(imovel_dict.values()):
            Imovel.objects.create(
                dados_novos=new_data,
                **imovel_dict
            )

    veiculos_data = validated_data.get('veiculos', [])
    for veiculo_dict in veiculos_data:
        if any(veiculo_dict.values()):
            Veiculo.objects.create(
                dados_novos=new_data,
                **veiculo_dict
            )
            
    return new_data

@transaction.atomic
def create_request_snapshots_service(update_request, customer):
    qtd_imoveis = customer.imoveis.count()
    qtd_veiculos = customer.veiculos.count()

    dados_antigos = DadosAntigos.objects.create(
        solicitacao=update_request,
        dados_referencia=customer,
        salario_snapshot=customer.salario,
        endereco_snapshot=customer.endereco,
        cep_snapshot=customer.cep,
        tem_imoveis_snapshot=qtd_imoveis > 0,
        tem_veiculos_snapshot=qtd_veiculos > 0,
        qtd_imoveis_snapshot=qtd_imoveis,
        qtd_veiculos_snapshot=qtd_veiculos,
    )

    for imovel in customer.imoveis.all():
        SnapshotImovel.objects.create(
            dados_antigos=dados_antigos,
            endereco=imovel.endereco,
            bairro=imovel.bairro,
            cidade=imovel.cidade,
            cep=imovel.cep,
        )

    for veiculo in customer.veiculos.all():
        SnapshotVeiculo.objects.create(
            dados_antigos=dados_antigos,
            renavam=veiculo.renavam,
            placa=veiculo.placa,
            marca_modelo=veiculo.marca_modelo,
            ano=veiculo.ano,
        )
    
    return dados_antigos

@transaction.atomic
def create_request_documents_service(update_request, request_files, log_instance):
    if request_files:
        arquivos = request_files.getlist('documentos', [])
        for arquivo in arquivos:
            DocumentosSolicitacao.objects.create(
                solicitacao=update_request,
                log=log_instance,
                arquivo=arquivo
            )

@transaction.atomic
def update_new_data_service(instance, validated_data):
    imoveis_data = validated_data.pop('imoveis', None)
    veiculos_data = validated_data.pop('veiculos', None)

    for attr, value in validated_data.items():
        setattr(instance, attr, value)

    instance.save()

    if imoveis_data is not None:
        for item_data in imoveis_data:
            item_id = item_data.pop('id', None)
            if item_id:
                Imovel.objects.filter(id=item_id, dados_novos=instance).update(**item_data)
            else:
                Imovel.objects.create(dados_novos=instance, **item_data)

    if veiculos_data is not None:
        for item_data in veiculos_data:
            item_id = item_data.pop('id', None)
            if item_id:
                Veiculo.objects.filter(id=item_id, dados_novos=instance).update(**item_data)
            else:
                Veiculo.objects.create(dados_novos=instance, **item_data)

    return instance

@transaction.atomic
def accept_request_service(request_update, user):
    if request_update.status == 'PENDING_CADASTRO':
        logger.warning(
            f"Tentativa inválida de aprovar a solicitação {request_update.id} pelo usuário {user.username}. Status atual: {request_update.status}"
        )
        raise ValidationError({'detail': 'Solicitação já foi aprovada.'})
    if request_update.status != 'PENDING_AGENCY_REVIEW':
        logger.warning(
            f"Tentativa inválida de aprovar a solicitação {request_update.id} pelo usuário {user.username}. Status atual: {request_update.status}"
        )
        raise PermissionDenied({'detail': 'Sem permissão para alterar o status.'})

    logger.info(
        f"Solicitação {request_update.id} aprovada com sucesso pelo usuário {user.username}."
    )
    
    return _transition_status(request_update, 'PENDING_CADASTRO', user)

@transaction.atomic
def handle_request_return_service(update_request, action, parecer, user):
    valid_actions = ['REPROVAR', 'SOLICITAR_AJUSTE_GN', 'SOLICITAR_AJUSTE_GA']

    if action not in valid_actions:
        logger.warning(
            f"Usuário {user.username} tentou executar uma ação inválida ('{action}') na solicitação {update_request.id}"
        )

        raise ValidationError({'detail': 'Ação inválida'})

    if not parecer:
        logger.warning(
            f"Usuário {user.username} tentou retornar a solicitação {update_request.id} com a ação '{action}' sem anexar o parecer obrigatório"
        )

        raise ValidationError({'detail': 'A inclusão do parecer é obrigatório'})

    status_map = {
        'REPROVAR': 'REJECTED',
        'SOLICITAR_AJUSTE_GN': 'NEEDS_ADJUSTMENT_GN',
        'SOLICITAR_AJUSTE_GA': 'NEEDS_ADJUSTMENT_GA',
    }
    new_status = status_map[action]
    previous_status = update_request.status

    update_request.status = new_status
    update_request.save()

    logger.info(
        f"Solicitação {update_request.id} processada com a ação '{action}' pelo usuário {user.username}. Status alterado de {previous_status} para {new_status}"
    )

    log_instance = generic_log_register_service(
        update_request=update_request,
        previous_status=previous_status,
        actual_status=new_status,
        user=user
    )
    
    DocumentosSolicitacao.objects.create(
        solicitacao=update_request,
        arquivo=parecer,
        log=log_instance
    )

    return update_request

@transaction.atomic
def adjust_request_service(update_request, new_data, validated_data, user):
    update_new_data_service(new_data, validated_data)

    previous_status = update_request.status
    new_status = 'PENDING_AGENCY_REVIEW'

    if previous_status != new_status:
        update_request.status = new_status
        update_request.save(update_fields=['status'])

        logger.info(
            f"Solicitação {update_request.id} foi ajustada e retornada para revisão da agência pelo usuário {user.username}"
        )

        generic_log_register_service(
            update_request=update_request,
            previous_status=previous_status,
            actual_status=new_status,
            user=user
        )

    return update_request

@transaction.atomic
def formalize_update_request_service(update_request, parecer, user):
    if not parecer:
        logger.warning(
            f"Usuário {user.username} tentou formalizar a solicitação {update_request.id} sem o documento de parecer"
        )

        raise ValidationError({'detail': 'O parecer é obrigatório'})

    if update_request.status == 'UPDATED':
        logger.warning(
            f"Tentativa de efetivar novamente uma solicitação já efetivada ({update_request.id}) pelo usuário {user.username}"
        )
        raise ValidationError({
            'detail': 'Solicitação já efetivada',
            'code': 'already_updated'
        })

    if update_request.status != 'PENDING_CADASTRO':
        logger.warning(
            f"Tentativa de formalizar solicitação {update_request.id} com status inválido ({update_request.status}) pelo usuário {user.username}"
        )
        raise ValidationError({'detail': 'A solicitação não está em análise.'})

    dados_novos = update_request.dados_novos.first()
    if not dados_novos:
        logger.error(
            f"Erro de integridade: Dados novos não encontrados para a solicitação {update_request.id} durante a tentativa de formalização por {user.username}"
        )
        raise ValidationError({'detail': 'Dados novos não encontrados na solicitação'})

    cliente = update_request.cliente

    if dados_novos.salario:
        cliente.salario = dados_novos.salario
    if dados_novos.residencia_endereco:
        cliente.endereco = dados_novos.residencia_endereco
    if dados_novos.residencia_cep:
        cliente.cep = dados_novos.residencia_cep

    for imovel_novo in dados_novos.imoveis.all():
        cliente.imoveis.create(
            endereco=imovel_novo.endereco,
            bairro=imovel_novo.bairro,
            cidade=imovel_novo.cidade,
            cep=imovel_novo.cep
        )

    for veiculo_novo in dados_novos.veiculos.all():
        cliente.veiculos.create(
            renavam=veiculo_novo.renavam,
            placa=veiculo_novo.placa,
            marca_modelo=veiculo_novo.marca_modelo,
            ano=veiculo_novo.ano
        )

    cliente.save()

    status_anterior = update_request.status
    update_request.status = 'UPDATED'
    update_request.save()

    logger.info(
        f"Solicitação {update_request.id} efetivada e dados do cliente atualizados com sucesso pelo usuário {user.username}"
    )

    log_instance = generic_log_register_service(
        update_request=update_request,
        previous_status=status_anterior,
        actual_status='UPDATED',
        user=user
    )

    DocumentosSolicitacao.objects.create(
        solicitacao=update_request,
        arquivo=parecer,
        log=log_instance
    )

    return update_request

def _transition_status(request_update, new_status, user):
    previous_status = request_update.status

    if previous_status == new_status:
        return request_update

    request_update.status = new_status
    request_update.save()

    generic_log_register_service(
        update_request=request_update,
        previous_status=previous_status,
        actual_status=new_status,
        user=user
    )

    return request_update
