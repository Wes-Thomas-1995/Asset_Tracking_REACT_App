# API_CONNECTIONS/views.py
import re
import os
import json
import urllib.parse
import pandas as pd
import yfinance as yf
from datetime import datetime
from urllib.parse import unquote
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from dateutil.relativedelta import relativedelta
from django.views.decorators.csrf import csrf_exempt


from.Functions import(REALLOCATE_FUNDS)
from API_CONNECTIONS.models import (DEVELOPMENT_STRATEGY_DB)
from API_CONNECTIONS.serializers import (DEVELOPMENT_STRATEGY_DB_SERALIZER,)
from .TESTING_ZONE import (MAIN_EXTRACT_CLASS_NAMES, MAIN_PROCESS_STRATEGIES, SQL_DATA_SAVE)


from .tasks import (
    CACHED_ALGO_BALANCE,
    CACHED_TRADE_HISTORY_FILE,
    CACHED_USER_INFORMATION,
    CACHED_COMMITMENT,
    CACHED_TIMESERIES_DF,
    CACHED_STRATEGIES,
    CACHED_TABLE_DF,
    CACHED_ALLOCATION_TABLE_DF,
    CACHED_DONUT_CHART,
    CACHED_COINS,
    CACHED_KPI,
    ACCOUNT_DF,
    HOLDING_PATH,
    ENKI_TRADING_STRATEGIES_PATH,
    BASE_PATH,
    CACHED_DEV_STRATEGIES,
    DEVELOPMENT_STRATEGY_DF

)





@api_view(['GET'])
def STRATEGIES_CONNECTION(request):
    global CACHED_STRATEGIES
    return Response(CACHED_STRATEGIES)


@api_view(['GET'])
def DEVELOPMENT_STRATEGIES_CONNECTION(request):
    global CACHED_DEV_STRATEGIES
    return Response(CACHED_DEV_STRATEGIES)

@api_view(['POST'])
def PUBLISH_STRATEGY_CONNECTION(request):
    """
    Handle the publishing of a development strategy as an active strategy.
    """
    # Placeholder response
    return Response({"message": "PUBLISH_STRATEGY endpoint hit successfully."}, status=200)


@api_view(['POST'])
def SAVE_DEVELOPMENT_CODE_CONNECTION(request):

    global DEVELOPMENT_STRATEGY_DF
    global CACHED_DEV_STRATEGIES

    print('STRATEGY NAME :' + request.data.get('STRTEGY_NAME', ''))
    print('STRATEGY CODE :' + request.data.get('STRATEGY_CODE', ''))


    new_strategy = {"STRTEGY_NAME"  : request.data.get('STRTEGY_NAME', ''),  
                    "STRATEGY_CODE" : request.data.get('STRATEGY_CODE', '')}

    if new_strategy["STRTEGY_NAME"] in DEVELOPMENT_STRATEGY_DF["STRTEGY_NAME"].values: DEVELOPMENT_STRATEGY_DF.loc[DEVELOPMENT_STRATEGY_DF["STRTEGY_NAME"] == new_strategy["STRTEGY_NAME"], "STRATEGY_CODE"] = new_strategy["STRATEGY_CODE"]
    else: DEVELOPMENT_STRATEGY_DF = pd.concat([DEVELOPMENT_STRATEGY_DF, pd.DataFrame([new_strategy])], ignore_index=True)

    TABLE_NAME_USE                      = '___TRADER__DEVELOPMENT_STRATEGIES___'
    ERROR                               = SQL_DATA_SAVE(DEVELOPMENT_STRATEGY_DF, TABLE_NAME_USE)
    DEVELOPMENT_STRATEGY_DF_DB          = DEVELOPMENT_STRATEGY_DB.objects.all()
    CACHED_DEV_STRATEGIES               = DEVELOPMENT_STRATEGY_DB_SERALIZER(DEVELOPMENT_STRATEGY_DF_DB, many=True).data
    DEVELOPMENT_STRATEGY_DF             = pd.DataFrame(CACHED_DEV_STRATEGIES)

    return Response({"message": "Development code saved successfully"}, status=200)


