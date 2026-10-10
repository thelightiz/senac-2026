from django.contrib import admin
from .models import Request, PreviousData, PropertySnapshot, VehicleSnapshot, ProposedData, ProposedProperty, ProposedVehicle

admin.site.register(Request)
admin.site.register(PreviousData)
admin.site.register(PropertySnapshot)
admin.site.register(VehicleSnapshot)
admin.site.register(ProposedData)
admin.site.register(ProposedProperty)
admin.site.register(ProposedVehicle)
