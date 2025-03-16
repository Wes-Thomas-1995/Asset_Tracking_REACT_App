from datetime import datetime, timedelta, date
from binance.client import Client
import pandas as pd
import numpy as np
import itertools
import warnings
import json
import os
import ta

warnings.filterwarnings("ignore")
import importlib.util






class DEVELOPMENT_STRATEGY_BUILDER():
    def __init__(self, DATA_DF, CODE):
        self.DATA_DF    = DATA_DF
        self.CODE       = CODE
        self.DF         = self.DEVELOPMENT_STRATEGY_BUILDER()

    def DEVELOPMENT_STRATEGY_BUILDER(self):

        TESTING_FILE_PATH = os.path.join(os.getcwd(), 'API_OHLC/TEMP_TESTING_ZONE.py')
        with open(TESTING_FILE_PATH, 'w') as FILE:  FILE.write(self.CODE)
        spec = importlib.util.spec_from_file_location("TEMP_TESTING_ZONE", TESTING_FILE_PATH)
        temp_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(temp_module)
        DATA = temp_module.DEVELOPMENT_STRATEGY(self.DATA_DF)
        os.remove(TESTING_FILE_PATH)

        return DATA.DATA_DF







class BACKTEST():

    def __init__(self, INPUT_LIST, TIMEFRAME, LEVERAGE, PERCENTAGE_USED, STARTING_BALANCE):
        self.INPUT_LIST                     = INPUT_LIST
        self.TIMEFRAME                      = TIMEFRAME
        self.LEVERAGE                       = LEVERAGE
        self.PERCENTAGE_USED                = PERCENTAGE_USED
        self.STARTING_BALANCE               = STARTING_BALANCE
        self.API_DATA                       = self.BACKTEST()

    def BACKTEST(self):
        TIME_FRAMES                 = ['2H', '4H', '12H', '1D']
        INDEX                       = TIME_FRAMES.index(self.TIMEFRAME)

        DF_UPPER                    = self.INPUT_LIST[TIME_FRAMES.index(self.TIMEFRAME)]
        DF_LOWER                    = self.INPUT_LIST[0]

        DF_UPPER['STR_TIMEZONE']    = (DF_UPPER['DATE'].dt.date).astype("string") + ' ' + (DF_UPPER['DATE'].dt.time).astype("string")
        DF_LOWER['STR_TIMEZONE']    = (DF_LOWER['DATE'].dt.date).astype("string") + ' ' + (DF_LOWER['DATE'].dt.time).astype("string")
        DATA_MAIN                   = DF_UPPER[['STR_TIMEZONE', 'SIGNAL', 'TP', 'SL']]

        if INDEX == 0:              FINAL_DF = DF_UPPER.copy()
        else:                       FINAL_DF = DF_LOWER.merge(DATA_MAIN, how = 'left', on = ['STR_TIMEZONE'])

        FINAL_DF['SIGNAL']          = FINAL_DF['SIGNAL'].fillna('STATIC')
        FINAL_DF['OPEN_TRD']        = np.where((FINAL_DF['SIGNAL'] != "STATIC"), FINAL_DF['OPEN'], 0)

        SCENARIOS, ALT                                                  = ['STRATEGY_EXIT_SEQUENTIAL', 'STRATEGY_EXIT_SIMULTANEOUS', 'STRATEGY_EXIT_LEADING'], ['TP/SL ONLY', 'LEADING']
        ALT_RESULT_LIST, SCENARIOS_RESULT_LIST, SCENARIOS_BALANCE_LIST  = [], [], []



        for ALT_CHOSEN in ALT:
            if ALT_CHOSEN == 'TP/SL ONLY':
                RESULT, ACTIVE_TRADE = [], None

                for IDX, ROW in FINAL_DF.iterrows():
                    if ACTIVE_TRADE is None and ROW['SIGNAL'] != "STATIC":
                        ACTIVE_TRADE = {"INDEX": IDX, "TRADE": ROW,}

                    if ACTIVE_TRADE is not None:
                        TRADE_OUTCOME, COMPLETED_TIME, COMPLETED_INDEX = self.TRADE_ANALYSIS(ACTIVE_TRADE["TRADE"], FINAL_DF.iloc[IDX:])

                        if TRADE_OUTCOME in ["SUCCESS", "FAILURE"]:
                            RESULT.append({ "START_INDEX" : ACTIVE_TRADE["INDEX"], "END_INDEX" : COMPLETED_INDEX, "STATUS" : TRADE_OUTCOME, "TIME_COMPLETED" : COMPLETED_TIME,})
                            ACTIVE_TRADE = None  


                if ACTIVE_TRADE is not None: 
                    if FINAL_DF.at[ACTIVE_TRADE["INDEX"], 'SIGNAL'] == 'LONG':
                        if FINAL_DF.at[len(FINAL_DF)-1, 'CLOSE'] >= FINAL_DF.at[ACTIVE_TRADE["INDEX"], 'OPEN']: STATUS = "SUCCESS"
                        else: STATUS = "FAILURE"
                    
                    else:
                        if FINAL_DF.at[len(FINAL_DF)-1, 'CLOSE'] >= FINAL_DF.at[ACTIVE_TRADE["INDEX"], 'OPEN']: STATUS = "FAILURE"
                        else: STATUS = "SUCCESS"

                    RESULT.append({ "START_INDEX" : ACTIVE_TRADE["INDEX"], "END_INDEX" : len(FINAL_DF) - 1, "STATUS" : STATUS, "TIME_COMPLETED" : FINAL_DF['DATE'].iloc[-1]})
                ALT_RESULT_LIST.append(pd.DataFrame(RESULT))


            elif ALT_CHOSEN == 'LEADING':
                RESULT, TRADE_STACK = [], []

                for IDX, ROW in FINAL_DF.iterrows():
                    if ROW['SIGNAL'] != "STATIC": TRADE_STACK.append({"INDEX": IDX, "TRADE": ROW})

                    if len(TRADE_STACK) > 1:
                        ACTIVE_TRADE = TRADE_STACK.pop(0)
                        RESULT.append({ "START_INDEX"       : ACTIVE_TRADE["INDEX"],
                                        "END_INDEX"         : IDX,  
                                        "STATUS"            : "CLOSE_AT_NEXT_SIGNAL",
                                        "TIME_COMPLETED"    : ROW['DATE'],
                                        "CLOSE_PRICE"       : ROW['CLOSE']})

                for ACTIVE_TRADE in TRADE_STACK:
                    RESULT.append({ "START_INDEX"           : ACTIVE_TRADE["INDEX"],
                                    "END_INDEX"             : len(FINAL_DF) - 1, 
                                    "STATUS"                : "SUCCESS",
                                    "TIME_COMPLETED"        : FINAL_DF['DATE'].iloc[-1],
                                    "CLOSE_PRICE"           : FINAL_DF['CLOSE'].iloc[-1]})

                ALT_RESULT_LIST.append(pd.DataFrame(RESULT))


        FILTERED_TRADES, LAST_END_INDEX = [], -1
        for _, ROW in ALT_RESULT_LIST[0].iterrows():
            if ROW["START_INDEX"] > LAST_END_INDEX:
                FILTERED_TRADES.append(ROW)
                LAST_END_INDEX  = ROW["END_INDEX"]


        EXIT_1, EXIT_2                  = ALT_RESULT_LIST[0]['END_INDEX'].tolist(), ALT_RESULT_LIST[1]['END_INDEX'].tolist()
        STATUS_1, STATUS_2              = ALT_RESULT_LIST[0]['STATUS'].tolist(), ALT_RESULT_LIST[1]['STATUS'].tolist()
        TIME_1, TIME_2                  = ALT_RESULT_LIST[0]['TIME_COMPLETED'].tolist(), ALT_RESULT_LIST[1]['TIME_COMPLETED'].tolist()
        SCOPE_2_START, SCOPE_2_TIME     = ALT_RESULT_LIST[0]['START_INDEX'].tolist(), []
        SCOPE_2_END, SCOPE_2_STATUS     = [], []
        

        for A, B, STATUS_A, STATUS_B, TIME_A, TIME_B in zip(EXIT_1, EXIT_2, STATUS_1, STATUS_2, TIME_1, TIME_2):
            if A > B:
                SCOPE_2_END.append(B)
                SCOPE_2_STATUS.append(STATUS_B)
                SCOPE_2_TIME.append(TIME_B)
            else:
                SCOPE_2_END.append(A)
                SCOPE_2_STATUS.append(STATUS_A)
                SCOPE_2_TIME.append(TIME_A)

        SCOPE_2_DF      = pd.DataFrame({'START_INDEX'   : SCOPE_2_START,
                                        'END_INDEX'     : SCOPE_2_END,
                                        'STATUS'        : SCOPE_2_STATUS,
                                        'TIME_COMPLETED': SCOPE_2_TIME})


        for I in range(3):
            #print(I)
            if I == 0:      RELEVANT_DF = pd.DataFrame(FILTERED_TRADES)
            elif I == 1:    RELEVANT_DF = SCOPE_2_DF.copy()
            elif I == 2:    RELEVANT_DF = ALT_RESULT_LIST[1].copy()


            ENHANCED_TRADES                                     = []
            for _, TRADE in RELEVANT_DF.iterrows():
                START_INDEX                                     = TRADE["START_INDEX"]
                END_INDEX                                       = TRADE["END_INDEX"]
                STATUS                                          = TRADE["STATUS"]
                START_ROW                                       = FINAL_DF.iloc[START_INDEX]
                START_DATE                                      = START_ROW["DATE"]
                ENTRY                                           = START_ROW["OPEN"]
                DIRECTION                                       = START_ROW["SIGNAL"]

                if STATUS == "SUCCESS":                         EXIT  = START_ROW["TP"]
                elif STATUS == "FAILURE":                       EXIT  = START_ROW["SL"]
                elif STATUS == "CLOSE_AT_NEXT_SIGNAL":          EXIT  = FINAL_DF['CLOSE'].iloc[END_INDEX]


                if STATUS == "SUCCESS":                         PERCENT_CHANGE = abs(((EXIT - ENTRY) / ENTRY) * 100)
                elif STATUS == "FAILURE":                       PERCENT_CHANGE = abs(((EXIT - ENTRY) / ENTRY) * 100) * -1
                elif STATUS == "CLOSE_AT_NEXT_SIGNAL":          
                    if START_ROW["SIGNAL"] == "LONG":           PERCENT_CHANGE = ((EXIT - ENTRY) / ENTRY) * 100
                    else:                                       PERCENT_CHANGE = ((ENTRY - EXIT) / ENTRY) * 100
            
                TRADE_DATA                                      = FINAL_DF.iloc[START_INDEX:END_INDEX + 1]

                if START_ROW["SIGNAL"] == "LONG":               DRAWDOWN = abs(((TRADE_DATA["LOW"].min() - ENTRY) / ENTRY) * 100) * -1
                else:                                           DRAWDOWN = abs(((ENTRY - TRADE_DATA["HIGH"].max()) / ENTRY) * 100) * -1
                if STATUS == "FAILURE":                         DRAWDOWN = PERCENT_CHANGE

                ENHANCED_TRADES.append({"START_INDEX"           : TRADE["START_INDEX"],
                                        "END_INDEX"             : TRADE["END_INDEX"],
                                        "DIRECTION"             : DIRECTION,
                                        "STATUS"                : TRADE["STATUS"],
                                        "START_DATE"            : START_DATE,
                                        "END_DATE"              : TRADE["TIME_COMPLETED"],
                                        "PRICE_AT_ENTRY"        : ENTRY,
                                        "EXIT_PRICE"            : EXIT,
                                        "PERCENTAGE_CHANGE"     : PERCENT_CHANGE,
                                        "MAX_DRAWDOWN"          : DRAWDOWN})

                ENHANCED_DF                                     = pd.DataFrame(ENHANCED_TRADES)
                ENHANCED_DF['START_DATE']                       = pd.to_datetime(ENHANCED_DF['START_DATE'])
                ENHANCED_DF['END_DATE']                         = pd.to_datetime(ENHANCED_DF['END_DATE'])
                START_DATE_USE                                  = pd.to_datetime('2022-01-01')
                ENHANCED_DF                                     = ENHANCED_DF[ENHANCED_DF['START_DATE'] > START_DATE_USE].reset_index(drop=True)

            SCENARIOS_RESULT_LIST.append(ENHANCED_DF)
            TIMELINE_DF                                         = self.PORTFOLIO_TIMELINE(SCENARIOS_RESULT_LIST[I], self.STARTING_BALANCE, self.LEVERAGE, self.PERCENTAGE_USED)
            SCENARIOS_BALANCE_LIST.append(TIMELINE_DF)
            DF_UPPER                                            = self.MAP_EXIT(DF_UPPER, SCENARIOS_RESULT_LIST[I], SCENARIOS[I])
            OVERVIEW_DATA                                       = self.OVERVIEW(SCENARIOS_BALANCE_LIST)

        API_DATA                                                = self.API_OUTPUT(DF_UPPER, SCENARIOS_RESULT_LIST, SCENARIOS_BALANCE_LIST, OVERVIEW_DATA)
        #API_DATA                                               = [DF_UPPER, SCENARIOS_RESULT_LIST, SCENARIOS_BALANCE_LIST, OVERVIEW_DATA]
        return API_DATA


    def TRADE_ANALYSIS(self, ROW, DF_LOWER):
        DIRECTION       = ROW['SIGNAL']
        TRADE_START     = ROW['DATE']
        TRADE_OPEN      = ROW['OPEN']
        TRADE_TP        = ROW['TP']
        TRADE_SL        = ROW['SL']
        TRADE_END       = DF_LOWER['DATE'].iloc[-1]
        TRADE_DATA      = DF_LOWER[DF_LOWER['DATE'] >= TRADE_START]

        if TRADE_TP == 0 and TRADE_SL == 0:
            if DIRECTION == "LONG":
                if DF_LOWER['CLOSE'].iloc[-1] >= TRADE_OPEN:    return "SUCCESS", TRADE_END, DF_LOWER.index[-1]
                else:                                           return "FAILURE", TRADE_END, DF_LOWER.index[-1]
            else:
                if DF_LOWER['CLOSE'].iloc[-1] >= TRADE_OPEN:    return "FAILURE", TRADE_END, DF_LOWER.index[-1]
                else:                                           return "SUCCESS", TRADE_END, DF_LOWER.index[-1]


        elif TRADE_TP == 0 and TRADE_SL != 0:
            if DIRECTION == "LONG": TP_HIT = TRADE_DATA[TRADE_DATA['HIGH'] >= ROW['TP']]['DATE']
            else:                   TP_HIT = TRADE_DATA[TRADE_DATA['LOW'] <= ROW['TP']]['DATE']

            if not TP_HIT.empty:
                return "SUCCESS", FIRST_TP, (DF_LOWER.index[DF_LOWER['DATE'] == TP_HIT.iloc[0]].tolist())[0]
            else:
                if DIRECTION == "LONG":
                    if DF_LOWER['CLOSE'].iloc[-1] >= TRADE_OPEN:    return "SUCCESS", TRADE_END, DF_LOWER.index[-1]
                    else:                                           return "FAILURE", TRADE_END, DF_LOWER.index[-1]
                else:
                    if DF_LOWER['CLOSE'].iloc[-1] >= TRADE_OPEN:    return "FAILURE", TRADE_END, DF_LOWER.index[-1]
                    else:                                           return "SUCCESS", TRADE_END, DF_LOWER.index[-1]


        elif TRADE_TP != 0 and TRADE_SL == 0:
            if DIRECTION == "LONG": SL_HIT = TRADE_DATA[TRADE_DATA['LOW'] <= ROW['SL']]['DATE']
            else:                   SL_HIT = TRADE_DATA[TRADE_DATA['HIGH'] >= ROW['SL']]['DATE']

            if not SL_HIT.empty:
                return "FAILURE", SL_HIT.iloc[0], (DF_LOWER.index[DF_LOWER['DATE'] == SL_HIT.iloc[0]].tolist())[0]
            else:
                if DIRECTION == "LONG":
                    if DF_LOWER['CLOSE'].iloc[-1] >= TRADE_OPEN:    return "SUCCESS", TRADE_END, DF_LOWER.index[-1]
                    else:                                           return "FAILURE", TRADE_END, DF_LOWER.index[-1]
                else:
                    if DF_LOWER['CLOSE'].iloc[-1] >= TRADE_OPEN:    return "FAILURE", TRADE_END, DF_LOWER.index[-1]
                    else:                                           return "SUCCESS", TRADE_END, DF_LOWER.index[-1]


        else:
            if DIRECTION == "LONG":
                TP_HIT = TRADE_DATA[TRADE_DATA['HIGH'] >= ROW['TP']]['DATE']
                SL_HIT = TRADE_DATA[TRADE_DATA['LOW'] <= ROW['SL']]['DATE']
            else:
                TP_HIT = TRADE_DATA[TRADE_DATA['LOW'] <= ROW['TP']]['DATE']
                SL_HIT = TRADE_DATA[TRADE_DATA['HIGH'] >= ROW['SL']]['DATE']

            if not TP_HIT.empty and not SL_HIT.empty:
                FIRST_TP = TP_HIT.iloc[0]
                FIRST_SL = SL_HIT.iloc[0]

                if FIRST_TP < FIRST_SL:     return "SUCCESS", FIRST_TP, (DF_LOWER.index[DF_LOWER['DATE'] == FIRST_TP].tolist())[0]
                else:                       return "FAILURE", FIRST_SL, (DF_LOWER.index[DF_LOWER['DATE'] == FIRST_SL].tolist())[0]

            elif not TP_HIT.empty:    return "SUCCESS", TP_HIT.iloc[0], (DF_LOWER.index[DF_LOWER['DATE'] == TP_HIT.iloc[0]].tolist())[0]
            elif not SL_HIT.empty:    return "FAILURE", SL_HIT.iloc[0], (DF_LOWER.index[DF_LOWER['DATE'] == SL_HIT.iloc[0]].tolist())[0]
            else:  
                if DIRECTION == "LONG":
                    if DF_LOWER['CLOSE'].iloc[-1] >= TRADE_OPEN:    return "SUCCESS", TRADE_END, DF_LOWER.index[-1]
                    else:                                           return "FAILURE", TRADE_END, DF_LOWER.index[-1]
                else:
                    if DF_LOWER['CLOSE'].iloc[-1] >= TRADE_OPEN:    return "FAILURE", TRADE_END, DF_LOWER.index[-1]
                    else:                                           return "SUCCESS", TRADE_END, DF_LOWER.index[-1]

            

    def PORTFOLIO_TIMELINE(self, INPUT_DF, STARTING_BALANCE=100, LEVERAGE=1, PORTFOLIO_ALLOCATION=0.5, FEE_RATE=0.00075):
        
        if PORTFOLIO_ALLOCATION == 1: PORTFOLIO_ALLOCATION = 0.985
        BALANCE, TIMELINE = STARTING_BALANCE, []

        for _, TRADE in INPUT_DF.iterrows():
            TRADE_AMOUNT            = BALANCE * PORTFOLIO_ALLOCATION
            LEVERED_TRADE_AMOUNT    = TRADE_AMOUNT * LEVERAGE
            PERCENTAGE_CHANGE       = TRADE["PERCENTAGE_CHANGE"] / 100
            GROSS_PROFIT            = LEVERED_TRADE_AMOUNT * PERCENTAGE_CHANGE
            TOTAL_FEES              = LEVERED_TRADE_AMOUNT * FEE_RATE
            NET_PROFIT              = GROSS_PROFIT - TOTAL_FEES
            END_BALANCE             = BALANCE + NET_PROFIT
            TIMELINE.append({       "START_AMOUNT"  : BALANCE,
                                    "GROSS_PROFIT"  : GROSS_PROFIT,
                                    "FEES"          : TOTAL_FEES,
                                    "NET_PROFIT"    : NET_PROFIT,
                                    "END_AMOUNT"    : END_BALANCE,})
            BALANCE                 = END_BALANCE
        TIMELINE_DF                 = pd.DataFrame(TIMELINE)
        return TIMELINE_DF



    def MAP_EXIT(self, DF_UPPER, TRADE_DF_INPUT, LABEL):

        TRADE_DF                    = TRADE_DF_INPUT.copy()
        DF_UPPER['DATE']            = pd.to_datetime(DF_UPPER['DATE'])
        TRADE_DF['START_DATE']      = pd.to_datetime(TRADE_DF['START_DATE'])
        TRADE_DF['END_DATE']        = pd.to_datetime(TRADE_DF['END_DATE'])

       # Align END_DATE to the nearest valid timeframe
        def align_to_timeframe(end_date, timeframe):
            if timeframe == '2H':
                aligned_date = end_date.replace(minute=0, second=0)
                if aligned_date.hour % 2 != 0:
                    aligned_date += timedelta(hours=1)
            elif timeframe == '4H':
                aligned_date = end_date.replace(minute=0, second=0)
                if aligned_date.hour % 4 != 0:
                    aligned_date += timedelta(hours=4 - (aligned_date.hour % 4))
            elif timeframe == '12H':
                aligned_date = end_date.replace(minute=0, second=0)
                if aligned_date.hour < 12:
                    aligned_date = aligned_date.replace(hour=12)
                else:
                    aligned_date += timedelta(hours=24 - aligned_date.hour)
            elif timeframe == '1D':
                aligned_date = end_date.replace(hour=0, minute=0, second=0) + timedelta(days=1)
            else:
                # Default behavior for other cases (no alignment)
                aligned_date = end_date
            return aligned_date

        # Apply alignment to END_DATE based on the timeframe
        TRADE_DF[LABEL] = TRADE_DF['END_DATE'].apply(lambda x: align_to_timeframe(x, self.TIMEFRAME))
        DF_UPPER = DF_UPPER.merge(TRADE_DF[['START_DATE', LABEL]],how='left',left_on='DATE',right_on='START_DATE')
        DF_UPPER.drop(columns=['START_DATE'], inplace=True)
        DF_UPPER[LABEL] = DF_UPPER[LABEL].replace({pd.NaT: "NA"})
        return DF_UPPER


    def OVERVIEW(self, RESULTS_TABLE):
        RESULT_DF               = pd.DataFrame(columns=['METHOD', 'START_BALANCE', 'END_BALANCE', 'MAX_BALANCE', 'MIN_BALANCE', 'WIN_TRADES', 'NBR_TRADES', 'WIN_RATE', 'GAIN_RATE_PER_TRADE'])
        EVALUATION_METHOD       = ['TP_SL_ONLY', 'TP_SL_LEADING', 'LEADING_ONLY']

        for a in range(len(RESULTS_TABLE)):
            METHOD              = EVALUATION_METHOD[a]
            START_BALANCE       = RESULTS_TABLE[a]['START_AMOUNT'].iloc[0]
            END_BALANCE         = RESULTS_TABLE[a]['END_AMOUNT'].iloc[-1]
            MAX_BALANCE         = RESULTS_TABLE[a]['END_AMOUNT'].max()
            MIN_BALANCE         = RESULTS_TABLE[a]['END_AMOUNT'].min()
            WIN_TRADES          = len(RESULTS_TABLE[a][RESULTS_TABLE[a]['GROSS_PROFIT']>0].reset_index())
            NBR_TRADES          = len(RESULTS_TABLE[a])
            GAIN_RATE_PER_TRADE = round((((END_BALANCE-START_BALANCE)/START_BALANCE) * 100)/NBR_TRADES, 2)
            WIN_RATE            = WIN_TRADES/NBR_TRADES
            RESULT_DF           = pd.concat([RESULT_DF, pd.DataFrame([{ 'METHOD'                : METHOD,
                                                                        'START_BALANCE'         : START_BALANCE,
                                                                        'END_BALANCE'           : END_BALANCE,
                                                                        'MAX_BALANCE'           : MAX_BALANCE,
                                                                        'MIN_BALANCE'           : MIN_BALANCE,
                                                                        'WIN_TRADES'            : WIN_TRADES,
                                                                        'NBR_TRADES'            : NBR_TRADES,
                                                                        'WIN_RATE'              : WIN_RATE,
                                                                        'GAIN_RATE_PER_TRADE'   : GAIN_RATE_PER_TRADE}])], ignore_index=True)

        return RESULT_DF


    def API_OUTPUT(self, BACKTEST_DATA_1, BACKTEST_DATA_2, BACKTEST_DATA_3, BACKTEST_DATA_4):

        BACKTEST_DATA_1 = self.CONVERT_TIMESTAMP(BACKTEST_DATA_1)
        BACKTEST_DATA_2 = self.CONVERT_TIMESTAMP(BACKTEST_DATA_2)
        BACKTEST_DATA_3 = self.CONVERT_TIMESTAMP(BACKTEST_DATA_3)

        return [{"TYPE": "OHLC", "DATA": BACKTEST_DATA_1.to_dict(orient="records")},
                {"TYPE": "TRADES", "DATA": {f"TRADE_TYPE_{i}": DF.to_dict(orient="records") for i, DF in enumerate(BACKTEST_DATA_2)}},
                {"TYPE": "BALANCE", "DATA": {f"BALANCE_TYPE_{i}": DF.to_dict(orient="records") for i, DF in enumerate(BACKTEST_DATA_3)}},
                {"TYPE": "OVERVIEW", "DATA": BACKTEST_DATA_4.to_dict(orient="records")}]


    def CONVERT_TIMESTAMP(self, DATA):
        if isinstance(DATA, list):
            return [DF.assign(**{COL: DF[COL].dt.strftime("%Y-%m-%d %H:%M:%S")
                for COL in DF.select_dtypes(include=["datetime64[ns]"]).columns}).fillna("") for DF in DATA]
        
        elif isinstance(DATA, pd.DataFrame):
            return DATA.assign(**{COL: DATA[COL].dt.strftime("%Y-%m-%d %H:%M:%S")
                for COL in DATA.select_dtypes(include=["datetime64[ns]"]).columns}).fillna("")




