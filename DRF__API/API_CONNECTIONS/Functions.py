


import os
import ta
import time
import warnings
import itertools
import numpy as np
import pandas as pd
from binance.client import Client
from datetime import datetime, timedelta, date

warnings.filterwarnings("ignore")






class COMMITMENT_TIMESERIES():

    def __init__(self, DF):
        self.DF                             = DF
        self.DF                             = self.COMMITMENT_TIMESERIES()

    def COMMITMENT_TIMESERIES(self):

        self.DF['DATE']                     = pd.to_datetime(self.DF['DATE']).dt.date
        self.DF['QTY']                      = pd.to_numeric(self.DF['QTY'])
        TRANSACTIONS                        = []

        for _, ROW in self.DF.iterrows():
            SENDING_ID                      = ROW['SENDING_ID']
            RECEIVED_ID                     = ROW['RECEIVED_ID']
            QTY                             = ROW['QTY']
            DATE_                           = ROW['DATE']

            TRANSACTIONS.append({'DATE': DATE_, 'ID': SENDING_ID, 'COMMITMENT_DELTA': -QTY})
            TRANSACTIONS.append({'DATE': DATE_, 'ID': RECEIVED_ID, 'COMMITMENT_DELTA': QTY})

        TRANSACTION_DF                      = pd.DataFrame(TRANSACTIONS)
        DAILY_CHANGES                       = TRANSACTION_DF.groupby(['DATE', 'ID'], as_index=False)['COMMITMENT_DELTA'].sum()
        DAILY_CHANGES['COMMITMENT_BALANCE'] = DAILY_CHANGES.groupby('ID')['COMMITMENT_DELTA'].cumsum()
        ALL_IDS                             = DAILY_CHANGES['ID'].unique()
        ALL_DATES                           = pd.date_range(start=min(DAILY_CHANGES['DATE']), end=date.today()).date
        FULL_INDEX                          = pd.MultiIndex.from_product([ALL_DATES, ALL_IDS], names=['DATE', 'ID'])
        FULL_DF                             = pd.DataFrame(index=FULL_INDEX).reset_index()
        FULL_BALANCES                       = pd.merge(FULL_DF, DAILY_CHANGES, on=['DATE', 'ID'], how='left')
        FULL_BALANCES['COMMITMENT_DELTA']   = FULL_BALANCES['COMMITMENT_DELTA'].fillna(0)
        FULL_BALANCES['COMMITMENT_BALANCE'] = FULL_BALANCES.groupby('ID')['COMMITMENT_BALANCE'].ffill().fillna(0)
        FINAL_DAILY_BALANCES                = FULL_BALANCES.groupby(['DATE', 'ID'], as_index=False).last()
        FINAL_DAILY_BALANCES                = FINAL_DAILY_BALANCES.sort_values(by=['DATE', 'ID']).reset_index(drop=True)
        FINAL_DAILY_BALANCES                = FINAL_DAILY_BALANCES[FINAL_DAILY_BALANCES['ID'] != 'Cash_Deposit'].reset_index(drop=True)
        return FINAL_DAILY_BALANCES







