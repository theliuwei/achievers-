from django.contrib import admin

from .models import (
    Product,
    ProductCategory,
    ProductCategoryTranslation,
    ProductImage,
    ProductLocalizedImage,
    ProductTranslation,
)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0


class ProductCategoryTranslationInline(admin.TabularInline):
    model = ProductCategoryTranslation
    extra = 0


class ProductTranslationInline(admin.TabularInline):
    model = ProductTranslation
    extra = 0


class ProductLocalizedImageInline(admin.TabularInline):
    model = ProductLocalizedImage
    extra = 0


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'parent', 'sort_order', 'is_active', 'updated_at')
    list_filter = ('brand', 'is_active')
    search_fields = ('name', 'slug', 'external_slug')
    prepopulated_fields = {'slug': ('name',)}
    raw_id_fields = ('parent',)
    inlines = [ProductCategoryTranslationInline]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('sku', 'name', 'category', 'status', 'sort_order', 'updated_at')
    list_filter = ('status', 'category__brand')
    search_fields = ('sku', 'name', 'slug', 'external_id')
    prepopulated_fields = {'slug': ('name',)}
    raw_id_fields = ('category',)
    inlines = [ProductImageInline, ProductTranslationInline, ProductLocalizedImageInline]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'sort_order', 'is_primary', 'image_url')
    list_filter = ('is_primary',)
    search_fields = ('product__name', 'image_url')


@admin.register(ProductCategoryTranslation)
class ProductCategoryTranslationAdmin(admin.ModelAdmin):
    list_display = ('category', 'language', 'name', 'updated_at')
    list_filter = ('language',)
    search_fields = ('name', 'seo_title', 'category__name')


@admin.register(ProductTranslation)
class ProductTranslationAdmin(admin.ModelAdmin):
    list_display = ('product', 'language', 'name', 'updated_at')
    list_filter = ('language',)
    search_fields = ('name', 'seo_title', 'product__name', 'product__sku')


@admin.register(ProductLocalizedImage)
class ProductLocalizedImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'language', 'sort_order', 'is_primary', 'image_url')
    list_filter = ('language', 'is_primary')
    search_fields = ('product__name', 'image_url', 'alt_text')
