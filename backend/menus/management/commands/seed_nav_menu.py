from django.core.management.base import BaseCommand

from menus.models import NavMenuItem


class Command(BaseCommand):
    help = '写入默认后台导航菜单（树形；系统设置下含子菜单）'

    def handle(self, *args, **options):
        # 移除旧版「单条 /admin/settings」叶子，避免与分组重复
        NavMenuItem.objects.filter(path='/admin/settings', parent__isnull=True).delete()

        dash, c0 = NavMenuItem.objects.update_or_create(
            parent=None,
            path='/admin',
            defaults={
                'title': '工作台',
                'icon': 'DashboardOutlined',
                'permission_code': '',
                'sort_order': 0,
                'is_active': True,
            },
        )
        self.stdout.write(
            self.style.SUCCESS(f'{"创建" if c0 else "更新"} 菜单: {dash.title} ({dash.path})')
        )

        settings_root, c1 = NavMenuItem.objects.update_or_create(
            parent=None,
            title='系统设置',
            path='',
            defaults={
                'icon': 'SettingOutlined',
                'permission_code': 'users.view_rbac',
                'sort_order': 10,
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
                '/admin/settings',
                '系统概览',
                'SettingOutlined',
                'users.view_rbac',
                0,
            ),
            (
                '/admin/settings/menus',
                '菜单管理',
                'MenuOutlined',
                'users.view_rbac',
                1,
            ),
            (
                '/admin/settings/roles',
                '角色管理',
                'TeamOutlined',
                'users.view_rbac',
                2,
            ),
            (
                '/admin/settings/users',
                '用户管理',
                'UserOutlined',
                'users.view_rbac',
                3,
            ),
            (
                '/admin/settings/approvals',
                '审批管理',
                'AuditOutlined',
                'users.approve_registrations',
                4,
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
                '「审批管理」需权限 users.approve_registrations；注册接口已改为待审批（无 Token）。'
            )
        )
