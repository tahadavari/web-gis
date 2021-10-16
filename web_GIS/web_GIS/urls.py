"""web_GIS URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from GIS.views import logout_user, login_user, register_user, landing, getwms, identify

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', landing, name='landing'),
    path('login/', login_user, name='login'),
    path('register/', register_user, name='register'),
    path('logout/', logout_user, name='logout'),
    path('getwms/', getwms, name='get_wms'),
    path('identify/', identify,name='identify'),
    # path('search/', search,name='search'),
    # path('getdrawings/', getDrawings, name='getdrawings'),
    # path('synctodb/', syncToDatabase, name='synctodb'),
    # path('exportshp/', exportSHP, name='exportshp'),
]
