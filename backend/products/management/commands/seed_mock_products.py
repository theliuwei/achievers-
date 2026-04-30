from django.core.management.base import BaseCommand

from brands.models import Brand
from products.models import Product, ProductCategory


BRANDS = [
    {
        'name': 'Allen Bradley',
        'slug': 'allen-bradley',
        'short_name': 'AB',
        'description': 'Rockwell Automation 旗下工业自动化品牌，覆盖 PLC、变频器与工业网络设备。',
        'website': 'https://www.rockwellautomation.com/',
        'sort_order': 10,
    },
    {
        'name': 'Siemens',
        'slug': 'siemens',
        'short_name': 'Siemens',
        'description': '工业自动化与数字化解决方案品牌，常用于 PLC、HMI、驱动和低压控制。',
        'website': 'https://www.siemens.com/',
        'sort_order': 20,
    },
    {
        'name': 'Schneider Electric',
        'slug': 'schneider-electric',
        'short_name': 'Schneider',
        'description': '能源管理与自动化产品品牌，覆盖断路器、接触器、PLC 与电源产品。',
        'website': 'https://www.se.com/',
        'sort_order': 30,
    },
]

CATEGORIES = [
    {
        'brand_slug': 'allen-bradley',
        'name': 'PLC Modules',
        'slug': 'allen-bradley-plc-modules',
        'description': 'ControlLogix / CompactLogix 系列 CPU、I/O 与通讯模块。',
        'sort_order': 10,
    },
    {
        'brand_slug': 'allen-bradley',
        'name': 'PowerFlex Drives',
        'slug': 'allen-bradley-powerflex-drives',
        'description': 'PowerFlex 系列交流变频器与驱动配件。',
        'sort_order': 20,
    },
    {
        'brand_slug': 'siemens',
        'name': 'SIMATIC S7',
        'slug': 'siemens-simatic-s7',
        'description': 'SIMATIC S7-1200 / S7-1500 控制器、模块与附件。',
        'sort_order': 10,
    },
    {
        'brand_slug': 'siemens',
        'name': 'SINAMICS Drives',
        'slug': 'siemens-sinamics-drives',
        'description': 'SINAMICS 系列驱动器、功率模块与控制单元。',
        'sort_order': 20,
    },
    {
        'brand_slug': 'schneider-electric',
        'name': 'Circuit Breakers',
        'slug': 'schneider-circuit-breakers',
        'description': 'EasyPact / ComPact 系列断路器与保护开关。',
        'sort_order': 10,
    },
]

