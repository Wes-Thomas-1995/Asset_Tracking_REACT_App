
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from urllib.parse import unquote
import pandas as pd
import numpy as np
import json
import os

from .tasks import (CACHED_COINS,CACHED_COIN_TA_DATA, CACHED_COIN_DATA, TIME_FRAMES, TIME_ZONES, CACHED_COIN_TA_DATA_DF, CACHED_INDICATORS)
from .tests import HISTORICAL_DATA, DATA_PROCESS, BACKTEST_LOOP_DETAILED_REVIEW, TECHNICAL_ANALYSIS
from .___BACKTEST import (BACKTEST, DEVELOPMENT_STRATEGY_BUILDER)
from .serializers import (DATAFRAME_SERIALIZER)
from .___STRATEGIES import (STRATEGY_1)






@api_view(['GET'])
def COINS_CONNECTION(request):
    global CACHED_COINS
    return Response(CACHED_COINS)




@api_view(['GET'])
def INDICATORS_CONNECTION(request):
    global CACHED_INDICATORS
    return Response(CACHED_INDICATORS)


@api_view(['GET'])
def TIME_ZONE_CONNECTION(request):
    global TIME_ZONES
    return Response(TIME_ZONES)

@api_view(['GET'])
def TIME_FRAME_CONNECTION(request):
    global TIME_FRAMES
    return Response(TIME_FRAMES)



@api_view(['GET'])
def OHLC_CONNECTION(request, COIN, TIMEFRAME):
    global CACHED_COIN_DATA
    global CACHED_COINS

    DATA_DF         = CACHED_COIN_DATA[CACHED_COINS.index(COIN)][TIME_FRAMES.index(TIMEFRAME)]
    return Response(DATA_DF)


@api_view(['GET'])
def TA_CONNECTION(request, COIN, TIMEFRAME):
    global CACHED_COIN_TA_DATA
    global CACHED_COINS

    DATA_DF         = CACHED_COIN_TA_DATA[CACHED_COINS.index(COIN)][TIME_FRAMES.index(TIMEFRAME)]
    return Response(DATA_DF)




class BACKTEST_CONNECTION_ALT(APIView):
    def post(self, request, *args, **kwargs):
        global CACHED_COIN_TA_DATA
        global CACHED_COINS
        global TIME_FRAMES

        try:
            body                        = request.data  # DRF automatically parses JSON
            coin                        = body.get('coin')
            timeframe                   = body.get('timeframe')
            strategy_type               = body.get('strategyType')
            leverage                    = body.get('leverage')
            portfolio_usage             = body.get('portfolioUsage')
            starting_balance            = body.get('startingBalance')
            code                        = body.get('code')
            decoded_code                = unquote(code)

            DATA_LIST                   = []
            LEVERAGE                    = float(leverage)
            STARTING_BALANCE            = float(starting_balance)
            PERCENTAGE_USED             = float(portfolio_usage) if float(portfolio_usage) <= 1 else float(portfolio_usage) / 100
            DATA_DF                     = CACHED_COIN_TA_DATA_DF[CACHED_COINS.index(coin)]

            for DF in DATA_DF:          DATA_LIST.append(DF.copy())

            if strategy_type == '1':    STRAT_DATA = STRATEGY_1(DATA_LIST[TIME_FRAMES.index(timeframe)])
            elif strategy_type == '99': STRAT_DATA = DEVELOPMENT_STRATEGY_BUILDER(DATA_LIST[TIME_FRAMES.index(timeframe)], decoded_code)
            
            DATA_LIST[TIME_FRAMES.index(timeframe)] = STRAT_DATA.DF.copy()
            BACKTEST_DATA = BACKTEST(DATA_LIST, timeframe, LEVERAGE, PERCENTAGE_USED, STARTING_BALANCE)
            return Response(BACKTEST_DATA.API_DATA, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)





    

    




















