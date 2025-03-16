# DRF__API/manage.py

import os
import sys
from django.db import connections

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DRF__API.settings')
    try:
        from django.core.management import execute_from_command_line
        execute_from_command_line(sys.argv)
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc


    # Start the scheduler only when running the server
    if 'runserver' in sys.argv:
        from API_CONNECTIONS.jobs import START_SCHEDULER
        START_SCHEDULER()



if __name__ == '__main__':
    main()






