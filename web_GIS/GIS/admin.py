from django.contrib import admin

# Register your models here.
from GIS.models import Layer

admin.site.register([Layer])
