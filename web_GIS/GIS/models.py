from django.contrib.auth.models import User
from django.db import models


class Layer(models.Model):
    layer_name = models.CharField(max_length=50)
    workspace = models.CharField(max_length=50)
    layer_alias = models.CharField(max_length=50)
    server_address = models.URLField()
    user_owner = models.ManyToManyField(User)

    def __str__(self):
        return f'{self.layer_alias} : {self.workspace} : {self.layer_name} : {self.server_address}'

