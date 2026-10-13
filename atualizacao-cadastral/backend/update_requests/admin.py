from django.contrib import admin
from .models import UpdateRequest, OldData, NewData, RequestProperty, RequestVehicle, PropertySnapshot, VehicleSnapshot

admin.site.register(UpdateRequest)
admin.site.register(NewData)
admin.site.register(OldData)
admin.site.register(RequestProperty)
admin.site.register(RequestVehicle)
admin.site.register(PropertySnapshot)
admin.site.register(VehicleSnapshot)