PRODUCTS = [
    {
        'category_slug': 'allen-bradley-plc-modules',
        'sku': '1756-L83E',
        'name': 'Allen Bradley 1756-L83E ControlLogix Controller',
        'slug': 'allen-bradley-1756-l83e-controllogix-controller',
        'summary': 'ControlLogix 5580 控制器，内置 EtherNet/IP 通讯接口。',
        'description': '适用于中大型自动化系统，支持高速控制、运动控制和 EtherNet/IP 网络通信。',
        'attributes': {'memory': '10 MB', 'network': 'EtherNet/IP', 'series': 'ControlLogix 5580'},
        'origin_country': 'USA',
        'status': Product.Status.ACTIVE,
        'sort_order': 10,
    },
    {
        'category_slug': 'allen-bradley-plc-modules',
        'sku': '1756-IF16',
        'name': 'Allen Bradley 1756-IF16 Analog Input Module',
        'slug': 'allen-bradley-1756-if16-analog-input-module',
        'summary': 'ControlLogix 16 通道模拟量输入模块。',
        'description': '支持电压/电流模拟量输入，适合过程控制与设备监测场景。',
        'attributes': {'channels': 16, 'signal': 'Voltage / Current', 'series': 'ControlLogix'},
        'origin_country': 'USA',
        'status': Product.Status.ACTIVE,
        'sort_order': 20,
    },
    {
        'category_slug': 'allen-bradley-powerflex-drives',
        'sku': '25B-D010N104',
        'name': 'Allen Bradley PowerFlex 525 AC Drive 5.5kW',
        'slug': 'allen-bradley-powerflex-525-25b-d010n104',
        'summary': 'PowerFlex 525 紧凑型交流变频器，适用于通用电机控制。',
        'description': '支持 EtherNet/IP、模块化设计和 USB 配置，便于现场安装与维护。',
        'attributes': {'power': '5.5 kW', 'voltage': '480 VAC', 'series': 'PowerFlex 525'},
        'origin_country': 'USA',
        'status': Product.Status.ACTIVE,
        'sort_order': 10,
    },
    {
        'category_slug': 'siemens-simatic-s7',
        'sku': '6ES7215-1AG40-0XB0',
        'name': 'Siemens SIMATIC S7-1200 CPU 1215C DC/DC/DC',
        'slug': 'siemens-simatic-s7-1200-cpu-1215c-dc-dc-dc',
        'summary': 'S7-1200 CPU 1215C，紧凑型 PLC 控制器。',
        'description': '集成数字量和模拟量 I/O，支持 PROFINET 通讯，适合小型自动化设备。',
        'attributes': {'cpu': '1215C', 'power_supply': '24 VDC', 'communication': 'PROFINET'},
        'origin_country': 'Germany',
        'status': Product.Status.ACTIVE,
        'sort_order': 10,
    },
    {
        'category_slug': 'siemens-simatic-s7',
        'sku': '6ES7521-1BH00-0AB0',
        'name': 'Siemens SIMATIC S7-1500 Digital Input Module DI 16x24VDC',
        'slug': 'siemens-simatic-s7-1500-di-16x24vdc',
        'summary': 'S7-1500 16 点 24VDC 数字量输入模块。',
        'description': '用于 SIMATIC S7-1500 控制系统，支持标准数字量采集。',
        'attributes': {'channels': 16, 'signal': '24 VDC', 'series': 'S7-1500'},
        'origin_country': 'Germany',
        'status': Product.Status.ACTIVE,
        'sort_order': 20,
    },
    {
        'category_slug': 'siemens-sinamics-drives',
        'sku': '6SL3210-1KE18-8UF1',
        'name': 'Siemens SINAMICS G120C Converter 4kW',
        'slug': 'siemens-sinamics-g120c-4kw-converter',
        'summary': 'SINAMICS G120C 紧凑型变频器，额定功率 4kW。',
        'description': '适用于输送、泵、风机等通用驱动应用，支持多种工业通讯方式。',
        'attributes': {'power': '4 kW', 'voltage': '3AC 380-480V', 'series': 'SINAMICS G120C'},
        'origin_country': 'Germany',
        'status': Product.Status.DRAFT,
        'sort_order': 10,
    },
    {
        'category_slug': 'schneider-circuit-breakers',
        'sku': 'LV510305',
        'name': 'Schneider Electric ComPact NSX100F Circuit Breaker',
        'slug': 'schneider-compact-nsx100f-circuit-breaker',
        'summary': 'ComPact NSX100F 塑壳断路器，适用于低压配电保护。',
        'description': '具有可靠的短路和过载保护能力，可用于配电柜、控制柜和工业现场。',
        'attributes': {'rated_current': '100 A', 'breaking_capacity': '36 kA', 'series': 'ComPact NSX'},
        'origin_country': 'France',
        'status': Product.Status.ACTIVE,
        'sort_order': 10,
    },
    {
        'category_slug': 'schneider-circuit-breakers',
        'sku': 'LC1D32M7',
        'name': 'Schneider Electric TeSys D Contactor 32A',
        'slug': 'schneider-tesys-d-contactor-lc1d32m7',
        'summary': 'TeSys D 系列交流接触器，额定电流 32A。',
        'description': '适用于电机控制、电气柜和自动化控制回路，线圈电压 220VAC。',
        'attributes': {'rated_current': '32 A', 'coil_voltage': '220 VAC', 'series': 'TeSys D'},
        'origin_country': 'France',
        'status': Product.Status.ARCHIVED,
        'sort_order': 20,
    },
]

