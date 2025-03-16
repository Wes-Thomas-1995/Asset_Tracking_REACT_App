
import pandas as pd
import numpy as np
import os


from API_CONNECTIONS.models import (ALGO_BALANCE,
                                    COMMITMENT,
                                    TRADE_HISTORY_FILE,
                                    USER_INFORMATION,
                                    ACCOUNT_LINKS, 
                                    DEVELOPMENT_STRATEGY_DB)

from API_CONNECTIONS.serializers import (ALGO_BALANCE_SERALIZER,
                                        COMMITMENT_SERIALIZER,
                                        TRADE_HISTORY_FILE_SERIALIZER,
                                        USER_INFORMATION_SERIALIZER,
                                        DATAFRAME_SERIALIZER,
                                        ACCOUNT_LINKS_SERALIZER,
                                        DEVELOPMENT_STRATEGY_DB_SERALIZER,)

from API_CONNECTIONS.Functions import (PORTFOLIO_OVERVIEW)
from API_CONNECTIONS.TESTING_ZONE import (MAIN_EXTRACT_CLASS_NAMES, MAIN_PROCESS_STRATEGIES)


CACHED_ALGO_BALANCE             = None
CACHED_ACCOUNT_LINKS            = None
CACHED_TRADE_HISTORY_FILE       = None
CACHED_USER_INFORMATION         = None
CACHED_COMMITMENT               = None
CACHED_TIMESERIES_DF            = None
CACHED_TABLE_DF                 = None
CACHED_ALLOCATION_TABLE_DF      = None
CACHED_DONUT_CHART              = None
CACHED_KPI                      = None
ACCOUNT_DF                      = None
CACHED_STRATEGIES               = None
DEVELOPMENT_STRATEGY_DF         = None
CACHED_DEV_STRATEGIES           = None
BASE_PATH                       = r"/Users/westhomas/Desktop/ENKI/"
HOLDING_PATH                    = r"/Users/westhomas/Desktop/WEB_APP/DRF__API/API_OHLC/___STRATEGIES.py"
ENKI_TRADING_STRATEGIES_PATH    = os.path.join(BASE_PATH, "ENKI_TRADING_STRATEGIES")
CACHED_COINS                    = ['BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'DOGEUSDT', 'SOLUSDT', 'ADAUSDT', 'AVAXUSDT']






def GET_DATA_CACHE():
    global CACHED_ACCOUNT_LINKS
    global CACHED_KPI
    global CACHED_ALGO_BALANCE
    global CACHED_TRADE_HISTORY_FILE
    global CACHED_COMMITMENT
    global CACHED_USER_INFORMATION
    global CACHED_TIMESERIES_DF    
    global CACHED_STRATEGIES    
    global CACHED_TABLE_DF          
    global CACHED_ALLOCATION_TABLE_DF 
    global CACHED_DONUT_CHART  
    global ACCOUNT_DF    
    global DEVELOPMENT_STRATEGY_DF
    global CACHED_DEV_STRATEGIES

    MAIN_PROCESS_STRATEGIES(HOLDING_PATH, ENKI_TRADING_STRATEGIES_PATH)
    COMBINED_OUTPUT                     = MAIN_EXTRACT_CLASS_NAMES(HOLDING_PATH)
    CACHED_STRATEGIES                   = COMBINED_OUTPUT.DF
    ALGO_BALANCE_DATA                   = ALGO_BALANCE.objects.all()
    TRADE_HISTORY_FILE_DATA             = TRADE_HISTORY_FILE.objects.all()
    COMMITMENT_DATA                     = COMMITMENT.objects.all()
    USER_INFORMATION_DATA               = USER_INFORMATION.objects.all()
    USER_INFORMATION_DATA               = USER_INFORMATION.objects.all()
    ACCOUNT_LINK                        = ACCOUNT_LINKS.objects.all()
    DEVELOPMENT_STRATEGY_DF_DB          = DEVELOPMENT_STRATEGY_DB.objects.all()

    CACHED_ALGO_BALANCE                 = ALGO_BALANCE_SERALIZER(ALGO_BALANCE_DATA, many=True).data
    CACHED_TRADE_HISTORY_FILE           = TRADE_HISTORY_FILE_SERIALIZER(TRADE_HISTORY_FILE_DATA, many=True).data
    CACHED_USER_INFORMATION             = USER_INFORMATION_SERIALIZER(USER_INFORMATION_DATA, many=True).data
    CACHED_COMMITMENT                   = COMMITMENT_SERIALIZER(COMMITMENT_DATA, many=True).data
    CACHED_ACCOUNT_LINKS                = ACCOUNT_LINKS_SERALIZER(ACCOUNT_LINK, many=True).data
    CACHED_DEV_STRATEGIES               = DEVELOPMENT_STRATEGY_DB_SERALIZER(DEVELOPMENT_STRATEGY_DF_DB, many=True).data

    ALGO_BALANCE_DF                     = pd.DataFrame(CACHED_ALGO_BALANCE)
    TRADE_DF                            = pd.DataFrame(CACHED_TRADE_HISTORY_FILE)
    COMMITMENT_DF                       = pd.DataFrame(CACHED_COMMITMENT)
    ACCOUNT_DF                          = pd.DataFrame(CACHED_ACCOUNT_LINKS)
    DEVELOPMENT_STRATEGY_DF             = pd.DataFrame(CACHED_DEV_STRATEGIES)

    ALGO_BALANCE_DF['DATE']             = pd.to_datetime(ALGO_BALANCE_DF['DATE'])
    COMMITMENT_DF['DATE']               = pd.to_datetime(COMMITMENT_DF['DATE'])
    TRADE_DF['TRADE_DATE']              = pd.to_datetime(TRADE_DF['TRADE_DATE'])

    FUNCTIONS                           = PORTFOLIO_OVERVIEW(ALGO_BALANCE_DF, TRADE_DF, COMMITMENT_DF)
    CACHED_TIMESERIES_DF                = DATAFRAME_SERIALIZER(FUNCTIONS.TIMESERIES_DF).data
    CACHED_TABLE_DF                     = DATAFRAME_SERIALIZER(FUNCTIONS.TABLE_DF).data
    CACHED_ALLOCATION_TABLE_DF          = DATAFRAME_SERIALIZER(FUNCTIONS.ALLOCATION_TABLE_DF).data
    CACHED_DONUT_CHART                  = DATAFRAME_SERIALIZER(FUNCTIONS.DONUT_CHART).data
    CACHED_KPI                          = DATAFRAME_SERIALIZER(FUNCTIONS.KPI).data





