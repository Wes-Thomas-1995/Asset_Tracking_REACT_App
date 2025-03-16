# DRF__API/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('API/', include('API_CONNECTIONS.urls')),  # Include your app’s URL configuration
    path('API_OHLC/', include('API_OHLC.urls')),  # Include your app’s URL configuration
]