@csrf_exempt
def GET_FILE_CONTENT(request):
    global BASE_PATH
    if request.method == "GET":
        file_name = request.GET.get("file")

        if not file_name: return JsonResponse({"error": "File name not provided"}, status=400)
        decoded_file_name = urllib.parse.unquote(file_name).lstrip("/")
        absolute_path = os.path.join(BASE_PATH, decoded_file_name)
        if not absolute_path.startswith(BASE_PATH): return JsonResponse({"error": "Invalid file path"}, status=400)
        if not os.path.isfile(absolute_path): return JsonResponse({"error": "File not found"}, status=404)
        try:
            with open(absolute_path, "r") as file: file_content = file.read()
            return JsonResponse({"file_content": file_content}, status=200)

        except Exception as e: return JsonResponse({"error": f"Unable to read the file: {str(e)}"}, status=500)
    return JsonResponse({"error": "Invalid HTTP method"}, status=405)





@csrf_exempt
def SAVE_FILE(request):

    global HOLDING_PATH
    global CACHED_STRATEGIES
    global ENKI_TRADING_STRATEGIES_PATH

    if request.method == "POST":
        try:
            body        = json.loads(request.body)
            file_path   = body.get("file")
            content     = body.get("content")

            if not file_path or not content: return JsonResponse({"error": "File path or content is missing."}, status=400)
            decoded_file_path = os.path.normpath(os.path.join(BASE_PATH, os.path.normpath(file_path.strip("/"))))
            if not decoded_file_path.startswith(BASE_PATH): return JsonResponse({"error": "Invalid file path."}, status=400)
            directory = os.path.dirname(decoded_file_path)
            if not os.path.exists(directory): return JsonResponse({"error": "Directory does not exist."}, status=400)
            with open(decoded_file_path, "w") as file: file.write(content)

            MAIN_PROCESS_STRATEGIES(HOLDING_PATH, ENKI_TRADING_STRATEGIES_PATH)
            COMBINED_OUTPUT             = MAIN_EXTRACT_CLASS_NAMES(HOLDING_PATH)
            CACHED_STRATEGIES           = COMBINED_OUTPUT.DF

            return JsonResponse({"message": "File saved successfully!"}, status=200)

        except Exception as e: return JsonResponse({"error": f"An error occurred: {str(e)}"}, status=500)
    return JsonResponse({"error": "Invalid HTTP method."}, status=405)






@csrf_exempt
def FOLDER_TREE(request):

    def natural_sort_key(item):
        return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', item)]

    def build_tree(path):
        tree = {}
        if os.path.exists(path):
            for item in sorted(os.listdir(path), key=natural_sort_key):
                item_path = os.path.join(path, item)
                if os.path.isdir(item_path): tree[item] = build_tree(item_path)
                else:
                    if "files" not in tree: tree["files"] = []
                    tree["files"].append(item)  
        return tree

    folder_structure = build_tree(BASE_PATH)
    return JsonResponse(folder_structure, safe=False)



@api_view(['POST'])
def TRANSFER_FUNDS(request, SENDING, RECIEVING, AMOUNT):
    global ACCOUNT_DF

    try:
        SENDING     = unquote(SENDING)
        RECIEVING   = unquote(RECIEVING)
        AMOUNT      = float(AMOUNT)

        if not ACCOUNT_DF[ACCOUNT_DF['IDENTIFIER'] == SENDING].empty and not ACCOUNT_DF[ACCOUNT_DF['IDENTIFIER'] == RECIEVING].empty:
            reallocation    = REALLOCATE_FUNDS(SENDING, RECIEVING, AMOUNT, ACCOUNT_DF)
            message         = reallocation.RETURN

        else: return Response({"error": "Invalid SENDING or RECEIVING strategy"}, status=400)
        return Response({"message": message}, status=200)
    except Exception as e: return Response({"error": str(e)}, status=500)



