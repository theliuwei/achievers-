from decimal import Decimal, ROUND_HALF_UP

from rest_framework import serializers

from brands.models import Brand
from company.models import CompanyAbout, CompanyContact, ContactPerson
from products.models import (
    Product,
    ProductCategory,
    ProductCategoryTranslation,
    ProductImage,
    ProductTranslation,
)

from .models import ConsentLog, Customer, Inquiry, Quotation, QuotationItem, VATRate


def _normalize_language_code(raw: str | None) -> str:
    value = (raw or '').strip().lower()
    if not value:
        return 'en'
    # Accept-Language may include region, e.g. zh-CN / en-US.
    if value.startswith('zh'):
        return 'zh-hans'
    if '-' in value:
        return value.split('-', 1)[0]
    return value


def _pick_translation(translations, language: str):
    if not translations:
        return None
    # 1) exact requested language
    for item in translations:
        if item.language == language:
            return item
    # 2) english fallback
    for item in translations:
        if item.language == 'en':
            return item
    # 3) any available translation
    return translations[0]


def _upsert_translations(instance, translations_payload, model_cls, foreign_key_name: str):
    if not translations_payload:
        return
    for item in translations_payload:
        language = _normalize_language_code(item.get('language'))
        if not language:
            continue
        defaults = {
            'name': item.get('name', ''),
            'description': item.get('description', ''),
        }
        if model_cls is ProductTranslation:
            defaults['summary'] = item.get('summary', '')
        defaults['seo_title'] = item.get('seo_title', '')
        defaults['seo_description'] = item.get('seo_description', '')
        model_cls.objects.update_or_create(
            **{foreign_key_name: instance, 'language': language},
            defaults=defaults,
        )


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


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'alt_text', 'sort_order', 'is_primary']


class ProductSerializer(serializers.ModelSerializer):
    category_detail = serializers.SerializerMethodField()
    category_display = serializers.SerializerMethodField()
    brand = BrandSerializer(source='category.brand', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    localized_name = serializers.SerializerMethodField()
    localized_summary = serializers.SerializerMethodField()
    localized_description = serializers.SerializerMethodField()
    translations = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        write_only=True,
    )

    class Meta:
        model = Product
        fields = [
            'id',
            'sku',
            'name',
            'localized_name',
            'slug',
            'summary',
            'localized_summary',
            'description',
            'localized_description',
            'attributes',
            'origin_country',
            'source_url',
            'external_id',
            'status',
            'sort_order',
            'category',
            'category_display',
            'category_detail',
            'brand',
            'images',
            'translations',
            'created_at',
            'updated_at',
        ]

    def get_category_display(self, obj):
        request = self.context.get('request')
        language = _normalize_language_code(getattr(request, 'LANGUAGE_CODE', None))
        cached = getattr(obj.category, '_prefetched_objects_cache', {})
        category_translations = list(
            cached.get('translations') or obj.category.translations.all()
        )
        category_translation = _pick_translation(category_translations, language)
        if category_translation and category_translation.name:
            return category_translation.name
        return obj.category.name

    def get_category_detail(self, obj):
        return ProductCategorySerializer(obj.category, context=self.context).data

    def _get_translation(self, obj):
        request = self.context.get('request')
        language = _normalize_language_code(getattr(request, 'LANGUAGE_CODE', None))
        cached = getattr(obj, '_prefetched_objects_cache', {})
        translations = list(cached.get('translations') or obj.translations.all())
        return _pick_translation(translations, language)

    def get_localized_name(self, obj):
        translation = self._get_translation(obj)
        return translation.name if translation and translation.name else obj.name

    def get_localized_summary(self, obj):
        translation = self._get_translation(obj)
        return (
            translation.summary
            if translation and translation.summary
            else obj.summary
        )

    def get_localized_description(self, obj):
        translation = self._get_translation(obj)
        return (
            translation.description
            if translation and translation.description
            else obj.description
        )

    def create(self, validated_data):
        translations_payload = validated_data.pop('translations', [])
        instance = super().create(validated_data)
        _upsert_translations(
            instance,
            translations_payload,
            ProductTranslation,
            'product',
        )
        return instance

    def update(self, instance, validated_data):
        translations_payload = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_payload is not None:
            _upsert_translations(
                instance,
                translations_payload,
                ProductTranslation,
                'product',
            )
        return instance


