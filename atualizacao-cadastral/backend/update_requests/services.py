from django.db import transaction
from rest_framework.exceptions import ValidationError, PermissionDenied
from audit.models import Log
from documents.models import RequestDocument
from .models import UpdateRequest, NewData, RequestProperty, RequestVehicle, OldData, PropertySnapshot, VehicleSnapshot
import logging

logger = logging.getLogger(__name__)

def generic_log_register_service(update_request, previous_status, current_status, user):
    return Log.objects.create(
        request=update_request,
        previous_status=previous_status,
        current_status=current_status,
        user=user
    )

@transaction.atomic
def create_update_request_service(validated_data, request, user):
    customer = validated_data.pop('customer')
    new_data_dict = validated_data.pop('new_data', {})
    validated_data.pop('documents', None)

    update_request = UpdateRequest.objects.create(
        customer=customer,
        created_by=user,
        status='PENDING_AGENCY_REVIEW',
        **validated_data
    )

    logger.info(
        f"New request {update_request.id} created by user {user.username}"
    )

    log_instance = generic_log_register_service(
        update_request=update_request,
        previous_status='SUBMITTING',
        current_status='PENDING_AGENCY_REVIEW',
        user=user
    )

    if request:
        create_request_documents_service(
            update_request=update_request, 
            request_files=request.FILES, 
            log_instance=log_instance
        )

    create_update_request_new_data_service(
        update_request=update_request, 
        validated_data=new_data_dict
    )
    create_request_snapshots_service(
        update_request=update_request, 
        customer=customer
    )

    return update_request

@transaction.atomic
def create_update_request_new_data_service(update_request, validated_data):
    new_data = NewData.objects.create(
        request=update_request,
        customer=update_request.customer,
        salary=validated_data.get('salary'),
        residence_address=validated_data.get('residence_address'),
        residence_zip_code=validated_data.get('residence_zip_code')
    )

    properties_data = validated_data.get('properties', [])
    for property_dict in properties_data:
        if any(property_dict.values()):
            RequestProperty.objects.create(
                new_data=new_data,
                **property_dict
            )

    vehicles_data = validated_data.get('vehicles', [])
    for vehicle_dict in vehicles_data:
        if any(vehicle_dict.values()):
            RequestVehicle.objects.create(
                new_data=new_data,
                **vehicle_dict
            )
            
    return new_data

@transaction.atomic
def create_request_snapshots_service(update_request, customer):
    properties_count = customer.properties.count()
    vehicles_count = customer.vehicles.count()

    old_data = OldData.objects.create(
        request=update_request,
        reference_customer=customer,
        salary_snapshot=customer.salary,
        address_snapshot=customer.address,
        zip_code_snapshot=customer.zip_code,
        has_properties_snapshot=properties_count > 0,
        has_vehicles_snapshot=vehicles_count > 0,
        properties_count_snapshot=properties_count,
        vehicles_count_snapshot=vehicles_count,
    )

    for property_obj in customer.properties.all():
        PropertySnapshot.objects.create(
            old_data=old_data,
            address=property_obj.address,
            neighborhood=property_obj.neighborhood,
            city=property_obj.city,
            zip_code=property_obj.zip_code,
        )

    for vehicle_obj in customer.vehicles.all():
        VehicleSnapshot.objects.create(
            old_data=old_data,
            renavam=vehicle_obj.renavam,
            license_plate=vehicle_obj.license_plate,
            brand_model=vehicle_obj.brand_model,
            year=vehicle_obj.year,
        )
    
    return old_data

@transaction.atomic
def create_request_documents_service(update_request, request_files, log_instance):
    if request_files:
        files = request_files.getlist('documents', [])
        for file_obj in files:
            RequestDocument.objects.create(
                request=update_request,
                log=log_instance,
                file=file_obj
            )

@transaction.atomic
def update_new_data_service(instance, validated_data):
    properties_data = validated_data.pop('properties', None)
    vehicles_data = validated_data.pop('vehicles', None)

    for attr, value in validated_data.items():
        setattr(instance, attr, value)

    instance.save()

    if properties_data is not None:
        for item_data in properties_data:
            item_id = item_data.pop('id', None)
            if item_id:
                RequestProperty.objects.filter(id=item_id, new_data=instance).update(**item_data)
            else:
                RequestProperty.objects.create(new_data=instance, **item_data)

    if vehicles_data is not None:
        for item_data in vehicles_data:
            item_id = item_data.pop('id', None)
            if item_id:
                RequestVehicle.objects.filter(id=item_id, new_data=instance).update(**item_data)
            else:
                RequestVehicle.objects.create(new_data=instance, **item_data)

    return instance

