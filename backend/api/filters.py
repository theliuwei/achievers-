import django_filters

from products.models import Product, ProductCategory


class ProductCategoryFilter(django_filters.FilterSet):
    brand = django_filters.NumberFilter(field_name='brand_id')
    brand_slug = django_filters.CharFilter(field_name='brand__slug')
    slug = django_filters.CharFilter(field_name='slug')

    class Meta:
        model = ProductCategory
        fields = ['brand', 'brand_slug', 'slug']


class ProductFilter(django_filters.FilterSet):
    brand = django_filters.NumberFilter(field_name='category__brand_id')
    brand_slug = django_filters.CharFilter(field_name='category__brand__slug')
    category = django_filters.NumberFilter(field_name='category_id')
    category_slug = django_filters.CharFilter(field_name='category__slug')

    class Meta:
        model = Product
        fields = ['brand', 'brand_slug', 'category', 'category_slug']
