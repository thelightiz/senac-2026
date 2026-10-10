from rest_framework import serializers
from .models import Request, PreviousData, ProposedData, PropertySnapshot, VehicleSnapshot, ProposedProperty, ProposedVehicle
from documents.models import RequestDocument
from customers.models import Customer
import json

class PostRequestPropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProposedProperty
        fields = ['id', 'address', 'neighborhood', 'city', 'cep']
        extra_kwargs = {
            'address': {'allow_null': True, 'allow_blank': True, 'required': False},
            'neighborhood': {'allow_null': True, 'allow_blank': True, 'required': False},
            'city': {'allow_null': True, 'allow_blank': True, 'required': False},
            'cep': {'allow_null': True, 'allow_blank': True, 'required': False},
        }

class PostRequestVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProposedVehicle
        fields = ['id', 'renavam', 'plate', 'brand_model', 'year']
        extra_kwargs = {
            'renavam': {'allow_null': True, 'allow_blank': True, 'required': False},
            'plate': {'allow_null': True, 'allow_blank': True, 'required': False},
            'brand_model': {'allow_null': True, 'allow_blank': True, 'required': False},
            'year': {'allow_null': True, 'allow_blank': True, 'required': False},
        }

class PostRequestProposedDataSerializer(serializers.ModelSerializer):
    properties = PostRequestPropertySerializer(many=True, required=False)
    vehicles = PostRequestVehicleSerializer(many=True, required=False)

    class Meta:
        model = ProposedData
        fields = ['salary', 'residence_address', 'residence_cep', 'properties', 'vehicles']

class PostRequestSerializer(serializers.ModelSerializer):
    customer = serializers.SlugRelatedField(
        slug_field='cpf',
        queryset=Customer.objects.all()
    )
    proposed_data = PostRequestProposedDataSerializer()

    documents = serializers.ListField(
        child=serializers.FileField(),
        required=False,
        write_only=True
    )

    created_by = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )

    class Meta:
        model = Request
        fields = [
            'id', 'created_by', 'customer', 'status',
            'documents', 'proposed_data',
            'has_salary_update', 'has_address_update',
            'has_property_update', 'has_vehicle_update'
        ]

    def to_internal_value(self, data):
        if hasattr(data, 'getlist'):
            data_dict = {}
            for key in data.keys():
                if key == 'documents':
                    data_dict[key] = data.getlist(key)
                else:
                    data_dict[key] = data.get(key)
            data = data_dict
        elif hasattr(data, 'copy'):
            data = data.copy()

        proposed_data_raw = data.get('proposed_data')
        if isinstance(proposed_data_raw, str):
            try:
                data['proposed_data'] = json.loads(proposed_data_raw)
            except (ValueError, TypeError, json.JSONDecodeError):
                raise serializers.ValidationError({
                    'proposed_data': 'The submitted string is not a valid JSON.'
                })

        return super().to_internal_value(data)

class GetRequestsSerializer(serializers.ModelSerializer):
    customer = serializers.StringRelatedField() 
    status = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Request
        fields = ['id', 'created_by', 'customer', 'status', 'documents']

class GetRequestDocumentsSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = RequestDocument
        fields = '__all__'

    def get_url(self, obj):
        request = self.context.get('request')
        relative_url = f'/api/documents/{obj.id}/view'

        if request:
            return request.build_absolute_uri(relative_url)

        return relative_url

class GetPropertySnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertySnapshot
        fields = '__all__'

class GetVehicleSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleSnapshot
        fields = '__all__'

class GetRequestPreviousDataSerializer(serializers.ModelSerializer):
    properties_snapshot = GetPropertySnapshotSerializer(many=True, read_only=True)
    vehicles_snapshot = GetVehicleSnapshotSerializer(many=True, read_only=True)

    class Meta:
        model = PreviousData
        fields = '__all__'

class GetRequestProposedDataSerializer(serializers.ModelSerializer):
    properties = PostRequestPropertySerializer(many=True, read_only=True)
    vehicles = PostRequestVehicleSerializer(many=True, read_only=True)

    class Meta:
        model = ProposedData
        fields = ['salary', 'residence_address', 'residence_cep', 'properties', 'vehicles']

class GetRequestInfoSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()
    customer = serializers.StringRelatedField()
    cpf = serializers.CharField(source='customer.cpf', read_only=True)
    status = serializers.CharField(source='get_status_display', read_only=True)
    previous_data = GetRequestPreviousDataSerializer(many=True, read_only=True)
    proposed_data = GetRequestProposedDataSerializer(many=True, read_only=True)
    documents = GetRequestDocumentsSerializer(many=True, read_only=True)

    class Meta:
        model = Request
        fields = '__all__'

class PatchRequestPropertySerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = ProposedProperty
        fields = ['id', 'address', 'neighborhood', 'city', 'cep']
        extra_kwargs = {
            'address': {'allow_null': True, 'allow_blank': True, 'required': False},
            'neighborhood': {'allow_null': True, 'allow_blank': True, 'required': False},
            'city': {'allow_null': True, 'allow_blank': True, 'required': False},
            'cep': {'allow_null': True, 'allow_blank': True, 'required': False},
        }

class PatchRequestVehicleSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = ProposedVehicle
        fields = ['id', 'renavam', 'plate', 'brand_model', 'year']
        extra_kwargs = {
            'renavam': {'allow_null': True, 'allow_blank': True, 'required': False},
            'plate': {'allow_null': True, 'allow_blank': True, 'required': False},
            'brand_model': {'allow_null': True, 'allow_blank': True, 'required': False},
            'year': {'allow_null': True, 'allow_blank': True, 'required': False},
        }

    def validate_plate(self, value):
        if value:
            return value.strip().upper()
        return value

class GNAdjustRequestSerializer(serializers.ModelSerializer):
    properties = PatchRequestPropertySerializer(many=True, required=False)
    vehicles = PatchRequestVehicleSerializer(many=True, required=False)
    
    class Meta:
        model = ProposedData
        fields = ['id', 'salary', 'residence_address', 'residence_cep', 'properties', 'vehicles']

    def update(self, instance, validated_data):
        properties_data = validated_data.pop('properties', None)
        vehicles_data = validated_data.pop('vehicles', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if properties_data is not None:
            self._update_or_create_nested(
                instance=instance,
                data_list=properties_data,
                model_class=ProposedProperty,
                related_field_name='proposed_data'
            )

        if vehicles_data is not None:
            self._update_or_create_nested(
                instance=instance,
                data_list=vehicles_data,
                model_class=ProposedVehicle,
                related_field_name='proposed_data'
            )

        return instance

    def _update_or_create_nested(self, instance, data_list, model_class, related_field_name):
        for item_data in data_list:
            item_id = item_data.pop('id', None)
            
            item_data[related_field_name] = instance

            if item_id:
                model_class.objects.filter(id=item_id, **{related_field_name: instance}).update(**item_data)
            else:
                model_class.objects.create(**item_data)
