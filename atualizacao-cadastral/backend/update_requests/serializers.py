from .services import create_update_request_service, update_new_data_service
from rest_framework import serializers
from .models import UpdateRequest, OldData, NewData, PropertySnapshot, VehicleSnapshot, RequestVehicle, RequestProperty
from documents.models import RequestDocument
from customers.models import Customer
import json


class RequestPropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestProperty
        fields = ['id', 'address', 'neighborhood', 'city', 'zip_code']
        extra_kwargs = {
            'address': {'allow_null': True, 'allow_blank': True, 'required': False},
            'neighborhood': {'allow_null': True, 'allow_blank': True, 'required': False},
            'city': {'allow_null': True, 'allow_blank': True, 'required': False},
            'zip_code': {'allow_null': True, 'allow_blank': True, 'required': False},
        }


class RequestVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestVehicle
        fields = ['id', 'renavam', 'license_plate', 'brand_model', 'year']
        extra_kwargs = {
            'renavam': {'allow_null': True, 'allow_blank': True, 'required': False},
            'license_plate': {'allow_null': True, 'allow_blank': True, 'required': False},
            'brand_model': {'allow_null': True, 'allow_blank': True, 'required': False},
            'year': {'allow_null': True, 'allow_blank': True, 'required': False},
        }


class RequestNewDataSerializer(serializers.ModelSerializer):
    properties = RequestPropertySerializer(many=True, required=False)
    vehicles = RequestVehicleSerializer(many=True, required=False)

    class Meta:
        model = NewData
        fields = ['salary', 'residence_address', 'residence_zip_code', 'properties', 'vehicles']


class PostRequestSerializer(serializers.ModelSerializer):
    customer = serializers.SlugRelatedField(
        slug_field='cpf',
        queryset=Customer.objects.all()
    )
    new_data = RequestNewDataSerializer()

    documents = serializers.ListField(
        child=serializers.FileField(),
        required=False,
        write_only=True
    )

    created_by = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )

    class Meta:
        model = UpdateRequest
        fields = [
            'id', 'created_by', 'customer', 'update_type', 'status',
            'documents', 'new_data',
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

        new_data_raw = data.get('new_data')
        if isinstance(new_data_raw, str):
            try:
                data['new_data'] = json.loads(new_data_raw)
            except (ValueError, TypeError, json.JSONDecodeError):
                raise serializers.ValidationError({
                    'new_data': 'A string enviada não é um JSON válido.'
                })

        return super().to_internal_value(data)

    def create(self, validated_data):
        user = validated_data.pop('created_by', None)
        request = self.context.get('request')
        
        return create_update_request_service(
            validated_data=validated_data,
            request=request,
            user=user
        )


class GetRequestsSerializer(serializers.ModelSerializer):
    customer = serializers.StringRelatedField() 
    status = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = UpdateRequest
        fields = ['id', 'created_by', 'customer', 'update_type', 'status', 'documents']


class RequestDocumentSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = RequestDocument
        fields = '__all__'

    def get_url(self, obj):
        request = self.context.get('request')
        relative_url = f'/api/documents/{obj.id}/view/'

        if request:
            return request.build_absolute_uri(relative_url)

        return relative_url


class PropertySnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertySnapshot
        fields = '__all__'


class VehicleSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleSnapshot
        fields = '__all__'


class RequestOldDataSerializer(serializers.ModelSerializer):
    property_snapshots = PropertySnapshotSerializer(many=True, read_only=True)
    vehicle_snapshots = VehicleSnapshotSerializer(many=True, read_only=True)

    class Meta:
        model = OldData
        fields = '__all__'


class GetRequestNewDataSerializer(serializers.ModelSerializer):
    properties = RequestPropertySerializer(many=True, read_only=True)
    vehicles = RequestVehicleSerializer(many=True, read_only=True)

    class Meta:
        model = NewData
        fields = ['salary', 'residence_address', 'residence_zip_code', 'properties', 'vehicles']


class GetRequestInfoSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()
    customer = serializers.StringRelatedField()
    cpf = serializers.CharField(source='customer.cpf', read_only=True)
    status = serializers.CharField(source='get_status_display', read_only=True)
    old_data = RequestOldDataSerializer(many=True, read_only=True)
    new_data = GetRequestNewDataSerializer(many=True, read_only=True)
    documents = RequestDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = UpdateRequest
        fields = '__all__'


class PatchRequestPropertySerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = RequestProperty
        fields = ['id', 'address', 'neighborhood', 'city', 'zip_code']
        extra_kwargs = {
            'address': {'allow_null': True, 'allow_blank': True, 'required': False},
            'neighborhood': {'allow_null': True, 'allow_blank': True, 'required': False},
            'city': {'allow_null': True, 'allow_blank': True, 'required': False},
            'zip_code': {'allow_null': True, 'allow_blank': True, 'required': False},
        }


class PatchRequestVehicleSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = RequestVehicle
        fields = ['id', 'renavam', 'license_plate', 'brand_model', 'year']
        extra_kwargs = {
            'renavam': {'allow_null': True, 'allow_blank': True, 'required': False},
            'license_plate': {'allow_null': True, 'allow_blank': True, 'required': False},
            'brand_model': {'allow_null': True, 'allow_blank': True, 'required': False},
            'year': {'allow_null': True, 'allow_blank': True, 'required': False},
        }


class GNAdjustRequestSerializer(serializers.ModelSerializer):
    properties = PatchRequestPropertySerializer(many=True, required=False)
    vehicles = PatchRequestVehicleSerializer(many=True, required=False)
    
    class Meta:
        model = NewData
        fields = ['id', 'salary', 'residence_address', 'residence_zip_code', 'properties', 'vehicles']

    def update(self, instance, validated_data):
        return update_new_data_service(instance, validated_data)