@api_view(['GET'])
def KPI_CONNECTION(request):
    global CACHED_KPI
    return Response(CACHED_KPI)


@api_view(['GET'])
def ALGO_BALANCE_CONNECTION(request):
    global CACHED_ALGO_BALANCE
    return Response(CACHED_ALGO_BALANCE)

@api_view(['GET'])
def ALGO_TRADES_CONNECTION(request):
    global CACHED_TRADE_HISTORY_FILE
    return Response(CACHED_TRADE_HISTORY_FILE)


@api_view(['GET'])
def USER_INFORMATION_CONNECTION(request):
    global CACHED_USER_INFORMATION
    return Response(CACHED_USER_INFORMATION)


@api_view(['GET'])
def COMMITMENT_CONNECTION(request):
    global CACHED_COMMITMENT
    return Response(CACHED_COMMITMENT)


@api_view(['GET'])
def TIMESERIES_DF_CONNECTION(request):
    global CACHED_TIMESERIES_DF
    return Response(CACHED_TIMESERIES_DF)


@api_view(['GET'])
def STRATEGIES_CONNECTION(request):
    global CACHED_STRATEGIES
    return Response(CACHED_STRATEGIES)


@api_view(['GET'])
def TABLES_DF_CONNECTION(request):
    global CACHED_TABLE_DF
    return Response(CACHED_TABLE_DF)


@api_view(['GET'])
def ALLOCATION_TABLE_DF_CONNECTION(request):
    global CACHED_ALLOCATION_TABLE_DF
    return Response(CACHED_ALLOCATION_TABLE_DF)


@api_view(['GET'])
def DONUT_CHART_CONNECTION(request):
    global CACHED_DONUT_CHART
    return Response(CACHED_DONUT_CHART)


@api_view(['GET'])
def COINS_CONNECTION(request):
    global CACHED_COINS
    return Response(CACHED_COINS)






@api_view(['GET'])
def simulation_view(
    request,
    INVESTMENT_TYPE,
    INITIAL_INVESTMENT_AMOUNT,
    PERIODIC_INVESTMENT_AMOUNT,
    PERIODIC_OPTIONS,
    HISTORY,
    HISTORY_OPTIONS,
    INTEREST_RATE,
    COMPOUND_FREQUENCY,
    EQUITIES,
    REOCCURING_AMOUNT,
    REOCCURING_FREQUENCY,
    INDEPEDENT_INVESTMENTS
):
    try:
        # Handle "NA" and blank values
        INTEREST_RATE = float(INTEREST_RATE) if INTEREST_RATE != "NA" else 0.0
        HISTORY_OPTIONS = HISTORY_OPTIONS if HISTORY_OPTIONS != "NA" else None
        PERIODIC_OPTIONS = PERIODIC_OPTIONS if PERIODIC_OPTIONS != "NA" else None
        REOCCURING_FREQUENCY = REOCCURING_FREQUENCY if REOCCURING_FREQUENCY != "NA" else None
        COMPOUND_FREQUENCY = COMPOUND_FREQUENCY if COMPOUND_FREQUENCY != "NA" else None
        EQUITIES = EQUITIES if EQUITIES not in [None, ""] else "NA"
        INDEPEDENT_INVESTMENTS = INDEPEDENT_INVESTMENTS if INDEPEDENT_INVESTMENTS not in [None, ""] else "NA"

        WATCHLIST, WEIGHTS = [], []
        INDEPENDENT_VALUES, INDEPENDENT_DATES = [], []

        # Parse equities
        if INVESTMENT_TYPE == "Equities" and EQUITIES != "NA":
            EQUITIES_LIST = EQUITIES.split(",")
            WATCHLIST = [eq.split("_")[0] for eq in EQUITIES_LIST]
            WEIGHTS = [float(eq.split("_")[1]) / 100 for eq in EQUITIES_LIST]

        # Parse independent investments
        if INDEPEDENT_INVESTMENTS != "NA":
            independent_list = INDEPEDENT_INVESTMENTS.split(";")
            INDEPENDENT_VALUES = [
                float(item.split(",")[0].split("_")[1]) for item in independent_list
            ]
            INDEPENDENT_DATES = [
                item.split(",")[1].split("_")[1] for item in independent_list
            ]

        # Run the simulation function
        simulation_output = SIMULATION_FUNCTION(
            INVESTMENT_TYPE=INVESTMENT_TYPE,
            WATCHLIST=WATCHLIST,
            WEIGHTS=WEIGHTS,
            INTEREST_RATE=INTEREST_RATE,
            COMPOUND_FREQUENCY=COMPOUND_FREQUENCY,
            HISTORY=int(HISTORY),
            HISTORY_OPTIONS=HISTORY_OPTIONS,
            INITIAL_INVESTMENT_AMOUNT=float(INITIAL_INVESTMENT_AMOUNT),
            PERIODIC_INVESTMENT_AMOUNT=float(PERIODIC_INVESTMENT_AMOUNT),
            PERIODIC_OPTIONS=PERIODIC_OPTIONS,
            REOCCURING_AMOUNT=float(REOCCURING_AMOUNT),
            REOCCURING_FREQUENCY=REOCCURING_FREQUENCY,
            INDEPENDENT_VALUES=INDEPENDENT_VALUES,
            INDEPENDENT_DATES=INDEPENDENT_DATES,
        )

        return Response({"status": "success", "data": simulation_output}, status=200)

    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=400)
    



