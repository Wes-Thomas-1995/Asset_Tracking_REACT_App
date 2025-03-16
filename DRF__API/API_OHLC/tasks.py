
import pandas as pd
import numpy as np
import os


from API_OHLC.serializers import (DATAFRAME_SERIALIZER)
from API_OHLC.tests import (HISTORICAL_DATA, DATA_PROCESS, TECHNICAL_ANALYSIS)


CACHED_COIN_DATA            = []
CACHED_COIN_TA_DATA         = []
CACHED_COIN_DATA_DF         = []
CACHED_COIN_TA_DATA_DF      = []
CACHED_INDICATORS           = None
CACHED_COINS                = ['BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'DOGEUSDT', 'SOLUSDT', 'ADAUSDT', 'AVAXUSDT']
TIME_FRAMES                 = ['2H', '4H', '12H', '1D']
TIME_ZONES                  = ['APAC', 'USA', 'EUROPE']







def GET_DATA_CACHE():
    global CACHED_COIN_DATA  
    global CACHED_COIN_TA_DATA
    global CACHED_COIN_DATA_DF  
    global CACHED_COIN_TA_DATA_DF
    global CACHED_INDICATORS

    TEMP_LIST, TEMP_LIST_TA                 = [], []
    TEMP_DF_LIST, TEMP_DF_LIST_TA           = [], []
    
    for a in range(len(CACHED_COINS)):
        TEMP_TF, TEMP_TA_TF                 = [], []
        TEMP_DF_TF, TEMP_DF_TA_TF           = [], []
        DATA                                = HISTORICAL_DATA(CACHED_COINS[a], '2h', 250)

        for b in range(len(TIME_FRAMES)):
            DATA_TEMP       = DATA_PROCESS(DATA.DF, TIME_FRAMES[b], 'NA')
            DATA_OUTPUT_TF  = DATAFRAME_SERIALIZER(DATA_TEMP.DF.copy()).data
            DATA_FIN        = TECHNICAL_ANALYSIS(DATA_TEMP.DF)
            DATA_OUTPUT     = DATAFRAME_SERIALIZER(DATA_FIN.DF.copy()).data

            CACHED_INDICATORS = DATA_FIN.INDICATOR_OUTPUT

            TEMP_TF.append(DATA_OUTPUT_TF)
            TEMP_TA_TF.append(DATA_OUTPUT)

            TEMP_DF_TF.append(DATA_TEMP.DF.copy())
            TEMP_DF_TA_TF.append(DATA_FIN.DF.copy())

        TEMP_LIST.append(TEMP_TF)
        TEMP_LIST_TA.append(TEMP_TA_TF)

        TEMP_DF_LIST.append(TEMP_DF_TF)
        TEMP_DF_LIST_TA.append(TEMP_DF_TA_TF)


    CACHED_COIN_DATA = TEMP_LIST
    CACHED_COIN_TA_DATA = TEMP_LIST_TA

    CACHED_COIN_DATA_DF = TEMP_DF_LIST
    CACHED_COIN_TA_DATA_DF = TEMP_DF_LIST_TA 
