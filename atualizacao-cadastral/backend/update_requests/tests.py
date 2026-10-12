from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.core.files.uploadedfile import SimpleUploadedFile
from customers.models import Cliente
from .models import Solicitacao, DadosNovos
from .services import create_update_request_service, accept_request_service, handle_request_return_service, formalize_update_request_service, adjust_request_service

User = get_user_model()

ItemPermissionTestCase = None 

class RoleBasedWorkflowTestCase(TestCase):
    def setUp(self):
        self.user_gn = User.objects.create_user(username='gerente_de_negócios', password='123', role='GN')
        self.user_ga = User.objects.create_user(username='gerente_de_agência', password='123', role='GA')
        self.user_cad = User.objects.create_user(username='time_de_cadastro', password='123', role='CAD')
        
        self.cliente = Cliente.objects.create(
            nome='Cliente Teste',
            cpf='11122233344',
            salario=4000.00,
            endereco='Rua Antiga, 10',
            cep='12345678'
        )

    def test_gn_can_create_request(self):
        validated_data = {
            'cliente': self.cliente,
            'dados_novos': {
                'salario': 5000.00,
                'residencia_endereco': 'Rua Nova, 20',
                'residencia_cep': '87654321',
                'imoveis': [],
                'veiculos': []
            }
        }
        
        request_obj = create_update_request_service(
            validated_data=validated_data,
            request=None,
            user=self.user_gn
        )
        
        self.assertEqual(request_obj.status, 'PENDING_AGENCY_REVIEW')
        self.assertEqual(request_obj.criado_por, self.user_gn)

    def test_ga_can_approve_request(self):
        solicitacao = Solicitacao.objects.create(
            cliente=self.cliente,
            criado_por=self.user_gn,
            status='PENDING_AGENCY_REVIEW'
        )

        updated_request = accept_request_service(solicitacao, self.user_ga)
        self.assertEqual(updated_request.status, 'PENDING_CADASTRO')

    def test_ga_can_request_adjustment_with_parecer(self):
        solicitacao = Solicitacao.objects.create(
            cliente=self.cliente,
            criado_por=self.user_gn,
            status='PENDING_AGENCY_REVIEW'
        )
        parecer = SimpleUploadedFile("parecer.pdf", b"conteudo", content_type="application/pdf")

        returned_request = handle_request_return_service(
            update_request=solicitacao,
            action='SOLICITAR_AJUSTE_GN',
            parecer=parecer,
            user=self.user_ga
        )
        
        self.assertEqual(returned_request.status, 'NEEDS_ADJUSTMENT_GN')

    def test_cad_can_formalize_request(self):
        solicitacao = Solicitacao.objects.create(
            cliente=self.cliente,
            criado_por=self.user_gn,
            status='PENDING_CADASTRO'
        )
        DadosNovos.objects.create(
            solicitacao=solicitacao,
            cliente=self.cliente,
            salario=6000.00,
            residencia_endereco='Rua Efetivada, 99',
            residencia_cep='99999999'
        )
        parecer = SimpleUploadedFile("parecer.pdf", b"conteudo", content_type="application/pdf")

        formalized_request = formalize_update_request_service(
            update_request=solicitacao,
            parecer=parecer,
            user=self.user_cad
        )
        
        self.assertEqual(formalized_request.status, 'UPDATED')
        
        self.cliente.refresh_from_db()
        self.assertEqual(self.cliente.salario, 6000.00)
        self.assertEqual(self.cliente.endereco, 'Rua Efetivada, 99')

    def test_unauthorized_role_action_raises_permission_error(self):
        solicitacao = Solicitacao.objects.create(
            cliente=self.cliente,
            criado_por=self.user_gn,
            status='REJECTED'
        )

        with self.assertRaises(PermissionDenied):
            accept_request_service(solicitacao, self.user_ga)