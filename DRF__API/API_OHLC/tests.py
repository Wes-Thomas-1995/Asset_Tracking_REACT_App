from django.test import TestCase
from binance.client import Client

from datetime import datetime, timedelta, date
import pandas as pd
import numpy as np
import itertools
import warnings
import ta
import os

warnings.filterwarnings("ignore")






class HISTORICAL_DATA():
    def __init__(self, TICKER, INTERVAL, PERIOD):
        self.TICKER     = TICKER
        self.INTERVAL   = INTERVAL
        self.PERIOD     = PERIOD
        self.DF         = self.get_data()

    def get_data(self):
        MASTER_API_KEY          = os.getenv("MASTER_API_KEY")
        MASTER_API_SEC          = os.getenv("MASTER_API_SEC")
        client                  = Client(MASTER_API_KEY, MASTER_API_SEC)

        END                     = (datetime.now() + timedelta(days = 1)).date()
        START                   = END - timedelta(days = self.PERIOD)
        intervals               = { '1m' : client.KLINE_INTERVAL_1MINUTE,
                                    '5m' : client.KLINE_INTERVAL_5MINUTE,
                                    '15m': client.KLINE_INTERVAL_15MINUTE,
                                    '30m': client.KLINE_INTERVAL_30MINUTE,
                                    '1h' : client.KLINE_INTERVAL_1HOUR,
                                    '2h' : client.KLINE_INTERVAL_2HOUR,
                                    '4h' : client.KLINE_INTERVAL_4HOUR,
                                    '6h' : client.KLINE_INTERVAL_6HOUR,
                                    '8h' : client.KLINE_INTERVAL_8HOUR,
                                    '12h': client.KLINE_INTERVAL_12HOUR,
                                    '1d' : client.KLINE_INTERVAL_1DAY,
                                    '3d' : client.KLINE_INTERVAL_3DAY,
                                    '1w' : client.KLINE_INTERVAL_1WEEK,
                                    '1M' : client.KLINE_INTERVAL_1MONTH}

        candle                  = np.asarray(client.get_historical_klines(self.TICKER, intervals.get(self.INTERVAL), str(START), str(END)))
        candle                  = candle[:, :6]
        candle                  = pd.DataFrame(candle, columns=['datetime', 'open', 'high', 'low', 'close', 'volume']).astype(float).rename(columns={'datetime':'DATE', 'open':'OPEN', 'high':'HIGH', 'low':'LOW', 'close':'CLOSE', 'volume':'VOLUME'})
        candle.DATE             = pd.to_datetime(candle.DATE, unit='ms')
        candle['DATE']          = candle['DATE'] + pd.to_timedelta(4, unit='h')
        return candle
    






class DATA_PROCESS():
    def __init__(self, DF, UPPER_DF, TIMEZONE):
        self.DF                                 = DF
        self.UPPER_DF                           = UPPER_DF
        self.TIMEZONE                           = TIMEZONE
        self.DF                                 = self.DATA_PROCESS()

    def DATA_PROCESS(self):
        OHLC_DICT                                                                   = {'OPEN' : 'first',   'HIGH' : 'max',  'LOW' : 'min',  'CLOSE' : 'last',  'VOLUME' : 'sum'}
        self.DF                                                                     = self.DF.set_index('DATE')
        self.DF                                                                     = self.DF.resample(self.UPPER_DF).agg(OHLC_DICT)
        COLS                                                                        = ['OPEN', 'HIGH', 'LOW', 'CLOSE', 'VOLUME']
        for q in range(len(COLS)):              self.DF[COLS[q]]                    = pd.to_numeric(self.DF[COLS[q]])
        self.DF                                                                     = self.DF.reset_index()
        return self.DF
    








