import uuid

import pytest
from rest_framework.test import APIClient

from api.models import ConsentLog
from brands.models import Brand
from products.models import Product, ProductCategory
from users.models import Tenant, UserInfo


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user():
    return UserInfo.objects.create_superuser(
        username='pytest_admin',
        password='Passw0rd!123',
        email='pytest_admin@example.com',
    )


@pytest.fixture
def authed_client(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def tenant():
    return Tenant.objects.create(
        name='Pytest Tenant',
        code=f'pytest-tenant-{uuid.uuid4().hex[:8]}',
        is_active=True,
    )


@pytest.fixture
def brand():
    return Brand.objects.create(
        name='Pytest Brand',
        slug=f'pytest-brand-{uuid.uuid4().hex[:8]}',
        is_active=True,
    )


@pytest.fixture
def category(brand):
    return ProductCategory.objects.create(
        brand=brand,
        name='Pytest Category',
        slug=f'pytest-category-{uuid.uuid4().hex[:8]}',
        is_active=True,
    )


@pytest.fixture
def product(category):
    return Product.objects.create(
        category=category,
        name='Pytest Product',
        slug=f'pytest-product-{uuid.uuid4().hex[:8]}',
        sku=f'PY-{uuid.uuid4().hex[:8]}',
        status=Product.Status.ACTIVE,
    )


def test_admin_product_crud(authed_client, category):
    create_payload = {
        'category': category.id,
        'name': 'Created Product',
        'slug': f'created-product-{uuid.uuid4().hex[:8]}',
        'sku': f'CP-{uuid.uuid4().hex[:8]}',
        'status': Product.Status.ACTIVE,
        'translations': [{'language': 'en', 'name': 'Created Product EN'}],
    }
    created = authed_client.post('/api/v1/admin-products/', create_payload, format='json')
    assert created.status_code == 201
    product_id = created.data['id']

    listed = authed_client.get('/api/v1/admin-products/?page=1&page_size=20')
    assert listed.status_code == 200
    assert listed.data['count'] >= 1

    detail = authed_client.get(f'/api/v1/admin-products/{product_id}/')
    assert detail.status_code == 200

    patched = authed_client.patch(
        f'/api/v1/admin-products/{product_id}/',
        {'summary': 'updated by pytest'},
        format='json',
    )
    assert patched.status_code == 200
    assert patched.data['summary'] == 'updated by pytest'

    deleted = authed_client.delete(f'/api/v1/admin-products/{product_id}/')
    assert deleted.status_code in (200, 204)


def test_admin_category_brand_crud(authed_client):
    brand_slug = f'pytest-brand-{uuid.uuid4().hex[:8]}'
    brand_resp = authed_client.post(
        '/api/v1/admin-brands/',
        {'name': 'Created Brand', 'slug': brand_slug, 'is_active': True},
        format='json',
    )
    assert brand_resp.status_code == 201
    brand_id = brand_resp.data['id']

    category_slug = f'pytest-cat-{uuid.uuid4().hex[:8]}'
    category_resp = authed_client.post(
        '/api/v1/admin-product-categories/',
        {
            'brand': brand_id,
            'name': 'Created Category',
            'slug': category_slug,
            'is_active': True,
            'translations': [{'language': 'en', 'name': 'Created Category EN'}],
        },
        format='json',
    )
    assert category_resp.status_code == 201
    category_id = category_resp.data['id']

    list_resp = authed_client.get('/api/v1/admin-product-categories/?page=1&page_size=20')
    assert list_resp.status_code == 200
    assert list_resp.data['count'] >= 1

    delete_category = authed_client.delete(f'/api/v1/admin-product-categories/{category_id}/')
    assert delete_category.status_code in (200, 204)
    delete_brand = authed_client.delete(f'/api/v1/admin-brands/{brand_id}/')
    assert delete_brand.status_code in (200, 204)


def test_business_crud_endpoints(authed_client, tenant, product, admin_user):
    customer_resp = authed_client.post(
        '/api/v1/customers/',
        {
            'tenant': tenant.id,
            'name': 'Pytest Customer',
            'company_name': 'Pytest Buyer LLC',
            'country': 'United States',
            'owner': admin_user.id,
            'level': 'normal',
        },
        format='json',
    )
    assert customer_resp.status_code == 201
    customer_id = customer_resp.data['id']

    inquiry_resp = authed_client.post(
        '/api/v1/inquiries/',
        {
            'tenant': tenant.id,
            'customer': customer_id,
            'subject': 'Need quotation',
            'status': 'new',
            'assignee': admin_user.id,
        },
        format='json',
    )
    assert inquiry_resp.status_code == 201
    inquiry_id = inquiry_resp.data['id']

    quotation_resp = authed_client.post(
        '/api/v1/quotations/',
        {
            'tenant': tenant.id,
            'customer': customer_id,
            'inquiry': inquiry_id,
            'quote_no': f'QT-{uuid.uuid4().hex[:8]}',
            'currency': 'USD',
            'total_amount': '1200.00',
            'status': 'draft',
            'owner': admin_user.id,
        },
        format='json',
    )
    assert quotation_resp.status_code == 201
    quotation_id = quotation_resp.data['id']

    item_resp = authed_client.post(
        '/api/v1/quotation-items/',
        {
            'quotation': quotation_id,
            'product': product.id,
            'product_name': product.name,
            'sku': product.sku,
            'quantity': 2,
            'unit_price': '100.00',
            'total_price': '200.00',
        },
        format='json',
    )
    assert item_resp.status_code == 201
    item_id = item_resp.data['id']

    for endpoint in [
        '/api/v1/customers/?page=1&page_size=20',
        '/api/v1/inquiries/?page=1&page_size=20',
        '/api/v1/quotations/?page=1&page_size=20',
        '/api/v1/quotation-items/?page=1&page_size=20',
    ]:
        listed = authed_client.get(endpoint)
        assert listed.status_code == 200
        assert listed.data['count'] >= 1

    assert authed_client.delete(f'/api/v1/quotation-items/{item_id}/').status_code in (200, 204)
    assert authed_client.delete(f'/api/v1/quotations/{quotation_id}/').status_code in (200, 204)
    assert authed_client.delete(f'/api/v1/inquiries/{inquiry_id}/').status_code in (200, 204)
    assert authed_client.delete(f'/api/v1/customers/{customer_id}/').status_code in (200, 204)


def test_vat_consent_and_gdpr_endpoints(authed_client, tenant, admin_user):
    vat_resp = authed_client.post(
        '/api/v1/vat-rates/',
        {
            'country_code': 'US',
            'name': 'US VAT',
            'rate': '7.50',
            'is_price_included_default': False,
            'effective_from': '2026-01-01',
            'is_active': True,
        },
        format='json',
    )
    assert vat_resp.status_code == 201
    vat_id = vat_resp.data['id']

    listed_vat = authed_client.get('/api/v1/vat-rates/?page=1&page_size=20')
    assert listed_vat.status_code == 200
    assert listed_vat.data['count'] >= 1

    ConsentLog.objects.create(
        tenant=tenant,
        user=admin_user,
        consent_type=ConsentLog.ConsentType.COOKIE,
        action=ConsentLog.Action.ACCEPTED,
        policy_version='v1',
    )
    consent_list = authed_client.get('/api/v1/consent-logs/?page=1&page_size=20')
    assert consent_list.status_code == 200
    assert consent_list.data['count'] >= 1

    gdpr_export = authed_client.get('/api/v1/gdpr/export/')
    assert gdpr_export.status_code == 200
    assert 'user' in gdpr_export.data

    assert authed_client.delete(f'/api/v1/vat-rates/{vat_id}/').status_code in (200, 204)
