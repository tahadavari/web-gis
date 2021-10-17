from django.contrib import admin

# Register your models here.
from GIS.models import Layer, Drawing

admin.site.register([Layer])
admin.site.register([Drawing])
