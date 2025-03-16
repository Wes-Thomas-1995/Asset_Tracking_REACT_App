
import pandas as pd
import numpy as np

# API_CONNECTIONS/serializers.py

from rest_framework import serializers


class DATAFRAME_SERIALIZER(serializers.BaseSerializer):
    def to_representation(self, instance):
        if isinstance(instance, pd.DataFrame):
            # Convert DataFrame to a list of dictionaries
            return instance.to_dict(orient='records')
        raise TypeError("Expected a pandas DataFrame as input")