# Generated by Django 3.2.7 on 2021-10-16 12:33

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Layer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('layer_name', models.CharField(max_length=50)),
                ('workspace', models.CharField(max_length=50)),
                ('layer_alias', models.CharField(max_length=50)),
                ('server_address', models.URLField()),
                ('user_owner', models.ManyToManyField(to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
