from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.utils import timezone

from users.models import MembershipStatus, Role, Tenant, TenantMembership, UserKind


DEFAULT_PASSWORD = 'Achievers@123456'

MOCK_COMPANY_ACCOUNTS = [
    {
        'tenant_code': 'ningbo_huaxin_export',
        'tenant_name': '宁波华信进出口有限公司',
        'username': 'huaxin_admin',
        'email': 'admin@huaxin-export.test',
        'first_name': '华信',
        'last_name': '管理员',
        'phone': '+8613800001001',
        'title': '外贸负责人',
        'role_code': 'tenant_admin',
    },
    {
        'tenant_code': 'ningbo_huaxin_export',
        'tenant_name': '宁波华信进出口有限公司',
        'username': 'huaxin_sales',
        'email': 'sales@huaxin-export.test',
        'first_name': '华信',
        'last_name': '业务员',
        'phone': '+8613800001002',
        'title': '外贸业务员',
        'role_code': 'tenant_sales',
    },
    {
        'tenant_code': 'shenzhen_bright_tech',
        'tenant_name': '深圳博瑞特科技有限公司',
        'username': 'bright_admin',
        'email': 'admin@bright-tech.test',
        'first_name': '博瑞特',
        'last_name': '管理员',
        'phone': '+8613800002001',
        'title': '运营主管',
        'role_code': 'tenant_admin',
    },
    {
        'tenant_code': 'guangzhou_ocean_trade',
        'tenant_name': '广州远洋贸易有限公司',
        'username': 'ocean_sales',
        'email': 'sales@ocean-trade.test',
        'first_name': '远洋',
        'last_name': '业务员',
        'phone': '+8613800003001',
        'title': '询盘跟进',
        'role_code': 'tenant_sales',
    },
    {
        'tenant_code': 'dongguan_smart_factory',
        'tenant_name': '东莞智造工厂有限公司',
        'username': 'dongguan_product',
        'email': 'product@dg-smart-factory.test',
        'first_name': '东莞',
        'last_name': '产品员',
        'phone': '+8613800005001',
        'title': '产品资料维护',
        'role_code': 'tenant_product_manager',
    },
    {
        'tenant_code': 'yiwu_global_supply',
        'tenant_name': '义乌环球供应链有限公司',
        'username': 'yiwu_viewer',
        'email': 'viewer@yiwu-supply.test',
        'first_name': '义乌',
        'last_name': '只读',
        'phone': '+8613800004001',
        'title': '管理层查看',
        'role_code': 'tenant_viewer',
    },
]


class Command(BaseCommand):
    help = '写入合作公司测试账号，可重复执行。默认密码：Achievers@123456'

    def handle(self, *args, **options):
        call_command('seed_rbac')

        UserInfo = get_user_model()
        created_users = 0
        updated_users = 0
        created_memberships = 0
        now = timezone.now()

        fallback_role = Role.objects.filter(code='tenant_viewer', is_active=True).first()

        for item in MOCK_COMPANY_ACCOUNTS:
            tenant, _ = Tenant.objects.update_or_create(
                code=item['tenant_code'],
                defaults={
                    'name': item['tenant_name'],
                    'is_active': True,
                    'subscription_expires_at': now + timedelta(days=365),
                },
            )
            user, user_created = UserInfo.objects.update_or_create(
                username=item['username'],
                defaults={
                    'email': item['email'],
                    'first_name': item['first_name'],
                    'last_name': item['last_name'],
                    'phone': item['phone'],
                    'user_kind': UserKind.TENANT,
                    'default_tenant': tenant,
                    'is_active': True,
                    # 当前管理端接口使用 IsAdminUser；测试账号需允许进入后台页面。
                    'is_staff': True,
                },
            )
            user.set_password(DEFAULT_PASSWORD)
            user.save(update_fields=['password'])

            membership, membership_created = TenantMembership.objects.update_or_create(
                user=user,
                tenant=tenant,
                defaults={
                    'status': MembershipStatus.ACTIVE,
                    'title': item['title'],
                },
            )
            role = Role.objects.filter(code=item['role_code'], is_active=True).first() or fallback_role
            if role:
                membership.roles.set([role])

            created_users += int(user_created)
            updated_users += int(not user_created)
            created_memberships += int(membership_created)
            self.stdout.write(
                self.style.SUCCESS(
                    f"测试账号已就绪: {item['username']} / {item['email']} -> {tenant.name}"
                )
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'完成：新增用户 {created_users} 个，更新用户 {updated_users} 个，'
                f'新增成员关系 {created_memberships} 条；默认密码 {DEFAULT_PASSWORD}'
            )
        )