ORIGIN_BY_BRAND = {
    'allen-bradley': 'USA',
    'siemens': 'Germany',
    'schneider-electric': 'France',
}

STATUS_ROTATION = [
    Product.Status.ACTIVE,
    Product.Status.ACTIVE,
    Product.Status.DRAFT,
    Product.Status.ACTIVE,
    Product.Status.ARCHIVED,
]


def _build_extra_products(total_target: int = 50):
    base_count = len(PRODUCTS)
    if base_count >= total_target:
        return []

    category_slugs = [item['slug'] for item in CATEGORIES]
    category_to_brand = {
        item['slug']: item['brand_slug']
        for item in CATEGORIES
    }
    extras = []
    for number in range(base_count + 1, total_target + 1):
        category_slug = category_slugs[(number - 1) % len(category_slugs)]
        brand_slug = category_to_brand[category_slug]
        sku = f'MOCK-P-{number:03d}'
        slug = f'mock-product-{number:03d}'
        status = STATUS_ROTATION[(number - 1) % len(STATUS_ROTATION)]
        extras.append(
            {
                'category_slug': category_slug,
                'sku': sku,
                'name': f'Mock Product {number:03d}',
                'slug': slug,
                'summary': f'Industrial automation mock product #{number:03d}.',
                'description': (
                    f'This is mock product #{number:03d} for testing list, filter, '
                    'form editing and i18n display behaviors.'
                ),
                'attributes': {
                    'series': f'Series-{(number - 1) % 8 + 1}',
                    'voltage': f'{220 + ((number - 1) % 4) * 110} VAC',
                    'channel_count': (number - 1) % 16 + 1,
                },
                'origin_country': ORIGIN_BY_BRAND.get(brand_slug, 'N/A'),
                'status': status,
                'sort_order': 100 + number,
            }
        )
    return extras


class Command(BaseCommand):
    help = '写入产品管理 mock 数据（Brand / ProductCategory / Product），可重复执行。'

    def handle(self, *args, **options):
        all_products = PRODUCTS + _build_extra_products(total_target=50)
        created_brands = 0
        created_categories = 0
        created_products = 0
        updated_products = 0

        brands_by_slug = {}
        for item in BRANDS:
            brand, created = Brand.objects.update_or_create(
                slug=item['slug'],
                defaults={
                    'name': item['name'],
                    'short_name': item['short_name'],
                    'description': item['description'],
                    'website': item['website'],
                    'sort_order': item['sort_order'],
                    'is_active': True,
                },
            )
            brands_by_slug[brand.slug] = brand
            created_brands += int(created)

        categories_by_slug = {}
        for item in CATEGORIES:
            brand = brands_by_slug[item['brand_slug']]
            category, created = ProductCategory.objects.update_or_create(
                brand=brand,
                slug=item['slug'],
                defaults={
                    'name': item['name'],
                    'description': item['description'],
                    'sort_order': item['sort_order'],
                    'is_active': True,
                    'external_slug': '',
                },
            )
            categories_by_slug[category.slug] = category
            created_categories += int(created)

        for item in all_products:
            category = categories_by_slug[item['category_slug']]
            _, created = Product.objects.update_or_create(
                slug=item['slug'],
                defaults={
                    'category': category,
                    'sku': item['sku'],
                    'name': item['name'],
                    'summary': item['summary'],
                    'description': item['description'],
                    'attributes': item['attributes'],
                    'origin_country': item['origin_country'],
                    'source_url': '',
                    'external_id': f"MOCK-{item['sku']}",
                    'status': item['status'],
                    'sort_order': item['sort_order'],
                },
            )
            created_products += int(created)
            updated_products += int(not created)

        self.stdout.write(
            self.style.SUCCESS(
                '产品 mock 数据完成：'
                f'新增品牌 {created_brands} 个，新增类目 {created_categories} 个，'
                f'新增产品 {created_products} 个，更新产品 {updated_products} 个，'
                f'总目标 {len(all_products)} 条。'
            )
        )
