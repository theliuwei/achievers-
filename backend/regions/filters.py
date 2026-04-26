import django_filters

from .models import City, StateProvince


class StateProvinceFilter(django_filters.FilterSet):
    country = django_filters.NumberFilter(field_name='country_id')

    class Meta:
        model = StateProvince
        fields = ['country']


class CityFilter(django_filters.FilterSet):
    state = django_filters.NumberFilter(field_name='state_id')

    class Meta:
        model = City
        fields = ['state']
