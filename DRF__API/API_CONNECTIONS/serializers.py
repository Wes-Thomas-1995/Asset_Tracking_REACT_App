
import pandas as pd
import numpy as np

# API_CONNECTIONS/serializers.py

from rest_framework import serializers
from .models import ALGO_BALANCE, COMMITMENT, TRADE_HISTORY_FILE, USER_INFORMATION, ACCOUNT_LINKS, DEVELOPMENT_STRATEGY_DB


class DEVELOPMENT_STRATEGY_DB_SERALIZER(serializers.ModelSerializer):
    class Meta:
        model = DEVELOPMENT_STRATEGY_DB
        fields = '__all__' 


class ACCOUNT_LINKS_SERALIZER(serializers.ModelSerializer):
    class Meta:
        model = ACCOUNT_LINKS
        fields = '__all__' 


class ALGO_BALANCE_SERALIZER(serializers.ModelSerializer):
    class Meta:
        model = ALGO_BALANCE
        fields = '__all__' 


class COMMITMENT_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = COMMITMENT
        fields = '__all__'




class TRADE_HISTORY_FILE_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = TRADE_HISTORY_FILE
        fields = '__all__'


class USER_INFORMATION_SERIALIZER(serializers.ModelSerializer):
    class Meta:
        model = USER_INFORMATION
        fields = '__all__'


class DATAFRAME_SERIALIZER(serializers.BaseSerializer):
    def to_representation(self, instance):
        """
        Convert the pandas DataFrame to a list of dictionaries
        suitable for JSON serialization.
        """
        if isinstance(instance, pd.DataFrame):
            # Convert DataFrame to a list of dictionaries
            return instance.to_dict(orient='records')
        raise TypeError("Expected a pandas DataFrame as input")