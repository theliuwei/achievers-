from rest_framework import serializers

from brands.models import Brand
from company.models import CompanyAbout, CompanyContact, ContactPerson
from products.models import Product, ProductCategory, ProductImage

from .models import Customer, Inquiry, Quotation, QuotationItem


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = [
            'id',
            'name',
            'slug',
            'short_name',
            'description',
            'website',
            'sort_order',
            'is_active',
            'created_at',
            'updated_at',
        ]


class ProductCategorySerializer(serializers.ModelSerializer):
    brand_detail = BrandSerializer(source='brand', read_only=True)

    class Meta:
        model = ProductCategory
        fields = [
            'id',
            'brand',
            'brand_detail',
            'parent',
            'name',
            'slug',
            'description',
            'external_slug',
            'sort_order',
            'is_active',
            'created_at',
            'updated_at',
        ]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'alt_text', 'sort_order', 'is_primary']


class ProductSerializer(serializers.ModelSerializer):
    category_detail = ProductCategorySerializer(source='category', read_only=True)
    brand = BrandSerializer(source='category.brand', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'sku',
            'name',
            'slug',
            'summary',
            'description',
            'attributes',
            'origin_country',
            'source_url',
            'external_id',
            'status',
            'sort_order',
            'category',
            'category_detail',
            'brand',
            'images',
            'created_at',
            'updated_at',
        ]


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id',
            'created_at',
            'updated_at',
            'tenant',
            'name',
            'company_name',
            'country',
            'email',
            'phone',
            'whatsapp',
            'source',
            'level',
            'notes',
            'owner',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = [
            'id',
            'created_at',
            'updated_at',
            'tenant',
            'customer',
            'subject',
            'product_name',
            'message',
            'country',
            'source',
            'status',
            'assignee',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuotationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationItem
        fields = [
            'id',
            'created_at',
            'updated_at',
            'quotation',
            'product',
            'product_name',
            'sku',
            'quantity',
            'unit_price',
            'total_price',
            'remark',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuotationSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True, read_only=True)

    class Meta:
        model = Quotation
        fields = [
            'id',
            'created_at',
            'updated_at',
            'tenant',
            'customer',
            'inquiry',
            'quote_no',
            'currency',
            'total_amount',
            'trade_term',
            'status',
            'valid_until',
            'owner',
            'items',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'items']


class CompanyAboutSerializer(serializers.ModelSerializer):
    hero_image = serializers.SerializerMethodField()

    class Meta:
        model = CompanyAbout
        fields = [
            'id',
            'company_name',
            'company_name_zh',
            'slogan',
            'business_type',
            'main_market',
            'year_established',
            'employees_range',
            'annual_sales_range',
            'export_percentage',
            'main_brands_text',
            'highlight_pillars',
            'content_introduction',
            'content_history',
            'content_service',
            'content_team',
            'legal_disclaimer',
            'contact_person',
            'contact_phone',
            'contact_email',
            'offices_description',
            'profile_video_url',
            'hero_image',
            'updated_at',
        ]

    def get_hero_image(self, obj: CompanyAbout):
        if not obj.hero_image:
            return None
        request = self.context.get('request')
        url = obj.hero_image.url
        if request:
            return request.build_absolute_uri(url)
        return url


class ContactPersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactPerson
        fields = [
            'id',
            'name',
            'job_title',
            'business_phone',
            'whatsapp',
            'wechat',
            'email',
            'sort_order',
        ]


class CompanyContactSerializer(serializers.ModelSerializer):
    persons = serializers.SerializerMethodField()

    class Meta:
        model = CompanyContact
        fields = [
            'id',
            'company_name',
            'registered_address',
            'factory_address',
            'work_hours',
            'business_phone_note',
            'inquiry_hint',
            'persons',
            'updated_at',
        ]

    def get_persons(self, obj: CompanyContact):
        qs = obj.persons.filter(is_active=True).order_by('sort_order', 'id')
        return ContactPersonSerializer(qs, many=True, context=self.context).data
