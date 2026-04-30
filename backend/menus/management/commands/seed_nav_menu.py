from django.core.management.base import BaseCommand

from menus.models import NavMenuItem


class Command(BaseCommand):
    help = '写入默认后台导航菜单（树形；系统设置下含子菜单）'

    def handle(self, *args, **options):
        # 移除旧版「系统概览」叶子，当前菜单以明确业务模块为主。
        NavMenuItem.objects.filter(path='/admin/settings').delete()

        root_menus = [
            ('/admin', '工作台', 'DashboardOutlined', '', 0),
            ('/admin/companies', '公司管理', 'BankOutlined', 'tenants.view', 1),
            ('/admin/members', '成员管理', 'TeamOutlined', 'members.view', 2),
            ('/admin/products', '产品管理', 'ShoppingOutlined', 'products.view', 3),
            ('/admin/inquiries', '询盘管理', 'MessageOutlined', 'inquiries.view', 4),
            ('/admin/customers', '客户管理', 'ContactsOutlined', 'customers.view', 5),
            ('/admin/quotations', '报价管理', 'FileTextOutlined', 'quotations.view', 6),
        ]

        for path, title, icon, perm, sort in root_menus:
            obj, created = NavMenuItem.objects.update_or_create(
                parent=None,
                path=path,
                defaults={
                    'title': title,
                    'icon': icon,
                    'permission_code': perm,
                    'sort_order': sort,
                    'is_active': True,
                },
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'{"创建" if created else "更新"} 菜单: {obj.title} ({obj.path})'
                )
            )

        settings_root, c1 = NavMenuItem.objects.update_or_create(
            parent=None,
            title='系统设置',
            path='',
            defaults={
                'icon': 'SettingOutlined',
                'permission_code': 'users.view_rbac',
                'sort_order': 20,
                'is_active': True,
            },
        )
        self.stdout.write(
            self.style.SUCCESS(
                f'{"创建" if c1 else "更新"} 分组: {settings_root.title}（子菜单见下）'
            )
        )

        children = [
            (
                '/admin/settings/menus',
                '菜单管理',
                'MenuOutlined',
                'users.view_rbac',
                0,
            ),
            (
                '/admin/settings/roles',
                '角色管理',
                'TeamOutlined',
                'users.view_rbac',
                1,
            ),
            (
                '/admin/settings/users',
                '用户管理',
                'UserOutlined',
                'users.view_rbac',
                2,
            ),
            (
                '/admin/settings/approvals',
                '审批管理',
                'AuditOutlined',
                'users.approve_registrations',
                3,
            ),
            (
                '/admin/settings/vat',
                'VAT 税率',
                'PercentageOutlined',
                'vat.view',
                4,
            ),
            (
                '/admin/settings/consents',
                '同意记录',
                'SafetyCertificateOutlined',
                'consent.view',
                5,
            ),
        ]

        for path, title, icon, perm, sort in children:
            obj, created = NavMenuItem.objects.update_or_create(
                parent=settings_root,
                path=path,
                defaults={
                    'title': title,
                    'icon': icon,
                    'permission_code': perm,
                    'sort_order': sort,
                    'is_active': True,
                },
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'{"创建" if created else "更新"} 子菜单: {obj.title} ({obj.path})'
                )
            )

        self.stdout.write(
            self.style.NOTICE(
                '菜单已按「外贸 SaaS 后台」结构初始化；重复执行会更新，不会重复插入。'
            )
        )
