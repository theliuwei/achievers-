from django.contrib import admin

from .models import City, Country, StateProvince


class StateProvinceInline(admin.TabularInline):
    model = StateProvince
    extra = 0
    fields = ('name_zh', 'name_en', 'code', 'sort_order', 'is_active')
    show_change_link = True


class CityInline(admin.TabularInline):
    model = City
    extra = 0
    fields = ('name_zh', 'name_en', 'sort_order', 'is_active')


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = (
        'name_zh',
        'name_en',
        'iso_alpha_2',
        'iso_alpha_3',
        'phone_code',
        'sort_order',
        'is_active',
    )
    list_filter = ('is_active',)
    search_fields = ('name_zh', 'name_en', 'iso_alpha_2', 'iso_alpha_3')
    ordering = ('sort_order', 'iso_alpha_2')
    inlines = [StateProvinceInline]


@admin.register(StateProvince)
class StateProvinceAdmin(admin.ModelAdmin):
    list_display = ('name_zh', 'name_en', 'country', 'code', 'sort_order', 'is_active')
    list_filter = ('country', 'is_active')
    search_fields = ('name_zh', 'name_en', 'code')
    ordering = ('country', 'sort_order', 'id')
    raw_id_fields = ('country',)
    inlines = [CityInline]


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('name_zh', 'name_en', 'state', 'sort_order', 'is_active')
    list_filter = ('state__country', 'is_active')
    search_fields = ('name_zh', 'name_en')
    ordering = ('state', 'sort_order', 'id')
    raw_id_fields = ('state',)