class ProductCategorySerializer(serializers.ModelSerializer):
    brand_detail = BrandSerializer(source='brand', read_only=True)
    parent_display = serializers.SerializerMethodField()
    localized_name = serializers.SerializerMethodField()
    localized_description = serializers.SerializerMethodField()
    translations = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        write_only=True,
    )

    class Meta:
        model = ProductCategory
        fields = [
            'id',
            'brand',
            'brand_detail',
            'parent',
            'parent_display',
            'name',
            'localized_name',
            'slug',
            'description',
            'localized_description',
            'external_slug',
            'sort_order',
            'is_active',
            'translations',
            'created_at',
            'updated_at',
        ]

    def get_parent_display(self, obj):
        if not obj.parent:
            return None
        return obj.parent.name

    def _get_translation(self, obj):
        request = self.context.get('request')
        language = _normalize_language_code(getattr(request, 'LANGUAGE_CODE', None))
        cached = getattr(obj, '_prefetched_objects_cache', {})
        translations = list(cached.get('translations') or obj.translations.all())
        return _pick_translation(translations, language)

    def get_localized_name(self, obj):
        translation = self._get_translation(obj)
        return translation.name if translation and translation.name else obj.name

    def get_localized_description(self, obj):
        translation = self._get_translation(obj)
        return (
            translation.description
            if translation and translation.description
            else obj.description
        )

    def create(self, validated_data):
        translations_payload = validated_data.pop('translations', [])
        instance = super().create(validated_data)
        _upsert_translations(
            instance,
            translations_payload,
            ProductCategoryTranslation,
            'category',
        )
        return instance

    def update(self, instance, validated_data):
        translations_payload = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_payload is not None:
            _upsert_translations(
                instance,
                translations_payload,
                ProductCategoryTranslation,
                'category',
            )
        return instance


class ProductTranslationSerializer(serializers.ModelSerializer):
    product_display = serializers.SerializerMethodField()

    class Meta:
        model = ProductTranslation
        fields = [
            'id',
            'created_at',
            'updated_at',
            'product',
            'product_display',
            'language',
            'name',
            'summary',
            'description',
            'seo_title',
            'seo_description',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'product_display']

    def get_product_display(self, obj):
        return obj.product.name


class ProductCategoryTranslationSerializer(serializers.ModelSerializer):
    category_display = serializers.SerializerMethodField()

    class Meta:
        model = ProductCategoryTranslation
        fields = [
            'id',
            'created_at',
            'updated_at',
            'category',
            'category_display',
            'language',
            'name',
            'description',
            'seo_title',
            'seo_description',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'category_display']

    def get_category_display(self, obj):
        return obj.category.name


class CustomerSerializer(serializers.ModelSerializer):
    tenant_display = serializers.SerializerMethodField()
    owner_display = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id',
            'created_at',
            'updated_at',
            'tenant',
            'tenant_display',
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
            'owner_display',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'tenant_display', 'owner_display']

    def get_tenant_display(self, obj):
        return obj.tenant.name

    def get_owner_display(self, obj):
        if not obj.owner:
            return None
        return obj.owner.username


class InquirySerializer(serializers.ModelSerializer):
    tenant_display = serializers.SerializerMethodField()
    customer_display = serializers.SerializerMethodField()
    assignee_display = serializers.SerializerMethodField()

    class Meta:
        model = Inquiry
        fields = [
            'id',
            'created_at',
            'updated_at',
            'tenant',
            'tenant_display',
            'customer',
            'customer_display',
            'subject',
            'product_name',
            'message',
            'country',
            'source',
            'status',
            'assignee',
            'assignee_display',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'tenant_display',
            'customer_display',
            'assignee_display',
        ]

    def get_tenant_display(self, obj):
        return obj.tenant.name

    def get_customer_display(self, obj):
        if not obj.customer:
            return None
        return obj.customer.name or obj.customer.company_name

    def get_assignee_display(self, obj):
        if not obj.assignee:
            return None
        return obj.assignee.username


class QuotationItemSerializer(serializers.ModelSerializer):
    quotation_display = serializers.SerializerMethodField()
    product_display = serializers.SerializerMethodField()

    class Meta:
        model = QuotationItem
        fields = [
            'id',
            'created_at',
            'updated_at',
            'quotation',
            'quotation_display',
            'product',
            'product_display',
            'product_name',
            'sku',
            'quantity',
            'unit_price',
            'total_price',
            'remark',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'quotation_display', 'product_display']

    def get_quotation_display(self, obj):
        return obj.quotation.quote_no

    def get_product_display(self, obj):
        if not obj.product:
            return None
        return obj.product.name


class QuotationSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True, read_only=True)
    tenant_display = serializers.SerializerMethodField()
    customer_display = serializers.SerializerMethodField()
    inquiry_display = serializers.SerializerMethodField()
    owner_display = serializers.SerializerMethodField()
    vat_rate_id = serializers.IntegerField(write_only=True, required=False)
    is_price_included = serializers.BooleanField(write_only=True, required=False)
    subtotal_amount = serializers.SerializerMethodField()
    tax_amount = serializers.SerializerMethodField()
    total_with_tax = serializers.SerializerMethodField()

    class Meta:
        model = Quotation
        fields = [
            'id',
            'created_at',
            'updated_at',
            'tenant',
            'tenant_display',
            'customer',
            'customer_display',
            'inquiry',
            'inquiry_display',
            'quote_no',
            'currency',
            'total_amount',
            'trade_term',
            'status',
            'valid_until',
            'owner',
            'owner_display',
            'vat_rate_id',
            'is_price_included',
            'subtotal_amount',
            'tax_amount',
            'total_with_tax',
            'items',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'tenant_display',
            'customer_display',
            'inquiry_display',
            'owner_display',
            'subtotal_amount',
            'tax_amount',
            'total_with_tax',
            'items',
        ]

    @staticmethod
    def _quantize(value: Decimal) -> Decimal:
        return value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    def _resolve_tax_rate(self, obj, validated_data=None) -> Decimal:
        payload = validated_data or {}
        vat_rate_id = payload.get('vat_rate_id')
        if not vat_rate_id:
            request = self.context.get('request')
            if request:
                vat_rate_id = request.query_params.get('vat_rate_id')
        if vat_rate_id:
            vat = VATRate.objects.filter(pk=vat_rate_id, is_active=True).first()
            if vat:
                return Decimal(vat.rate or 0)
        return Decimal('0')

    def _split_amounts(self, obj, validated_data=None):
        payload = validated_data or {}
        total = Decimal(payload.get('total_amount', getattr(obj, 'total_amount', 0)) or 0)
        total = self._quantize(total)
        tax_rate = self._resolve_tax_rate(obj, payload)
        included = payload.get('is_price_included')
        if included is None:
            request = self.context.get('request')
            if request:
                raw = request.query_params.get('is_price_included')
                included = str(raw).lower() in {'1', 'true', 'yes', 'on'}
            else:
                included = False
        if tax_rate <= 0:
            return total, Decimal('0.00'), total
        factor = Decimal('1') + (tax_rate / Decimal('100'))
        if included:
            subtotal = self._quantize(total / factor)
            tax = self._quantize(total - subtotal)
            gross = total
        else:
            subtotal = total
            tax = self._quantize(subtotal * (tax_rate / Decimal('100')))
            gross = self._quantize(subtotal + tax)
        return subtotal, tax, gross

    def get_tenant_display(self, obj):
        return obj.tenant.name

    def get_customer_display(self, obj):
        if not obj.customer:
            return None
        return obj.customer.name or obj.customer.company_name

    def get_inquiry_display(self, obj):
        if not obj.inquiry:
            return None
        return obj.inquiry.subject

    def get_owner_display(self, obj):
        if not obj.owner:
            return None
        return obj.owner.username

    def get_subtotal_amount(self, obj):
        subtotal, _, _ = self._split_amounts(obj)
        return subtotal

    def get_tax_amount(self, obj):
        _, tax, _ = self._split_amounts(obj)
        return tax

    def get_total_with_tax(self, obj):
        _, _, gross = self._split_amounts(obj)
        return gross

    def create(self, validated_data):
        validated_data.pop('vat_rate_id', None)
        validated_data.pop('is_price_included', None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('vat_rate_id', None)
        validated_data.pop('is_price_included', None)
        return super().update(instance, validated_data)


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


class VATRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VATRate
        fields = [
            'id',
            'created_at',
            'updated_at',
            'country_code',
            'name',
            'rate',
            'is_price_included_default',
            'effective_from',
            'effective_to',
            'is_active',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ConsentLogSerializer(serializers.ModelSerializer):
    tenant_display = serializers.SerializerMethodField()
    user_display = serializers.SerializerMethodField()

    class Meta:
        model = ConsentLog
        fields = [
            'id',
            'created_at',
            'updated_at',
            'tenant',
            'tenant_display',
            'user',
            'user_display',
            'consent_type',
            'action',
            'policy_version',
            'ip_address',
            'user_agent',
            'metadata',
        ]
        read_only_fields = fields

    def get_tenant_display(self, obj):
        if not obj.tenant:
            return None
        return obj.tenant.name

    def get_user_display(self, obj):
        if not obj.user:
            return None
        return obj.user.username
