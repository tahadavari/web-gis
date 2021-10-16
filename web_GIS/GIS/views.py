from django.contrib.auth import logout, authenticate, login
from django.contrib.auth.models import User
from django.core import serializers
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

from GIS.models import Layer


def landing(request):
    return render(request, 'index.html')


def login_user(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            return HttpResponse('Home')
        else:
            return render(request, 'authentication/login.html')
    elif request.method == 'POST':
        user_info = request.POST
        user = authenticate(request, username=user_info['username'], password=user_info['password'])
        if user:
            login(request, user)
            return HttpResponse("login done")
        else:
            return render(request, 'authentication/login.html')


def register_user(request):
    if request.method == 'POST':
        user_info = request.POST
        User.objects.create_user(username=user_info['phone'], email=user_info['email'],
                                 password=user_info['password'], first_name=user_info['first_name'],
                                 last_name=user_info['last_name'])
        return render(request, 'authentication/login.html')
    elif request.method == 'GET':
        if request.user.is_authenticated:
            return HttpResponse('Home')
        else:
            return render(request, 'authentication/register.html')


def logout_user(request):
    logout(request)
    return render(request, 'authentication/login.html')


def get_wms(request):
    if request.user.is_authenticated:
        user_layers = Layer.objects.filter(user_owner=request.user)
        response = serializers.serialize('json',user_layers)
    else:
        response = ''
    return HttpResponse(response)
