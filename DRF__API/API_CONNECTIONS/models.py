from django.db import models




	

class DEVELOPMENT_STRATEGY_DB(models.Model):
    STRTEGY_NAME = models.CharField(max_length=50, primary_key=True)
    STRATEGY_CODE = models.CharField(max_length=1000)

    class Meta:
        db_table = '___TRADER__DEVELOPMENT_STRATEGIES___'
        managed = False






class ACCOUNT_LINKS(models.Model):
    EMAIL = models.CharField(max_length=50, primary_key=True)
    IDENTIFIER = models.CharField(max_length=50)
    API_KEYS = models.CharField(max_length=50)
    API_SEC_KEYS = models.CharField(max_length=50)

    class Meta:
        db_table = '___TRADER__ACCOUNT_LINKS___'
        managed = False




class ALGO_BALANCE(models.Model):
    DATE = models.DateTimeField(primary_key=True)  # Changed to DateTimeField
    ALGO = models.CharField(max_length=50)
    BALANCE = models.FloatField()

    class Meta:
        db_table = '___TRADER__ALGO_BALANCE___'
        managed = False



class TRADE_HISTORY_FILE(models.Model):
    ORDERID = models.BigIntegerField(primary_key=True)  # Unique ORDER_ID
    TRADE_DATE = models.DateTimeField()  # Already a DateTimeField
    SYMBOL = models.CharField(max_length=20)
    SIDE = models.CharField(max_length=10)
    COMMISSION_ASSET = models.CharField(max_length=10, db_column='COMMISSION ASSET')
    COMMISSION = models.FloatField()
    PRICE = models.FloatField()
    QTY = models.FloatField()
    USDT_VALUE = models.FloatField()
    REALIZED_PNL = models.FloatField(db_column='REALIZED PNL')
    ALGO = models.CharField(max_length=50)
    TRADE_NBR = models.FloatField(db_column='TRADE_NBR')
    DRAWDOWN = models.FloatField(db_column='DRAWDOWN')
    STATUS = models.CharField(max_length=50)

    class Meta:
        db_table = '___TRADER__TRADE_HISTORY_FILE___'
        managed = False


class COMMITMENT(models.Model):
    SENDING_ID = models.CharField(max_length=100)
    SENDING_EMAIL = models.CharField(max_length=100)
    FROM_ACCOUNT_TYPE = models.CharField(max_length=100)
    RECEIVED_ID = models.CharField(max_length=100)
    RECEIVED_EMAIL = models.CharField(max_length=100)
    TO_ACCOUNT_TYPE = models.CharField(max_length=100)
    TIME = models.BigIntegerField(primary_key=True)
    DATE = models.DateTimeField() 
    ASSET = models.CharField(max_length=100)
    QTY = models.FloatField()
    TX_ID = models.BigIntegerField()

    class Meta:
        db_table = '___TRADER__COMMITMENT_HISTORY___'
        managed = False


class USER_INFORMATION(models.Model):
    USERNAME = models.CharField(max_length=50, primary_key=True)  # Assuming USERNAME is unique
    PASSWORD = models.CharField(max_length=100)
    UUID = models.CharField(max_length=50)
    FIRST_NAME = models.CharField(max_length=50)
    LAST_NAME = models.CharField(max_length=50)
    ADDRESS = models.CharField(max_length=255)
    CITY = models.CharField(max_length=100)
    POSTCODE = models.CharField(max_length=10)
    COUNTRY = models.CharField(max_length=100)
    PHONE_NUMBER = models.BigIntegerField()
    EMAIL_ADDRESS = models.EmailField()
    WALLET_ADDRESS = models.BigIntegerField()

    class Meta:
        db_table = '___TRADER__USER_INFORMATION___'
        managed = False






        