from django.contrib import admin

from .models import Product, ProductCategory, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'parent', 'sort_order', 'is_active', 'updated_at')
    list_filter = ('brand', 'is_active')
    search_fields = ('name', 'slug', 'external_slug')
    prepopulated_fields = {'slug': ('name',)}
    raw_id_fields = ('parent',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('sku', 'name', 'category', 'status', 'sort_order', 'updated_at')
    list_filter = ('status', 'category__brand')
    search_fields = ('sku', 'name', 'slug', 'external_id')
    prepopulated_fields = {'slug': ('name',)}
    raw_id_fields = ('category',)
    inlines = [ProductImageInline]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'sort_order', 'is_primary', 'image_url')
    list_filter = ('is_primary',)
    search_fields = ('product__name', 'image_url')
