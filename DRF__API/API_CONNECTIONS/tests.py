import warnings
import sshtunnel
import pandas as pd
import psycopg2 as pg
import yfinance as yf
from sqlalchemy import create_engine
from datetime import datetime, timedelta

warnings.filterwarnings("ignore")




def OHLC_DATA_EQUITIES(TICKER, HISTORY, HISTORY_CHOSEN):

    if HISTORY_CHOSEN == 'YEARS':   DAYS = HISTORY * 365
    elif HISTORY_CHOSEN == 'WEEKS': DAYS = HISTORY * 7
    elif HISTORY_CHOSEN == 'DAYS':  DAYS = HISTORY

    END_DATE                        = datetime.now()
    START_DATE                      = END_DATE - timedelta(days=DAYS)
    START_DATE_FMT                  = START_DATE.strftime('%Y-%m-%d')
    END_DATE_FMT                    = END_DATE.strftime('%Y-%m-%d')
    STOCK                           = yf.Ticker(TICKER)
    DATA                            = STOCK.history(start=START_DATE_FMT, end=END_DATE_FMT)

    DATA.reset_index(inplace=True)
    DATA.rename(columns={"Date"         : "DATE", 
                         "Open"         : "OPEN", 
                         "High"         : "HIGH", 
                         "Low"          : "LOW", 
                         "Close"        : "CLOSE", 
                         "Volume"       : "VOLUME", 
                         "Dividends"    : "DIVIDENDS", 
                         "Stock Splits" : "STOCK_SPLITS"}, inplace=True)
    
    DATA['GAIN_RATE']               = round((DATA['DIVIDENDS']/DATA['OPEN']) * 100,2)
    DATA['DATE']                    = pd.to_datetime(DATA['DATE'])
    return DATA





def CONTROL(WATCHLIST, HISTORY, HISTORY_TYPE, PERIOD_TYPE):
    WATCHLIST_DF, EOP_DF, PRINTING          = [], [], 'NO'
    if PERIOD_TYPE == 'MONTHLY':            PERIOD = 'M'
    elif PERIOD_TYPE == 'QUARTERLY':        PERIOD = 'Q'
    elif PERIOD_TYPE == 'YEARLY':           PERIOD = 'Y'

    for i in range(len(WATCHLIST)):
        EQUITIES_DF                         = OHLC_DATA_EQUITIES(WATCHLIST[i], HISTORY, HISTORY_TYPE)        
        if PRINTING == 'YES':               EQUITIES_DF.to_csv(f"{WATCHLIST[i]}_combined_data.csv")
        EOP                                 = (EQUITIES_DF.groupby(EQUITIES_DF['DATE'].dt.to_period(PERIOD), as_index=False).agg({'DATE': 'max'}))
        EQUITIES_DF['DATE']                 = pd.to_datetime(EQUITIES_DF['DATE']).dt.tz_localize(None).dt.strftime('%Y-%m-%d')
        EOP['DATE']                         = pd.to_datetime(EOP['DATE']).dt.tz_localize(None).dt.strftime('%Y-%m-%d')

        WATCHLIST_DF.append(EQUITIES_DF.copy())
        EOP_DF.append(EOP.copy())


    return WATCHLIST_DF, EOP_DF







def DAILY_PORTFOLIO(INPUT_DF_LIST, EOP_USE_DF_LIST, WEIGHTS, INITIAL_INVESTMENT_AMOUNT, PERIODIC_INVESTMENT_AMOUNT, DIVIDEND_TAX_RATE):

    PORTFOLIO_LIST = []

    for u in range(len(WEIGHTS)):
        INPUT_DF    = INPUT_DF_LIST[u]
        EOP_USE_DF  = EOP_USE_DF_LIST[u]
        IIA         = INITIAL_INVESTMENT_AMOUNT * WEIGHTS[u]
        PIA         = PERIODIC_INVESTMENT_AMOUNT * WEIGHTS[u]
        INPUT_DF    = INPUT_DF.sort_values(by='DATE').reset_index(drop=True)

        SHARES_HELD, INVESTED_CASH, TOTAL_DIVIDENDS, PORTFOLIO     = 0, 0, 0, []
    
        for i, row in INPUT_DF.iterrows():
            DATE                    = row['DATE']
            CLOSE_PRICE             = row['CLOSE']
            DIVIDEND_PER_SHARE      = row['DIVIDENDS']

            if DATE in EOP_USE_DF['DATE'].values:
                INVESTMENT_AMOUNT   = IIA if INVESTED_CASH == 0 else PIA
                SHARES_PURCHASED    = INVESTMENT_AMOUNT / CLOSE_PRICE
                SHARES_HELD         += SHARES_PURCHASED
                INVESTED_CASH       += INVESTMENT_AMOUNT

            if DIVIDEND_PER_SHARE > 0:
                DIVIDENDS_EARNED    = SHARES_HELD * DIVIDEND_PER_SHARE
                DIVIDENDS_AFTER_TAX = DIVIDENDS_EARNED * (1 - DIVIDEND_TAX_RATE)
                REINVESTED_SHARES   = DIVIDENDS_AFTER_TAX / CLOSE_PRICE
                SHARES_HELD         += REINVESTED_SHARES
                TOTAL_DIVIDENDS     += DIVIDENDS_EARNED  

            PORTFOLIO_VALUE         = SHARES_HELD * CLOSE_PRICE

            PORTFOLIO.append({
                'DATE'                      : DATE,
                'CLOSING_PRICE'             : CLOSE_PRICE,
                'SHARES_HELD'               : SHARES_HELD,
                'CASH_INVESTED'             : INVESTED_CASH,
                'DIVIDENDS_EARNED'          : TOTAL_DIVIDENDS,
                'PORTFOLIO_VALUE'           : PORTFOLIO_VALUE
            })

            PORTFOLIO_DF                        = pd.DataFrame(PORTFOLIO)
            PORTFOLIO_DF['CLOSING_PRICE']       = PORTFOLIO_DF['CLOSING_PRICE'].round(2)
            PORTFOLIO_DF['SHARES_HELD']         = PORTFOLIO_DF['SHARES_HELD'].round(2)
            PORTFOLIO_DF['CASH_INVESTED']       = PORTFOLIO_DF['CASH_INVESTED'].round(2)
            PORTFOLIO_DF['DIVIDENDS_EARNED']    = PORTFOLIO_DF['DIVIDENDS_EARNED'].round(2)
            PORTFOLIO_DF['PORTFOLIO_VALUE']     = PORTFOLIO_DF['PORTFOLIO_VALUE'].round(2)

        PORTFOLIO_LIST.append(PORTFOLIO_DF.copy())

    if len(PORTFOLIO_LIST) > 1: COMBINED_VIEW = pd.concat(PORTFOLIO_LIST)
    else:                       COMBINED_VIEW = PORTFOLIO_LIST[0]
        
    COMBINED_VIEW = COMBINED_VIEW.groupby('DATE', as_index=False).agg({
                                    'CASH_INVESTED'     : 'sum',
                                    'DIVIDENDS_EARNED'  : 'sum',
                                    'PORTFOLIO_VALUE'   : 'sum'})

    return PORTFOLIO_LIST, COMBINED_VIEW






