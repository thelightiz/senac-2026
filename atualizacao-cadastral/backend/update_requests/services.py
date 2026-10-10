from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Request, PreviousData, PropertySnapshot, VehicleSnapshot, ProposedData, ProposedProperty, ProposedVehicle
from documents.models import RequestDocument
from audit.models import AuditLog

def log_action(user, request_obj, action, previous_status, new_status, justification=None, ip=None, user_agent=None, payload=None):
    AuditLog.objects.create(
        user=user,
        request=request_obj,
        action=action,
        previous_status=previous_status,
        new_status=new_status,
        justification=justification,
        ip_address=ip,
        user_agent=user_agent,
        changes_payload=payload
    )

@transaction.atomic
def create_request_service(user, validated_data, ip=None, user_agent=None):
    update_request = Request.objects.create(
        created_by=user,
        customer=validated_data.get('customer'),
        has_salary_update=validated_data.get('has_salary_update'),
        has_address_update=validated_data.get('has_address_update'),
        has_property_update=validated_data.get('has_property_update'),
        has_vehicle_update=validated_data.get('has_vehicle_update'),
        status=Request.RequestStatus.PENDING_AGENCY_REVIEW
    )

    customer = validated_data.get('customer')
    previous_data = _create_previous_data_snapshot(request_obj=update_request, customer=customer)
    proposed_data = _create_proposed_data(request_obj=update_request, validated_data=validated_data, customer=customer)

    log_action(
        user=user,
        request_obj=update_request,
        action=AuditLog.ActionChoices.CREATE,
        previous_status=None,
        new_status=update_request.status,
        ip=ip,
        user_agent=user_agent
    )
    return update_request

@transaction.atomic
def _create_previous_data_snapshot(request_obj, customer):
    prop_count = customer.properties.count()
    veh_count = customer.vehicles.count()

    previous_data = PreviousData.objects.create(
        request=request_obj,
        reference_customer=customer,
        salary_snapshot=customer.salary,
        address_snapshot=customer.address,
        cep_snapshot=customer.cep,
        has_properties_snapshot=prop_count > 0,
        has_vehicles_snapshot=veh_count > 0,
        properties_count_snapshot=prop_count,
        vehicles_count_snapshot=veh_count
    )

    for property_obj in customer.properties.all():
        PropertySnapshot.objects.create(
            previous_data=previous_data,
            address=property_obj.address,
            neighborhood=property_obj.neighborhood,
            city=property_obj.city,
            cep=property_obj.cep
        )

    for vehicle_obj in customer.vehicles.all():
        VehicleSnapshot.objects.create(
            previous_data=previous_data,
            renavam=vehicle_obj.renavam,
            plate=vehicle_obj.plate,
            brand_model=vehicle_obj.brand_model,
            year=vehicle_obj.year
        )

    return previous_data

@transaction.atomic
def _create_proposed_data(request_obj, validated_data, customer):
    proposed_data = ProposedData.objects.create(
        request=request_obj,
        customer=customer,
        salary=validated_data.get('salary'),
        residence_address=request_obj.get('residence_address'),
        residence_cep=request_obj.get('residence_cep')
    )

    properties = validated_data.get('properties', [])
    vehicles = validated_data.get('vehicles')

    for property_data in properties:
        ProposedProperty.objects.create(
            proposed_data=proposed_data,
            address=property_data.get('address'),
            neighborhood=property_data.get('neighborhood'),
            city=property_data.get('city'),
            cep=property_data.get('cep')
        )

    for vehicle_data in vehicles:
        ProposedVehicle.objects.create(
            proposed_data=proposed_data,
            renavam=vehicle_data.get('renavam'),
            plate=vehicle_data.get('plate'),
            brand_model=vehicle_data.get('brand_model'),
            year=vehicle_data.get('year')
        )

    return proposed_data

@transaction.atomic
def ga_accept_request_service(request_obj, user, ip=None, user_agent=None):
    previous_status = request_obj.status
    request_obj.status = Request.RequestStatus.PENDING_REGISTRATION
    request_obj.save(update_fields=['status'])

    log_action(
        user=user,
        request_obj=request_obj,
        action=AuditLog.ActionChoices.APPROVE,
        previous_status=previous_status,
        new_status=request_obj.status,
        ip=ip,
        user_agent=user_agent
    )
    return request_obj

@transaction.atomic
def handle_request_return_service(request_obj, action_type, parecer_file, user, ip=None, user_agent=None):
    previous_status = request_obj.status
    
    RequestDocument.objects.create(
        request=request_obj,
        category=RequestDocument.DocumentCategory.REVIEW,
        document_type=RequestDocument.DocumentType.JUSTIFICATION,
        display_name="Parecer de Retorno",
        file=parecer_file
    )

    if action_type == 'REPROVAR':
        new_status = Request.RequestStatus.REJECTED
        audit_action = AuditLog.ActionChoices.REJECT
    elif action_type == 'SOLICITAR_AJUSTE_GN':
        new_status = Request.RequestStatus.NEEDS_ADJUSTMENT_GN
        audit_action = AuditLog.ActionChoices.REQUEST_ADJUSTMENT
    else:
        new_status = Request.RequestStatus.NEEDS_ADJUSTMENT_GA
        audit_action = AuditLog.ActionChoices.REQUEST_ADJUSTMENT

    request_obj.status = new_status
    request_obj.save(update_fields=['status'])

    log_action(
        user=user,
        request_obj=request_obj,
        action=audit_action,
        previous_status=previous_status,
        new_status=new_status,
        justification="Parecer anexado via documento",
        ip=ip,
        user_agent=user_agent
    )
    return request_obj

@transaction.atomic
def finalize_request_service(request_obj, parecer_file, user, ip=None, user_agent=None):
    previous_status = request_obj.status
    customer = request_obj.customer
    proposed_data = request_obj.proposed_data.first()

    if proposed_data:
        if proposed_data.salary is not None:
            customer.salary = proposed_data.salary
        if proposed_data.residence_address:
            customer.address = proposed_data.residence_address
        if proposed_data.residence_cep:
            customer.cep = proposed_data.residence_cep
        customer.save()

        for property in proposed_data.properties.all():
            customer.properties.create(address=property.address, neighborhood=property.neighborhood, city=property.city, cep=property.cep)
        for vehicle in proposed_data.vehicles.all():
            customer.vehicles.create(renavam=vehicle.renavam, plate=vehicle.plate, brand_model=vehicle.brand_model, year=vehicle.year)

    RequestDocument.objects.create(
        request=request_obj,
        category=RequestDocument.DocumentCategory.REVIEW,
        document_type=RequestDocument.DocumentType.APPROVAL_NOTE,
        display_name="Termo de Efetivação",
        file=parecer_file
    )

    request_obj.status = Request.RequestStatus.UPDATED
    request_obj.save(update_fields=['status'])

    log_action(
        user=user,
        request_obj=request_obj,
        action=AuditLog.ActionChoices.EFFECT,
        previous_status=previous_status,
        new_status=request_obj.status,
        ip=ip,
        user_agent=user_agent
    )
    return request_obj
