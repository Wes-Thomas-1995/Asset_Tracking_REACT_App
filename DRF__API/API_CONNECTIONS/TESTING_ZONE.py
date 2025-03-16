

import os
import re
import ast
import warnings
import sshtunnel
import numpy as np 
import pandas as pd
import psycopg2 as pg
import yfinance as yf
from sqlalchemy import create_engine
from datetime import datetime, timedelta





class MAIN_PROCESS_STRATEGIES():
    def __init__(self, HOLDING_FILE, ENKI_TRADING_STRATEGIES):
        self.HOLDING_FILE               = HOLDING_FILE
        self.ENKI_TRADING_STRATEGIES    = ENKI_TRADING_STRATEGIES
        self.DF                         = self.MAIN_PROCESS_STRATEGIES()

    def MAIN_PROCESS_STRATEGIES(self):
        self.CLEAR_FILE(self.HOLDING_FILE)
        FOLDERS =  [FOLDER for FOLDER in os.listdir(self.ENKI_TRADING_STRATEGIES)
                    if os.path.isdir(os.path.join(self.ENKI_TRADING_STRATEGIES, FOLDER))
                    and FOLDER not in {"CORE_FUNCTIONS", "DATA_STORAGE_AND_CONTROL"}]

        for FOLDER in FOLDERS:
            STRATEGY_FILE = os.path.join(self.ENKI_TRADING_STRATEGIES, FOLDER, "STRATEGY.py")
            if os.path.isfile(STRATEGY_FILE):
                RENAMED_CLASS = self.EXTRACT_AND_RENAME_CLASS(STRATEGY_FILE, ORIGINAL_CLASS_NAME="STRATEGY", NEW_CLASS_NAME=FOLDER)
                if RENAMED_CLASS: self.APPEND_TO_FILE(self.HOLDING_FILE, RENAMED_CLASS)

        print(f"Completed processing strategies. Updated {self.HOLDING_FILE}")


    def CLEAR_FILE(self, FILE_PATH):
        with open(FILE_PATH, "w") as FILE: FILE.write(f"\nfrom datetime import datetime, timedelta, date, time\nfrom itertools import combinations\nfrom time import strftime\nimport pandas as pd\nimport numpy as np")


    def EXTRACT_AND_RENAME_CLASS(self, SOURCE_FILE, ORIGINAL_CLASS_NAME, NEW_CLASS_NAME):
        try:
            with open(SOURCE_FILE, "r") as FILE:
                SOURCE_CODE     = FILE.read()
                PARSED_AST      = ast.parse(SOURCE_CODE)

                for NODE in PARSED_AST.body:
                    if isinstance(NODE, ast.ClassDef) and NODE.name == ORIGINAL_CLASS_NAME:
                        NODE.name = NEW_CLASS_NAME
                        return ast.unparse(NODE)
            return None
        except Exception as E:
            print(f"Error extracting or renaming class {ORIGINAL_CLASS_NAME} from {SOURCE_FILE}: {E}")
            return None


    def APPEND_TO_FILE(self, FILE_PATH, CONTENT):
        try:
            with open(FILE_PATH, "a") as FILE: FILE.write(f"\n\n\n\n{CONTENT}")
        except Exception as E: print(f"Error appending content to {FILE_PATH}: {E}")