@transaction.atomic
def accept_request_service(update_request, user):
    if update_request.status == 'PENDING_REGISTRATION':
        logger.warning(
            f"Invalid attempt to approve request {update_request.id} by user {user.username}. Current status: {update_request.status}"
        )
        raise ValidationError({'detail': 'Request has already been approved.'})
    if update_request.status != 'PENDING_AGENCY_REVIEW':
        logger.warning(
            f"Invalid attempt to approve request {update_request.id} by user {user.username}. Current status: {update_request.status}"
        )
        raise PermissionDenied({'detail': 'No permission to change status.'})

    logger.info(
        f"Request {update_request.id} successfully approved by user {user.username}."
    )
    
    return _transition_status(update_request, 'PENDING_REGISTRATION', user)

@transaction.atomic
def handle_request_return_service(update_request, action, opinion, user):
    valid_actions = ['REJECT', 'REQUEST_ADJUSTMENT_GN', 'REQUEST_ADJUSTMENT_GA']

    if action not in valid_actions:
        logger.warning(
            f"User {user.username} tried to execute an invalid action ('{action}') on request {update_request.id}"
        )
        raise ValidationError({'detail': 'Invalid action'})

    if not opinion:
        logger.warning(
            f"User {user.username} tried to return request {update_request.id} with action '{action}' without attaching the mandatory opinion/review note"
        )
        raise ValidationError({'detail': 'Attaching an opinion is mandatory'})

    status_map = {
        'REJECT': 'REJECTED',
        'REQUEST_ADJUSTMENT_GN': 'NEEDS_ADJUSTMENT_GN',
        'REQUEST_ADJUSTMENT_GA': 'NEEDS_ADJUSTMENT_GA',
    }
    new_status = status_map[action]
    previous_status = update_request.status

    update_request.status = new_status
    update_request.save()

    logger.info(
        f"Request {update_request.id} processed with action '{action}' by user {user.username}. Status changed from {previous_status} to {new_status}"
    )

    log_instance = generic_log_register_service(
        update_request=update_request,
        previous_status=previous_status,
        current_status=new_status,
        user=user
    )
    
    RequestDocument.objects.create(
        request=update_request,
        file=opinion,
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
            f"Request {update_request.id} was adjusted and returned to agency review by user {user.username}"
        )

        generic_log_register_service(
            update_request=update_request,
            previous_status=previous_status,
            current_status=new_status,
            user=user
        )

    return update_request

@transaction.atomic
def formalize_update_request_service(update_request, opinion, user):
    if not opinion:
        logger.warning(
            f"User {user.username} tried to formalize request {update_request.id} without the opinion document"
        )
        raise ValidationError({'detail': 'The opinion document is mandatory'})

    if update_request.status == 'UPDATED':
        logger.warning(
            f"Attempt to re-finalize an already finalized request ({update_request.id}) by user {user.username}"
        )
        raise ValidationError({
            'detail': 'Request already finalized',
            'code': 'already_updated'
        })

    if update_request.status != 'PENDING_REGISTRATION':
        logger.warning(
            f"Attempt to formalize request {update_request.id} with invalid status ({update_request.status}) by user {user.username}"
        )
        raise ValidationError({'detail': 'Request is not under registration review.'})

    new_data = update_request.new_data.first()
    if not new_data:
        logger.error(
            f"Integrity error: New data not found for request {update_request.id} during formalization attempt by {user.username}"
        )
        raise ValidationError({'detail': 'New data not found in request'})

    customer = update_request.customer

    if new_data.salary:
        customer.salary = new_data.salary
    if new_data.residence_address:
        customer.address = new_data.residence_address
    if new_data.residence_zip_code:
        customer.cep = new_data.residence_zip_code

    for new_property in new_data.properties.all():
        customer.properties.create(
            address=new_property.address,
            neighborhood=new_property.neighborhood,
            city=new_property.city,
            zip_code=new_property.zip_code
        )

    for new_vehicle in new_data.vehicles.all():
        customer.vehicles.create(
            renavam=new_vehicle.renavam,
            license_plate=new_vehicle.license_plate,
            brand_model=new_vehicle.brand_model,
            year=new_vehicle.year
        )

    customer.save()

    previous_status = update_request.status
    update_request.status = 'UPDATED'
    update_request.save()

    logger.info(
        f"Request {update_request.id} finalized and customer data updated successfully by user {user.username}"
    )

    log_instance = generic_log_register_service(
        update_request=update_request,
        previous_status=previous_status,
        current_status='UPDATED',
        user=user
    )

    RequestDocument.objects.create(
        request=update_request,
        file=opinion,
        log=log_instance
    )

    return update_request

def _transition_status(update_request, new_status, user):
    previous_status = update_request.status

    if previous_status == new_status:
        return update_request

    update_request.status = new_status
    update_request.save()

    generic_log_register_service(
        update_request=update_request,
        previous_status=previous_status,
        current_status=new_status,
        user=user
    )

    return update_request