def SIMULATION_FUNCTION(
    INVESTMENT_TYPE, WATCHLIST, WEIGHTS, INTEREST_RATE, COMPOUND_FREQUENCY, 
    HISTORY, HISTORY_OPTIONS, INITIAL_INVESTMENT_AMOUNT, PERIODIC_INVESTMENT_AMOUNT, 
    PERIODIC_OPTIONS, REOCCURING_AMOUNT, REOCCURING_FREQUENCY, 
    INDEPENDENT_VALUES, INDEPENDENT_DATES
):


    END_DATE = datetime.now()
    END_DATE_FMT = END_DATE.strftime('%Y-%m-%d')
    WATCHLIST_DF, EOP_DF, EOP_DF_RECURRING, PORTFOLIO_LIST, TABLE = [], [], [], [], []

    MAPPINGS_HISTORY = { "Months": 1, "Quarters": 3, "Years": 12 }
    MAPPINGS = { 
        "Monthly": {"PERIOD": "M", "FREQUENCY": 12},
        "Quarterly": {"PERIOD": "Q", "FREQUENCY": 4},
        "Annually": {"PERIOD": "Y", "FREQUENCY": 1},
    }

    TOTAL_PERIODS = HISTORY * MAPPINGS_HISTORY.get(HISTORY_OPTIONS, 1)
    START_DATE = END_DATE - relativedelta(months=TOTAL_PERIODS)
    START_DATE_FMT = START_DATE.strftime('%Y-%m-%d')

    INDEPENDENT_DATES = [datetime.strptime(DATE, "%Y-%m-%d") for DATE in INDEPENDENT_DATES]
    PERIODS_PER_YEAR = MAPPINGS.get(COMPOUND_FREQUENCY, {}).get("FREQUENCY", 12)
    PERIODIC_INTERVALS = MAPPINGS.get(PERIODIC_OPTIONS, {}).get("FREQUENCY", 1)
    REOCCURING_INTERVALS = MAPPINGS.get(REOCCURING_FREQUENCY, {}).get("FREQUENCY", 1)
    PERIOD = MAPPINGS.get(PERIODIC_OPTIONS, {}).get("PERIOD", "M")
    REOCCURING_PERIOD = MAPPINGS.get(REOCCURING_FREQUENCY, {}).get("PERIOD", "M")
    DIVIDENT_TAX_RATE = 0.15

    output = {"type": INVESTMENT_TYPE, "all": []}


    if INVESTMENT_TYPE == 'Interest': 
        CASH_INVESTED = INITIAL_INVESTMENT_AMOUNT
        PORTFOLIO_VALUE = INITIAL_INVESTMENT_AMOUNT

        for i in range(TOTAL_PERIODS):
            CURRENT_DATE = START_DATE + relativedelta(months=i)

            # Apply compound interest
            PORTFOLIO_VALUE *= (1 + INTEREST_RATE / (100 * PERIODS_PER_YEAR))

            # Add periodic investments
            if (i + 1) % (12 // PERIODIC_INTERVALS) == 0:  
                PORTFOLIO_VALUE += PERIODIC_INVESTMENT_AMOUNT
                CASH_INVESTED += PERIODIC_INVESTMENT_AMOUNT

            # Add reoccurring investments
            if (i + 1) % (12 // REOCCURING_INTERVALS) == 0:  
                PORTFOLIO_VALUE += REOCCURING_AMOUNT
                CASH_INVESTED += REOCCURING_AMOUNT

            # Add independent investments by matching to the nearest date
            for IND_VALUE, IND_DATE in zip(INDEPENDENT_VALUES, INDEPENDENT_DATES):
                days_diff = abs((CURRENT_DATE - IND_DATE).days)
                if days_diff <= 15:  # Allow a 15-day margin to match closest date
                    PORTFOLIO_VALUE += IND_VALUE
                    CASH_INVESTED += IND_VALUE

            # Record the data
            TABLE.append({
                "DATE": CURRENT_DATE.strftime("%Y-%m-%d"),
                "DIVIDENDS_EARNED": 0,
                "CASH_INVESTED": round(CASH_INVESTED, 2),
                "PORTFOLIO_VALUE": round(PORTFOLIO_VALUE, 2),
            })

        # Ensure the table is sorted by ascending dates
        TABLE = sorted(TABLE, key=lambda x: x["DATE"])
        output["all"] = TABLE
        return output
    
    elif INVESTMENT_TYPE == 'Equities': 
        for a in range(len(WATCHLIST)):
            STOCK = yf.Ticker(WATCHLIST[a])
            DATA = STOCK.history(start=START_DATE_FMT, end=END_DATE_FMT)
            DATA.reset_index(inplace=True)
            DATA.rename(columns={
                "Date": "DATE", "Open": "OPEN", "High": "HIGH", "Low": "LOW", 
                "Close": "CLOSE", "Volume": "VOLUME", "Dividends": "DIVIDENDS", 
                "Stock Splits": "STOCK_SPLITS"
            }, inplace=True)

            DATA['DATE'] = pd.to_datetime(DATA['DATE']).dt.tz_localize(None)
            DATA.sort_values(by="DATE", inplace=True)  # Ensure dates are in ascending order

            # Use PERIOD for periodic investments and REOCCURING_PERIOD_MAP for recurring
            EOP_PERIODIC = DATA.groupby(DATA['DATE'].dt.to_period(PERIOD), as_index=False).agg({'DATE': 'max'})
            EOP_PERIODIC['DATE'] = pd.to_datetime(EOP_PERIODIC['DATE']).dt.tz_localize(None)

            EOP_RECURRING = DATA.groupby(DATA['DATE'].dt.to_period(REOCCURING_PERIOD), as_index=False).agg({'DATE': 'max'})
            EOP_RECURRING['DATE'] = pd.to_datetime(EOP_RECURRING['DATE']).dt.tz_localize(None)

            WATCHLIST_DF.append(DATA.copy())
            EOP_DF.append(EOP_PERIODIC.copy())
            EOP_DF_RECURRING.append(EOP_RECURRING.copy())

        for u, ticker in enumerate(WATCHLIST):
            INPUT_DF = WATCHLIST_DF[u]
            EOP_PERIODIC_DF = EOP_DF[u]
            EOP_RECURRING_DF = EOP_DF_RECURRING[u]
            IIA = INITIAL_INVESTMENT_AMOUNT * WEIGHTS[u]
            PIA = PERIODIC_INVESTMENT_AMOUNT * WEIGHTS[u]

            PIA = PERIODIC_INVESTMENT_AMOUNT * WEIGHTS[u]
            PIA = PERIODIC_INVESTMENT_AMOUNT * WEIGHTS[u]

            INPUT_DF = INPUT_DF.sort_values(by='DATE').reset_index(drop=True)

            SHARES_HELD, INVESTED_CASH, TOTAL_DIVIDENDS, INDIVIDUAL_PORTFOLIO = 0, 0, 0, []

            for i, row in INPUT_DF.iterrows():
                DATE = row['DATE']
                CLOSE_PRICE = row['CLOSE']
                DIVIDEND_PER_SHARE = row['DIVIDENDS']

                # Check if the current date matches EOP dates
                is_periodic_eop_date = DATE in EOP_PERIODIC_DF['DATE'].values
                is_recurring_eop_date = DATE in EOP_RECURRING_DF['DATE'].values

                # Apply Initial Investment
                if INVESTED_CASH == 0:
                    SHARES_PURCHASED = IIA / CLOSE_PRICE
                    SHARES_HELD += SHARES_PURCHASED
                    INVESTED_CASH += IIA

                # Apply Periodic Investments only on EOP_PERIODIC dates
                if is_periodic_eop_date:
                    SHARES_PURCHASED = PIA / CLOSE_PRICE
                    SHARES_HELD += SHARES_PURCHASED
                    INVESTED_CASH += PIA

                # Apply Recurring Investments only on EOP_RECURRING dates
                if is_recurring_eop_date:
                    SHARES_PURCHASED = (REOCCURING_AMOUNT * WEIGHTS[u]) / CLOSE_PRICE
                    SHARES_HELD += SHARES_PURCHASED
                    INVESTED_CASH += (REOCCURING_AMOUNT * WEIGHTS[u])

                # Apply Independent Investments by matching nearest date
                for IND_VALUE, IND_DATE in zip(INDEPENDENT_VALUES, INDEPENDENT_DATES):
                    if abs((DATE - IND_DATE).days) <= 15:  # Match within a 15-day margin
                        SHARES_PURCHASED = (IND_VALUE * WEIGHTS[u]) / CLOSE_PRICE
                        SHARES_HELD += SHARES_PURCHASED
                        INVESTED_CASH += (IND_VALUE * WEIGHTS[u])

                # Calculate Dividends
                if DIVIDEND_PER_SHARE > 0:
                    DIVIDENDS_EARNED = (SHARES_HELD * DIVIDEND_PER_SHARE) * (1-DIVIDENT_TAX_RATE)
                    SHARES_HELD += DIVIDENDS_EARNED / CLOSE_PRICE
                    TOTAL_DIVIDENDS += DIVIDENDS_EARNED  

                # Calculate Portfolio Value
                PORTFOLIO_VALUE = SHARES_HELD * CLOSE_PRICE

                INDIVIDUAL_PORTFOLIO.append({
                    'DATE': DATE.strftime('%Y-%m-%d'),
                    'CASH_INVESTED': round(INVESTED_CASH, 2),
                    'DIVIDENDS_EARNED': round(TOTAL_DIVIDENDS, 2),
                    'PORTFOLIO_VALUE': round(PORTFOLIO_VALUE, 2),
                })

            # Ensure individual portfolios are sorted by ascending dates
            INDIVIDUAL_PORTFOLIO = sorted(INDIVIDUAL_PORTFOLIO, key=lambda x: x["DATE"])
            PORTFOLIO_LIST.append(pd.DataFrame(INDIVIDUAL_PORTFOLIO))
            output[ticker] = INDIVIDUAL_PORTFOLIO  # Add to output by ticker

        # Combine all portfolios into a single view
        COMBINED_VIEW = pd.concat(PORTFOLIO_LIST).sort_values(by="DATE").groupby('DATE', as_index=False).agg({
            'CASH_INVESTED': 'sum',
            'DIVIDENDS_EARNED': 'sum',
            'PORTFOLIO_VALUE': 'sum'
        }).to_dict(orient='records')

        output["all"] = COMBINED_VIEW
        return output