class PORTFOLIO_OVERVIEW():

    def __init__(self, ALGO_BALANCE_DF, TRADE_DF, COMMITMENT_DF):
        self.ALGO_BALANCE_DF            = ALGO_BALANCE_DF
        self.TRADE_DF                   = TRADE_DF
        self.COMMITMENT_DF              = COMMITMENT_DF
        self.TIMESERIES_DF, self.STRATEGIES, self.TABLE_DF, self.ALLOCATION_TABLE_DF, self.DONUT_CHART, self.KPI = self.PORTFOLIO_OVERVIEW()


    def PORTFOLIO_OVERVIEW(self):

        COMMITTED                                   = COMMITMENT_TIMESERIES(self.COMMITMENT_DF)
        self.ALGO_BALANCE_DF['DATE']                = self.ALGO_BALANCE_DF['DATE'].dt.date
        COMMITTED.DF['KEY']                         = COMMITTED.DF['DATE'].astype(str) + ' - ' + COMMITTED.DF['ID']
        self.ALGO_BALANCE_DF['KEY']                 = self.ALGO_BALANCE_DF['DATE'].astype(str) + ' - ' + self.ALGO_BALANCE_DF['ALGO']
        COMMITTED.DF                                = COMMITTED.DF[['KEY', 'COMMITMENT_DELTA', 'COMMITMENT_BALANCE']]
        OUTPUT                                      = pd.merge(self.ALGO_BALANCE_DF, COMMITTED.DF, on="KEY", how="inner")
        OUTPUT                                      = (OUTPUT.sort_values(by=['DATE', 'ALGO'])).reset_index().iloc[:,1:]

        OUTPUT.rename(columns={"BALANCE": "PORTFOLIO_BALANCE"}, inplace=True)
        del OUTPUT['KEY']
        
        self.TRADE_DF["ALGO"]                       = self.TRADE_DF["ALGO"].str.replace("_", " ")
        OUTPUT["ALGO"]                              = OUTPUT["ALGO"].str.replace("_", " ")
        STRATEGIES                                  = OUTPUT['ALGO'].unique().tolist()
        STRATEGIES.insert(0, 'All Portfolios')

        self.TRADE_DF['KEY']                        = self.TRADE_DF['TRADE_NBR'].astype(str) + ' - ' + self.TRADE_DF['ALGO']       
        FIELDS                                      = ['COMMISSION', 'QTY', 'REALIZED_PNL', 'USDT_VALUE']
        for FIELD in FIELDS: self.TRADE_DF[FIELD]   = self.TRADE_DF[FIELD].astype(float)
        TABLE_DF                                    = self.TRADE_DF.groupby('KEY').agg({'TRADE_DATE'        : ['min', 'max'],                       # Entry and Exit Date
                                                                                        'SIDE'              : 'first',                              # First instance for direction
                                                                                        'SYMBOL'            : 'first',                              # First instance of symbol
                                                                                        'COMMISSION'        : 'sum',                                # Sum of commissions
                                                                                        'QTY'               : 'first',                              # Sum of quantity
                                                                                        'USDT_VALUE'        : 'first',                              # First instance of USDT value
                                                                                        'REALIZED_PNL'      : 'sum',                                # Sum of realized PnL
                                                                                        'COMMISSION_ASSET'  : 'first',
                                                                                        'ALGO'              : 'first',                              # First instance of algo
                                                                                        'TRADE_NBR'         : 'first',                              # First instance of trade number
                                                                                        'DRAWDOWN'          : 'first'}).reset_index()               # First instance of drawdown


        TABLE_DF.columns                        = ['KEY', 'ENTRY_DATE', 'EXIT_DATE', 'DIRECTION', 'SYMBOL', 'COMMISSION', 'QTY', 'USDT_VALUE', 'REALIZED_PNL', 'COMMISSION_ASSET', 'ALGO', 'TRADE_NBR', 'DRAWDOWN']
        TABLE_DF['STATUS']                      = TABLE_DF['REALIZED_PNL'].apply(lambda x: 'SUCCESS' if x >= 0 else 'FAILURE')
        TABLE_DF['LEVERAGE']                    = 5
        TABLE_DF['EQUITY']                      = TABLE_DF['USDT_VALUE'] / TABLE_DF['LEVERAGE']
        TABLE_DF['SIDE']                        = TABLE_DF['DIRECTION']
        TABLE_DF['DIRECTION']                   = np.where(TABLE_DF['SIDE'] == "BUY", 'LONG', 'SHORT')
        TABLE_DF['DRAWDOWN']                    = TABLE_DF['DRAWDOWN'] * -1

        MAX_DATE                                = OUTPUT['DATE'].max()
        DONUT_CHART                             = OUTPUT[OUTPUT['DATE']==MAX_DATE].reset_index().iloc[:,1:]
        DONUT_CHART['PORTFOLIO_BALANCE']        = DONUT_CHART['PORTFOLIO_BALANCE'].astype(float)

        ALLOCATION_TABLE_DF                     = DONUT_CHART.copy()
        SUM_FINAL                               = ALLOCATION_TABLE_DF['PORTFOLIO_BALANCE'].sum()

        ALLOCATION_TABLE_DF['REL_SHARE']        = ALLOCATION_TABLE_DF['PORTFOLIO_BALANCE'] / SUM_FINAL
        START_B, START_D, TRD_NBR, WINRATE, AVG_DRAWDOWN               = [], [], [], [], []

        for a in range(len(ALLOCATION_TABLE_DF)):
            ALGO_DONUT                          = ALLOCATION_TABLE_DF.at[a, 'ALGO']
            START_DATE                          = ((OUTPUT[OUTPUT['ALGO']==ALGO_DONUT].reset_index()).at[0, 'DATE'])
            START_BALANCE                       = float((OUTPUT[OUTPUT['ALGO']==ALGO_DONUT].reset_index()).at[0, 'PORTFOLIO_BALANCE'])
            TRADE_NBR                           = (TABLE_DF[TABLE_DF['ALGO']==ALGO_DONUT])['TRADE_NBR'].max()
            WIN_RATE_SINGLE                     = round((len(TABLE_DF[(TABLE_DF['ALGO'] == ALGO_DONUT) & (TABLE_DF['STATUS'] == 'SUCCESS')]) / len((TABLE_DF[TABLE_DF['ALGO']==ALGO_DONUT]))) * 100, 2) if len((TABLE_DF[TABLE_DF['ALGO']==ALGO_DONUT])) > 0 else 0
            DRAWDOWN_SINGLE                     = abs((TABLE_DF[TABLE_DF['ALGO']==ALGO_DONUT])['DRAWDOWN'].mean()) if len((TABLE_DF[TABLE_DF['ALGO']==ALGO_DONUT])) > 0 else 0
            START_D.append(START_DATE)
            START_B.append(START_BALANCE)
            TRD_NBR.append(TRADE_NBR)
            WINRATE.append(WIN_RATE_SINGLE)
            AVG_DRAWDOWN.append(DRAWDOWN_SINGLE)


        ALLOCATION_TABLE_DF['START_DATE']       = START_D
        ALLOCATION_TABLE_DF['START_BALANCE']    = START_B
        ALLOCATION_TABLE_DF['NBR_OF_TRADES']    = TRD_NBR
        ALLOCATION_TABLE_DF['NBR_OF_TRADES']    = ALLOCATION_TABLE_DF['NBR_OF_TRADES'].ffill().fillna(0)
        ALLOCATION_TABLE_DF['TIME']             = ALLOCATION_TABLE_DF['DATE'] -ALLOCATION_TABLE_DF['START_DATE']
        ALLOCATION_TABLE_DF['GAIN_AMT']         = ALLOCATION_TABLE_DF['PORTFOLIO_BALANCE'] -ALLOCATION_TABLE_DF['START_BALANCE']
        ALLOCATION_TABLE_DF['GAIN_RATE']        = ((ALLOCATION_TABLE_DF['PORTFOLIO_BALANCE'] -ALLOCATION_TABLE_DF['START_BALANCE'])/ALLOCATION_TABLE_DF['START_BALANCE']) * 100
        ALLOCATION_TABLE_DF['AVG_GAIN']         = np.where(ALLOCATION_TABLE_DF['NBR_OF_TRADES'] == 0, 0, ALLOCATION_TABLE_DF['GAIN_RATE'] / ALLOCATION_TABLE_DF['NBR_OF_TRADES'])
        ALLOCATION_TABLE_DF['winRate']          = WINRATE
        ALLOCATION_TABLE_DF['AVG_DRAWDOWN']     = AVG_DRAWDOWN

        OVERALL_LIST, RESPONSIBLE_LIST, BEST_LIST   = [], [], []
        ATTRIBUTES                                  = ['COMMITMENT_BALANCE', 'GAIN_AMT', 'AVG_GAIN', 'winRate', 'AVG_DRAWDOWN']
        TITLE                                       = ['Committed Amount', 'Total PNL Gain', 'Avg Gain Per Trade', 'Win Rate', 'Drawdown']
        METRIC                                      = ['$', '$', '%', '%', '%']

        TOTAL_COMMITMENT                        = ALLOCATION_TABLE_DF['COMMITMENT_BALANCE'].sum()
        TOTAL_GAIN                              = ALLOCATION_TABLE_DF['GAIN_AMT'].sum()
        TOTAL_TRADES                            = ALLOCATION_TABLE_DF['NBR_OF_TRADES'].sum()
        TOTAL_GAIN_RATE                         = round(((TOTAL_GAIN / TOTAL_COMMITMENT)*100)/TOTAL_TRADES, 2)
        TOTAL_WIN_RATE                          = round((len(TABLE_DF[(TABLE_DF['STATUS'] == 'SUCCESS')]) / len((TABLE_DF))) * 100, 2)
        TOTAL_DRAWDOWN                          = abs(TABLE_DF['DRAWDOWN'].mean())

        OVERALL_LIST.append(TOTAL_COMMITMENT)
        OVERALL_LIST.append(TOTAL_GAIN)
        OVERALL_LIST.append(TOTAL_GAIN_RATE)
        OVERALL_LIST.append(TOTAL_WIN_RATE)
        OVERALL_LIST.append(TOTAL_DRAWDOWN)

    
        for ATTRIBUTE in ATTRIBUTES:
            SORTED_DF = ALLOCATION_TABLE_DF.sort_values(by=ATTRIBUTE, ascending=False).reset_index(drop=True)
            RESPONSIBLE_LIST.append(SORTED_DF.at[0, 'ALGO'])
            BEST_LIST.append(SORTED_DF.at[0, ATTRIBUTE])

        data = {"Attribute"     : ATTRIBUTES,
                "Overall"       : OVERALL_LIST,
                "Responsible"   : RESPONSIBLE_LIST,
                "Best"          : BEST_LIST,
                "Metric"        : METRIC,
                "Title"         : TITLE}


        KPI = pd.DataFrame(data)

        return OUTPUT, STRATEGIES, TABLE_DF, ALLOCATION_TABLE_DF, DONUT_CHART, KPI








