from django.core.management import call_command
from django.core.management.base import BaseCommand

from api.models import Customer
from users.models import MembershipStatus, Tenant, TenantMembership


COUNTRIES = [
    'United States',
    'Germany',
    'United Kingdom',
    'France',
    'Italy',
    'Spain',
    'Netherlands',
    'Poland',
    'Turkey',
    'Brazil',
    'Mexico',
    'India',
    'Vietnam',
    'Thailand',
    'Indonesia',
    'Malaysia',
    'Australia',
    'South Africa',
]

SOURCES = ['官网', 'Google Ads', 'LinkedIn', '展会', '老客户介绍', 'Alibaba', 'WhatsApp', '邮件营销']

CUSTOMER_COMPANIES = [
    'Northstar Industrial Supply',
    'Rhine Automation GmbH',
    'Evergreen Control Systems',
    'Pacific Machinery Parts',
    'BluePeak Engineering',
    'Apex Factory Solutions',
    'Global Process Instruments',
    'MetroLine Automation',
    'Orion Power Components',
    'Vertex Manufacturing',
    'Summit Trade Group',
    'Harbor Electrical Supply',
    'Prime Motion Controls',
    'EuroTech Equipment',
    'Atlas Industrial Service',
    'Nova Process Automation',
    'Crescent Energy Systems',
    'BrightWave Technologies',
    'Pioneer Maintenance Ltd',
    'Delta Controls Trading',
    'Fusion Automation Parts',
    'SolidBridge Engineering',
    'Quantum Factory Supply',
    'Amber Industrial Group',
    'Sterling Process Control',
    'Vector Plant Services',
    'Mercury Equipment Co',
    'OakField Engineering',
    'Falcon Automation Ltd',
    'Terra Industrial Parts',
    'Cobalt Motion Systems',
    'Horizon Electric Supply',
    'Granite Process Solutions',
    'SilverLine Manufacturing',
    'Nexus Plant Technology',
    'Maritime Control Parts',
    'Redwood Industrial Trade',
    'Zenith Automation Group',
    'Polar Factory Systems',
    'Liberty Machinery Supply',
    'Vista Instrumentation',
    'CoreLink Industrial',
    'IronGate Engineering',
    'GreenField Energy Parts',
    'Sapphire Control Systems',
    'Westport Process Supply',
    'Matrix Manufacturing Parts',
    'Beacon Automation',
    'Royal Industrial Components',
    'Union Electric Trading',
]

CONTACT_NAMES = [
    'James Miller',
    'Anna Schmidt',
    'William Johnson',
    'Sophie Martin',
    'Luca Rossi',
    'Carlos Garcia',
    'Emma Wilson',
    'Piotr Kowalski',
    'Mehmet Yilmaz',
    'Lucas Silva',
    'Diego Hernandez',
    'Arjun Patel',
    'Nguyen Minh',
    'Niran Chai',
    'Budi Santoso',
    'Aisyah Rahman',
    'Oliver Brown',
    'Thabo Mokoena',
    'Michael Davis',
    'Marie Dubois',
]

TENANT_CODES = [
    'ningbo_huaxin_export',
    'shenzhen_bright_tech',
    'guangzhou_ocean_trade',
    'yiwu_global_supply',
    'hangzhou_silkroad',
    'xiamen_sea_star',
    'qingdao_harbor_machinery',
    'suzhou_precision_export',
    'foshan_homeware',
    'wenzhou_new_energy',
    'dongguan_smart_factory',
]


class Command(BaseCommand):
    help = '写入客户管理 mock 数据（Customer）50 条，可重复执行。'

    def handle(self, *args, **options):
        call_command('seed_mock_companies')
        call_command('seed_mock_partner_accounts')

        tenants = {
            tenant.code: tenant
            for tenant in Tenant.objects.filter(code__in=TENANT_CODES, is_deleted=False)
        }
        owners_by_tenant_id = {
            membership.tenant_id: membership.user
            for membership in TenantMembership.objects.select_related('user', 'tenant').filter(
                tenant__code__in=TENANT_CODES,
                status=MembershipStatus.ACTIVE,
                is_deleted=False,
                user__is_active=True,
            )
        }

        created_count = 0
        updated_count = 0

        for index, company_name in enumerate(CUSTOMER_COMPANIES, start=1):
            tenant = tenants[TENANT_CODES[(index - 1) % len(TENANT_CODES)]]
            owner = owners_by_tenant_id.get(tenant.id)
            contact_name = CONTACT_NAMES[(index - 1) % len(CONTACT_NAMES)]
            country = COUNTRIES[(index - 1) % len(COUNTRIES)]
            source = SOURCES[(index - 1) % len(SOURCES)]
            email = f'customer{index:02d}@example-buyer.test'
            level = Customer.Level.IMPORTANT if index % 7 == 0 or index % 11 == 0 else Customer.Level.NORMAL

            _, created = Customer.objects.update_or_create(
                tenant=tenant,
                email=email,
                defaults={
                    'name': contact_name,
                    'company_name': company_name,
                    'country': country,
                    'phone': f'+1-555-01{index:02d}',
                    'whatsapp': f'+86 138 9000 {index:04d}',
                    'source': source,
                    'level': level,
                    'notes': (
                        f'Mock customer #{index:02d}; interested in PLC, drive and spare parts. '
                        f'Preferred contact channel: {source}.'
                    ),
                    'owner': owner,
                },
            )
            created_count += int(created)
            updated_count += int(not created)

        self.stdout.write(
            self.style.SUCCESS(
                f'客户 mock 数据完成：新增 {created_count} 条，更新 {updated_count} 条，共 {len(CUSTOMER_COMPANIES)} 条。'
            )
        )