class MAIN_EXTRACT_CLASS_NAMES:
    def __init__(self, HOLDING_FILE):
        self.HOLDING_FILE = HOLDING_FILE
        self.DF = self.MAIN_EXTRACT_CLASS_NAMES()

    def MAIN_EXTRACT_CLASS_NAMES(self):
        CLASS_NAMES = self.EXTRACT_CLASS_NAMES(self.HOLDING_FILE)
        CLEAN_NAMES = self.CLEAN_CLASS_NAMES(CLASS_NAMES)
        CLEAN_NAMES.sort(key=lambda X: X[0])  # Sort by strategy number

        # Generate strategies list
        STRATEGIES_LIST = [ITEM[1] for ITEM in CLEAN_NAMES]  # Keep "Strategy 1", "Strategy 2"

        # Generate strategy map
        STRATEGY_MAP = {ITEM[0]: ITEM[1] for ITEM in CLEAN_NAMES}  # Map number to "Strategy X"
        STRATEGY_MAP[99] = "Development Strategy"  # Add development strategy

        # Combined output
        COMBINED_OUTPUT = {"STRATEGIES_LIST": STRATEGIES_LIST, "STRATEGY_MAP": STRATEGY_MAP}
        return COMBINED_OUTPUT

    def EXTRACT_CLASS_NAMES(self, FILE_PATH):
        CLASS_NAMES = []
        try:
            with open(FILE_PATH, "r") as FILE:
                SOURCE_CODE = FILE.read()
                PARSED_AST = ast.parse(SOURCE_CODE)
                for NODE in PARSED_AST.body:
                    if isinstance(NODE, ast.ClassDef):
                        CLASS_NAMES.append(NODE.name)
        except Exception as E:
            print(f"Error reading file or parsing AST: {E}")
        return CLASS_NAMES

    def CLEAN_CLASS_NAMES(self, CLASS_NAMES):
        CLEAN_NAMES = []
        for CLASS_NAME in CLASS_NAMES:
            if CLASS_NAME.startswith("STRATEGY_"):
                MATCH = re.search(r"STRATEGY_(\d+)", CLASS_NAME)
                if MATCH:
                    STRATEGY_NUMBER = int(MATCH.group(1))
                    CLEAN_NAME = f"Strategy {STRATEGY_NUMBER}"
                    CLEAN_NAMES.append((STRATEGY_NUMBER, CLEAN_NAME, CLASS_NAME))  # Include both number and name
        return CLEAN_NAMES








class SQL_DATA_SAVE():
    def __init__(self, INPUT_DF, TABLE_NAME):
        self.INPUT_DF               = INPUT_DF
        self.TABLE_NAME             = TABLE_NAME
        self.ERROR_LIST             = self.SQL_DATA_SAVE()


    def SQL_DATA_SAVE(self):

        sshtunnel.SSH_TIMEOUT       = 5.0
        sshtunnel.TUNNEL_TIMEOUT    = 5.0
        POSTGRES_HOSTNAME           = os.getenv("REMOTE_BIND_HOST")
        POSTGRES_HOST_PORT          = os.getenv("REMOTE_BIND_PORT")
        SSH_USER_NAME               = os.getenv("SSH_USERNAME")
        SSH_PASSWORD                = os.getenv("SSH_PASSWORD")
        USERNAME                    = os.getenv("DB_USER")
        PASSWORD                    = os.getenv("DB_PASSWORD")
        DB_NAME                     = os.getenv("DB_NAME")
        HOST                        = os.getenv("DB_HOST")
        ERROR_LIST                  = []

        with sshtunnel.SSHTunnelForwarder(
                ('ssh.eu.pythonanywhere.com'),
                ssh_username        = SSH_USER_NAME,
                ssh_password        = SSH_PASSWORD,
                remote_bind_address = (POSTGRES_HOSTNAME, POSTGRES_HOST_PORT)

        ) as tunnel:
            try:

                PORT                = tunnel.local_bind_port
                ENGINE              = create_engine(f"postgresql://{USERNAME}:{PASSWORD}@{HOST}:{PORT}/{DB_NAME}")

                if len(self.INPUT_DF) > 0:

                    try:            self.INPUT_DF.to_sql(self.TABLE_NAME, ENGINE, if_exists='replace', index=False)
                    except:         print('UNABLE TO UPLOAD DETAIL')


            except (Exception,  pg.DatabaseError) as error:
                        ERROR_LIST.append(error)

        return ERROR_LIST





