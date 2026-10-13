from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.core.files.uploadedfile import SimpleUploadedFile
from customers.models import Customer
from .models import UpdateRequest, NewData
from .services import (
    create_update_request_service,
    accept_request_service,
    handle_request_return_service,
    formalize_update_request_service
)

User = get_user_model()

class RoleBasedWorkflowTestCase(TestCase):
    def setUp(self):
        self.user_gn = User.objects.create_user(username='business_manager', password='123', role='GN')
        self.user_ga = User.objects.create_user(username='agency_manager', password='123', role='GA')
        self.user_cad = User.objects.create_user(username='registration_team', password='123', role='CADASTRO')
        
        self.customer = Customer.objects.create(
            name='Test Customer',
            cpf='11122233344',
            salary=4000.00,
            address='Old Street, 10',
            zip_code='12345678'
        )

    def test_gn_can_create_request(self):
        validated_data = {
            'customer': self.customer,
            'new_data': {
                'salary': 5000.00,
                'residence_address': 'New Street, 20',
                'residence_zip_code': '87654321',
                'properties': [],
                'vehicles': []
            }
        }
        
        request_obj = create_update_request_service(
            validated_data=validated_data,
            request=None,
            user=self.user_gn
        )
        
        self.assertEqual(request_obj.status, 'PENDING_AGENCY_REVIEW')
        self.assertEqual(request_obj.created_by, self.user_gn)

    def test_ga_can_approve_request(self):
        request_obj = UpdateRequest.objects.create(
            customer=self.customer,
            created_by=self.user_gn,
            status='PENDING_AGENCY_REVIEW'
        )

        updated_request = accept_request_service(request_obj, self.user_ga)
        self.assertEqual(updated_request.status, 'PENDING_REGISTRATION')

    def test_ga_can_request_adjustment_with_opinion(self):
        request_obj = UpdateRequest.objects.create(
            customer=self.customer,
            created_by=self.user_gn,
            status='PENDING_AGENCY_REVIEW'
        )
        opinion = SimpleUploadedFile("opinion.pdf", b"content", content_type="application/pdf")

        returned_request = handle_request_return_service(
            update_request=request_obj,
            action='REQUEST_ADJUSTMENT_GN',
            opinion=opinion,
            user=self.user_ga
        )
        
        self.assertEqual(returned_request.status, 'NEEDS_ADJUSTMENT_GN')

    def test_cad_can_formalize_request(self):
        request_obj = UpdateRequest.objects.create(
            customer=self.customer,
            created_by=self.user_gn,
            status='PENDING_REGISTRATION'
        )
        NewData.objects.create(
            request=request_obj,
            customer=self.customer,
            salary=6000.00,
            residence_address='Finalized Street, 99',
            residence_zip_code='99999999'
        )
        opinion = SimpleUploadedFile("opinion.pdf", b"content", content_type="application/pdf")

        formalized_request = formalize_update_request_service(
            update_request=request_obj,
            opinion=opinion,
            user=self.user_cad
        )
        
        self.assertEqual(formalized_request.status, 'UPDATED')
        
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.salary, 6000.00)
        self.assertEqual(self.customer.address, 'Finalized Street, 99')

    def test_unauthorized_role_action_raises_permission_error(self):
        request_obj = UpdateRequest.objects.create(
            customer=self.customer,
            created_by=self.user_gn,
            status='REJECTED'
        )

        with self.assertRaises(PermissionDenied):
            accept_request_service(request_obj, self.user_ga)