class TECHNICAL_ANALYSIS:
    def __init__(self, DF):
        self.DF = DF
        self.DF, self.INDICATOR_OUTPUT = self.TECHNICAL_ANALYSIS()

    def TECHNICAL_ANALYSIS(self):
        TA_PARAMS_WIDER_SCOPE                       = { 'EMA_NBRS': [4, 8, 12, 18, 24, 36, 50, 100, 200],
                                                        'SMA_NBRS': [4, 8, 12, 18, 24, 36, 50, 100, 200],
                                                        'RSI': [14, 20, 30],
                                                        'ATR_PERIOD': [10],
                                                        'ATR_MULTIPLIER': [0.35]}

        allIndicators                               = { 'EMA'                   : [f'EMA_{x}' for x in TA_PARAMS_WIDER_SCOPE['EMA_NBRS']],
                                                        'SMA'                   : [f'SMA_{x}' for x in TA_PARAMS_WIDER_SCOPE['SMA_NBRS']],
                                                        'RSI'                   : [f'RSI_{x}' for x in TA_PARAMS_WIDER_SCOPE['RSI']],
                                                        'ADX'                   : ['ADX_NEG', 'ADX_POS'],  
                                                        'MACD'                  : ['MACD', 'MACD_SIGNAL', 'MACD_DIFF'],              
                                                        'STOCHASTIC_OSCILLATOR' : ['%K', '%D'],                                                    
                                                        'BOLLINGER_BANDS'       : ['BB_UPPER', 'BB_MIDDLE', 'BB_LOWER'],  
                                                        'PARABOLIC_SAR'         : ['PSAR'],
                                                        'ATR'                   : [f'ATR_{x[0]}_{x[1]}' for x in itertools.product(TA_PARAMS_WIDER_SCOPE['ATR_PERIOD'], TA_PARAMS_WIDER_SCOPE['ATR_MULTIPLIER'])],
                                                        'MISC_SEPERATE'         : ['CCI', 'WILLIAMS_%R', 'TSI', 'MFI', 'ROC'],
                                                        'MISC_OVERLAY'          : ['VWAP']}

        indicatorMap                                = { "OVERLAY"               : ["EMA", "SMA", "BOLLINGER_BANDS", 'MISC_OVERLAY'],
                                                        "SEPARATE"              : ["RSI", "STOCHASTIC_OSCILLATOR", "MACD", "ADX", "MISC_SEPERATE"],
                                                        "PRICE"                 : ["PARABOLIC_SAR", "ATR"],}

        INDICATOR_OUTPUT                            = {'allIndicators' : allIndicators, 'indicatorMap' : indicatorMap}
        for k in TA_PARAMS_WIDER_SCOPE['EMA_NBRS']: self.DF[f'EMA_{k}'] = self.DF['CLOSE'].ewm(span=k, adjust=False).mean()
        for k in TA_PARAMS_WIDER_SCOPE['SMA_NBRS']: self.DF[f'SMA_{k}'] = self.DF['CLOSE'].rolling(window=k).mean()
        for k in TA_PARAMS_WIDER_SCOPE['RSI']:      self.DF[f'RSI_{k}'] = ta.momentum.RSIIndicator(self.DF['CLOSE'], window=k).rsi()
        ATR_OPTIONS                                 = list(itertools.product(TA_PARAMS_WIDER_SCOPE['ATR_PERIOD'], TA_PARAMS_WIDER_SCOPE['ATR_MULTIPLIER']))
        for period, multiplier in ATR_OPTIONS:      self.DF[f'ATR_{period}_{multiplier}'] = (ta.volatility.AverageTrueRange(high=self.DF['HIGH'], low=self.DF['LOW'], close=self.DF['CLOSE'], window=period).average_true_range() * multiplier).fillna(0)

        macd                                        = ta.trend.MACD(self.DF['CLOSE'])
        self.DF['MACD']                             = macd.macd()
        self.DF['MACD_SIGNAL']                      = macd.macd_signal()
        self.DF['MACD_DIFF']                        = macd.macd_diff()

        bollinger                                   = ta.volatility.BollingerBands(self.DF['CLOSE'], window=20, window_dev=2)
        self.DF['BB_UPPER']                         = bollinger.bollinger_hband()
        self.DF['BB_MIDDLE']                        = bollinger.bollinger_mavg()
        self.DF['BB_LOWER']                         = bollinger.bollinger_lband()
        self.DF['BB_WIDTH']                         = self.DF['BB_UPPER'] - self.DF['BB_LOWER']

        self.DF['VWAP']                             = (self.DF['VOLUME'] * (self.DF['HIGH'] + self.DF['LOW'] + self.DF['CLOSE']) / 3).cumsum() / self.DF['VOLUME'].cumsum()
        self.DF['CCI']                              = ta.trend.CCIIndicator(high=self.DF['HIGH'], low=self.DF['LOW'], close=self.DF['CLOSE'], window=20).cci()
        self.DF['WILLIAMS_%R']                      = ta.momentum.WilliamsRIndicator(high=self.DF['HIGH'], low=self.DF['LOW'], close=self.DF['CLOSE'], lbp=14).williams_r()
        adx                                         = ta.trend.ADXIndicator(high=self.DF['HIGH'], low=self.DF['LOW'], close=self.DF['CLOSE'], window=14)
        self.DF['ADX']                              = adx.adx()
        self.DF['ADX_NEG']                          = adx.adx_neg()
        self.DF['ADX_POS']                          = adx.adx_pos()
        self.DF['PSAR']                             = ta.trend.PSARIndicator(high=self.DF['HIGH'], low=self.DF['LOW'], close=self.DF['CLOSE']).psar()
        self.DF['TSI']                              = ta.momentum.TSIIndicator(self.DF['CLOSE']).tsi()
        self.DF['MFI']                              = ta.volume.MFIIndicator(high=self.DF['HIGH'], low=self.DF['LOW'], close=self.DF['CLOSE'], volume=self.DF['VOLUME'], window=14).money_flow_index()
        self.DF['ROC']                              = ta.momentum.ROCIndicator(self.DF['CLOSE'], window=12).roc()
        STOCH                                       = ta.momentum.StochasticOscillator(self.DF['HIGH'], self.DF['LOW'], self.DF['CLOSE'])
        self.DF['%K']                               = (STOCH.stoch())
        self.DF['%D']                               = (STOCH.stoch_signal())


        self.DF['PREV_GAIN_UP']                     = ((self.DF['HIGH'] / self.DF['OPEN']) - 1).shift(1)
        self.DF['PREV_GAIN_DOWN']                   = ((self.DF['OPEN'] / self.DF['LOW']) - 1).shift(1)
        self.DF                                     = self.DF.iloc[200:, :].reset_index(drop=True)

        return self.DF, INDICATOR_OUTPUT