###########################################################################################################################################################################################################################################################################
############################################################################################################################# REALLOCATE FUNDS ############################################################################################################################
###########################################################################################################################################################################################################################################################################




class REALLOCATE_FUNDS():
    def __init__(self, SENDING, RECIEVING, AMOUNT, ACCOUNT_DF):
        self.SENDING            = SENDING
        self.RECIEVING          = RECIEVING
        self.AMOUNT             = AMOUNT
        self.ACCOUNT_DF         = ACCOUNT_DF
        self.RETURN             = self.REALLOCATE_FUNDS()

    def REALLOCATE_FUNDS(self):
        SENDER_EMAIL = ((self.ACCOUNT_DF[self.ACCOUNT_DF['IDENTIFIER']==self.SENDING]).reset_index(drop=True)).at[0, 'EMAIL']
        RECIEVING_EMAIL = ((self.ACCOUNT_DF[self.ACCOUNT_DF['IDENTIFIER']==self.RECIEVING]).reset_index(drop=True)).at[0, 'EMAIL']
        MASTER_API_KEY          = os.getenv("MASTER_API_KEY")
        MASTER_API_SEC          = os.getenv("MASTER_API_SEC")
        client                  = Client(MASTER_API_KEY, MASTER_API_SEC)
        ASSET = client.make_subaccount_futures_transfer(email=SENDER_EMAIL,asset='USDT',amount=self.AMOUNT,type=2)
        time.sleep(2)
        ASSET = client.make_subaccount_universal_transfer(fromEmail=SENDER_EMAIL,toEmail=RECIEVING_EMAIL,fromAccountType="SPOT",toAccountType="USDT_FUTURE",asset="USDT",amount=self.AMOUNT)        
        RETURN = ('- TRANSFER COMPLETED - $' + str(round(self.AMOUNT, 2)) + ' - SENT FROM : ' + self.SENDING + '      RECIEVED BY : ' + self.RECIEVING)

        return RETURN
    













