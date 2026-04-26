from rest_framework import serializers

from .models import City, Country, StateProvince


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = (
            'id',
            'name_zh',
            'name_en',
            'iso_alpha_2',
            'iso_alpha_3',
            'phone_code',
            'sort_order',
            'is_active',
            'created_at',
            'updated_at',
        )


class StateProvinceSerializer(serializers.ModelSerializer):
    class Meta:
        model = StateProvince
        fields = (
            'id',
            'country',
            'name_zh',
            'name_en',
            'code',
            'sort_order',
            'is_active',
            'created_at',
            'updated_at',
        )


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = (
            'id',
            'state',
            'name_zh',
            'name_en',
            'sort_order',
            'is_active',
            'created_at',
            'updated_at',
        )