class BACKTEST_LOOP_DETAILED_REVIEW():
    def __init__(self, INPUT_DF_MAIN, INPUT_DF_LOWER, PARAMETER):
        self.INPUT_DF_MAIN                  = INPUT_DF_MAIN
        self.INPUT_DF_LOWER                 = INPUT_DF_LOWER
        self.PARAMETER                      = PARAMETER
        self.DF                             = self.BACKTEST_LOOP_DETAILED_REVIEW()


    def BACKTEST_LOOP_DETAILED_REVIEW(self):

        DATA_LOWER                                                              = self.INPUT_DF_LOWER.copy()
        DATA_LOWER['STR_TIMEZONE']                                              = (DATA_LOWER['DATE'].dt.date).astype("string") + ' ' + (DATA_LOWER['DATE'].dt.time).astype("string")
        DATA_MAIN                                                               = self.INPUT_DF_MAIN[['STR_TIMEZONE', 'SIGNAL', 'TP', 'SL']]
        DATA_MAIN['SIGNAL']                                                     = np.where(((DATA_MAIN['TP'] != 0)), DATA_MAIN['SIGNAL'], 'STATIC')
        FINAL_DF                                                                = DATA_LOWER.merge(DATA_MAIN, how = 'left', on = ['STR_TIMEZONE'])
        FINAL_DF['SIGNAL']                                                      = FINAL_DF['SIGNAL'].fillna('STATIC')
        FINAL_DF['SIGNAL']                                                      = np.where(((FINAL_DF['TP'] != 0)), FINAL_DF['SIGNAL'], 'STATIC')
        FINAL_DF['OPEN_TRD']                                                    = np.where((FINAL_DF['SIGNAL'] != "STATIC"), FINAL_DF['OPEN'], 0)
        FINAL_DF['STATUS'], FINAL_DF['COMPLETED_INDEX'], FINAL_DF['DRAWDOWN']   = '', '', 0



        if self.PARAMETER == 1:
            for i in range(len(FINAL_DF)):
                if FINAL_DF.at[i, 'SIGNAL'] != "STATIC":
                    if FINAL_DF.at[i, 'SIGNAL'] == "UP":

                        MAX_D = 0
                        for AA in range(i, len(FINAL_DF)):
                            if round((((FINAL_DF.at[i, 'OPEN_TRD'] - FINAL_DF.at[AA, 'LOW']) / FINAL_DF.at[i, 'OPEN_TRD']) * 100),2) > MAX_D : 
                                MAX_D = round((((FINAL_DF.at[i, 'OPEN_TRD'] - FINAL_DF.at[AA, 'LOW']) / FINAL_DF.at[i, 'OPEN_TRD']) * 100),2)

                            if FINAL_DF.at[i, 'TP'] <= FINAL_DF.at[AA, 'HIGH']:
                                FINAL_DF.at[i, 'STATUS'] = "SUCCESS"
                                FINAL_DF.at[i, 'COMPLETED_INDEX'] = FINAL_DF.at[AA, 'DATE']
                                break

                            elif FINAL_DF.at[i, 'SL'] >= FINAL_DF.at[AA, 'LOW']:
                                FINAL_DF.at[i, 'STATUS'] = "FAILURE"
                                FINAL_DF.at[i, 'COMPLETED_INDEX'] = FINAL_DF.at[AA, 'DATE']
                                break

                            elif AA == len(FINAL_DF) - 1:
                                FINAL_DF.at[i, 'STATUS'] = "FAILURE"
                                FINAL_DF.at[i, 'COMPLETED_INDEX'] = FINAL_DF.at[AA, 'DATE']
                                break
                        
                        FINAL_DF.at[i, 'DRAWDOWN'] = MAX_D

                    elif FINAL_DF.at[i, 'SIGNAL'] == "DOWN":

                        MAX_D = 0
                        for AA in range(i, len(FINAL_DF)):
                            if round((((FINAL_DF.at[AA, 'HIGH'] - FINAL_DF.at[i, 'OPEN_TRD']) / FINAL_DF.at[i, 'OPEN_TRD']) * 100),2) > MAX_D : 
                                MAX_D = round((((FINAL_DF.at[AA, 'HIGH'] - FINAL_DF.at[i, 'OPEN_TRD']) / FINAL_DF.at[i, 'OPEN_TRD']) * 100),2)

                            if FINAL_DF.at[i, 'TP'] >= FINAL_DF.at[AA, 'LOW']:
                                FINAL_DF.at[i, 'STATUS'] = "SUCCESS"
                                FINAL_DF.at[i, 'COMPLETED_INDEX'] = FINAL_DF.at[AA, 'DATE']
                                break

                            elif FINAL_DF.at[i, 'SL'] <= FINAL_DF.at[AA, 'HIGH']:
                                FINAL_DF.at[i, 'STATUS'] = "FAILURE"
                                FINAL_DF.at[i, 'COMPLETED_INDEX'] = FINAL_DF.at[AA, 'DATE']
                                break

                            elif AA == len(FINAL_DF) - 1:
                                FINAL_DF.at[i, 'STATUS'] = "FAILURE"
                                FINAL_DF.at[i, 'COMPLETED_INDEX'] = FINAL_DF.at[AA, 'DATE']
                                break

                        FINAL_DF.at[i, 'DRAWDOWN'] = MAX_D



        REVIEW_DF                                   = FINAL_DF[FINAL_DF['SIGNAL']!="STATIC"]
        REVIEW_DF['COMPLETED_INDEX']                = pd.to_datetime(REVIEW_DF['COMPLETED_INDEX'])

        try:    REVIEW_DF['TIME_IN_TRADE']          = (REVIEW_DF['COMPLETED_INDEX'] - REVIEW_DF['DATE']).dt.total_seconds() / 1800
        except: REVIEW_DF['TIME_IN_TRADE']          = 0

        FINAL_DF                                    = (FINAL_DF[FINAL_DF['SIGNAL']!='STATIC'].reset_index().iloc[:,1:])
        FINAL_DF['SIGNAL']                          = np.where(FINAL_DF['SIGNAL']== "UP", "LONG", np.where(FINAL_DF['SIGNAL']== "DOWN", "SHORT", "STATIC"))
        FINAL_DF                                    = FINAL_DF[['DATE','OPEN','HIGH','LOW','CLOSE','VOLUME', 'SIGNAL','STATUS','TP','SL','COMPLETED_INDEX','DRAWDOWN']]

        return FINAL_DF
    






