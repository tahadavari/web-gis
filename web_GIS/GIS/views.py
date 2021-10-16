from django.contrib.auth import logout, authenticate, login
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.shortcuts import render



def login_user(request):
    if request.method=='GET':
        if request.user.is_authenticated:
            pass
        else:
            return render(request, 'authentication/login.html')
    elif request.method=='POST':
        user_info = request.POST
        user = authenticate(request, username=user_info['username'], password=user_info['password'])
        if user:
            login(request,user)
            return HttpResponse("login done")
        else:
            return render(request, 'authentication/login.html')





def register_user(request):
    if request.method == 'POST':
        if request.user.is_authenticated:
            pass
        else:
            user_info = request.POST
            User.objects.create_user(username=user_info['phone'], email=user_info['email'],
                                     password=user_info['password'], first_name=user_info['first_name'],
                                     last_name=user_info['last_name'])
            return render(request, 'authentication/login.html')
    elif request.method == 'GET':
        return render(request, 'authentication/register.html')


def logout_user(request):
    logout(request)
    return render(request, 'authentication/login.html')
