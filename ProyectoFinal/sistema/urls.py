from django.conf.urls import url
from django.urls import path
from . import views
 
urlpatterns = [
  
    path('dashboard', views.dashboard, name='dashboard'),
    path('logout', views.logout, name='logout'),
    path('services/svc_inventario', views.svc_inventario, name='svc_inventario'),
    path('services/svc_datos', views.svc_datos, name='svc_datos'),
]