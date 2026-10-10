from django.contrib import admin
from .models import Customer, Property, Vehicle

admin.site.register(Customer)
admin.site.register(Property)
admin.site.register(Vehicle)