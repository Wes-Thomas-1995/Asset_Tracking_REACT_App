
from django.apps import AppConfig

scheduler_started = False  # Global flag

class ApiOhlcConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'API_OHLC'
    
    def ready(self):
        global scheduler_started
        if not scheduler_started:
            scheduler_started = True
            from .jobs import START_SCHEDULER
            START_SCHEDULER()