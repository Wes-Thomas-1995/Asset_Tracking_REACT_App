# reports/jobs.py

import logging
from apscheduler.schedulers.background import BackgroundScheduler
from .tasks import (
    GET_DATA_CACHE,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def START_SCHEDULER():

    SCHEDULER = BackgroundScheduler()

    GET_DATA_CACHE()
    SCHEDULER.add_job(GET_DATA_CACHE, 'interval', hours=12)

    SCHEDULER.start()