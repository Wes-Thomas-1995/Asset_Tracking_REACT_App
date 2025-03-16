from django.urls import path
from . import views

urlpatterns = [

    path('_BACKTEST_OHLC_/', views.BACKTEST_CONNECTION_ALT.as_view(), name='_BACKTEST_OHLC_'), 
    path('_TA_OHLC_/<str:COIN>/<str:TIMEFRAME>/', views.TA_CONNECTION, name='_TA_OHLC_'),
    path('_OHLC_/<str:COIN>/<str:TIMEFRAME>/', views.OHLC_CONNECTION, name='_OHLC_'),  
    path('TIME_FRAME/', views.TIME_FRAME_CONNECTION, name='COINS'),
    path('TIME_ZONE/', views.TIME_ZONE_CONNECTION, name='COINS'),
    path('COINS/', views.COINS_CONNECTION, name='COINS'),
    path('INDICATORS/', views.INDICATORS_CONNECTION, name='INDICATORS'),


]




#    path('_OHLC_/<str:COIN>/<str:TIMEFRAME>/', views.OHLC_CONNECTION, name='_OHLC_'),  
#    path('_TA_OHLC_/<str:COIN>/<str:TIMEFRAME>/', views.TA_CONNECTION, name='_TA_OHLC_'),
#    path('_STRATEGY_/<str:COIN>/<str:METHOD>/', views.STRATEGY_CONNECTION, name='_STRATEGYG'),
#    path('_STRATEGY_CHOICE_/', views.STRATEGY_CHOICE_CONNECTION, name='_STRATEGY_CHOICE'),
#    path('_STRATEGY_COIN_CHOICE_/<str:METHOD>/', views.STRATEGY_COIN_CHOICE_CONNECTION, name='_STRATEGY_COIN_CHOICE'),







