from django.core.management.base import BaseCommand

from users.models import Permission, Role


def _perm(code: str, name: str, desc: str = '') -> tuple[str, str, str]:
    return (code, name, desc)


# 细粒度权限（按钮/接口级）：资源.动作；后台可继续增删改
DEFAULT_PERMISSIONS: list[tuple[str, str, str]] = [
    # 用户与 RBAC 管理
    _perm('users.view_rbac', '查看权限与角色', '查看权限列表、角色列表'),
    _perm('users.manage_roles', '管理角色', '创建/编辑角色及其权限绑定'),
    _perm('users.manage_users', '管理用户角色', '为用户分配或移除角色'),
    _perm(
        'users.approve_registrations',
        '审批注册用户',
        '通过或拒绝公开注册账号',
    ),
    _perm('api.docs', 'API 文档', '访问 Swagger / OpenAPI 文档'),
    # 后台菜单管理工具栏（与前端按钮一一对应）
    _perm('menus.query', '菜单管理-查询', '列表/筛选菜单数据'),
    _perm('menus.refresh', '菜单管理-刷新', '重新加载菜单列表'),
    _perm('menus.create', '菜单管理-新增', '新增导航菜单项'),
    _perm('menus.update', '菜单管理-修改', '编辑导航菜单项'),
    _perm('menus.delete', '菜单管理-删除', '删除导航菜单项'),
    # 产品（示例：与前端按钮一一对应）
    _perm('products.view', '产品-查看', '列表、详情'),
    _perm('products.create', '产品-新增', '创建'),
    _perm('products.update', '产品-编辑', '修改'),
    _perm('products.delete', '产品-删除', '删除'),
    _perm('products.upload', '产品-上传', '图片等上传类接口'),
    _perm('products.download', '产品-下载', '导出、下载'),
    # 品牌
    _perm('brands.view', '品牌-查看', ''),
    _perm('brands.create', '品牌-新增', ''),
    _perm('brands.update', '品牌-编辑', ''),
    _perm('brands.delete', '品牌-删除', ''),
    _perm('brands.upload', '品牌-上传', ''),
    _perm('brands.download', '品牌-下载', ''),
    # 公司内容
    _perm('company.view', '公司内容-查看', ''),
    _perm('company.create', '公司内容-新增', ''),
    _perm('company.update', '公司内容-编辑', ''),
    _perm('company.delete', '公司内容-删除', ''),
    _perm('company.upload', '公司内容-上传', ''),
    _perm('company.download', '公司内容-下载', ''),
]


class Command(BaseCommand):
    help = '写入默认权限点与示例角色（可重复执行，以 code 为幂等键）'

    def handle(self, *args, **options):
        created_p = 0
        for sort, (code, name, desc) in enumerate(DEFAULT_PERMISSIONS):
            _, c = Permission.objects.update_or_create(
                code=code,
                defaults={'name': name, 'description': desc, 'sort_order': sort},
            )
            if c:
                created_p += 1
                self.stdout.write(self.style.SUCCESS(f'权限已创建: {code}'))

        admin_role, _ = Role.objects.update_or_create(
            code='administrator',
            defaults={
                'name': '管理员',
                'description': '业务侧全部权限（非 Django 超级用户）',
                'is_active': True,
                'is_system': True,
            },
        )
        admin_role.permissions.set(Permission.objects.all())
        self.stdout.write(self.style.SUCCESS('角色 administrator 已绑定全部权限'))

        editor_role, _ = Role.objects.update_or_create(
            code='content_editor',
            defaults={
                'name': '内容编辑',
                'description': '可改产品/品牌/公司内容，无删除与用户管理',
                'is_active': True,
                'is_system': True,
            },
        )
        editor_codes = {
            'products.view',
            'products.create',
            'products.update',
            'products.upload',
            'brands.view',
            'brands.create',
            'brands.update',
            'brands.upload',
            'company.view',
            'company.update',
            'company.upload',
            'api.docs',
        }
        editor_role.permissions.set(Permission.objects.filter(code__in=editor_codes))

        viewer_role, _ = Role.objects.update_or_create(
            code='viewer',
            defaults={
                'name': '只读',
                'description': '仅查看，无增删改与上传',
                'is_active': True,
                'is_system': True,
            },
        )
        viewer_codes = {
            'products.view',
            'brands.view',
            'company.view',
            'api.docs',
        }
        viewer_role.permissions.set(Permission.objects.filter(code__in=viewer_codes))

        self.stdout.write(
            self.style.SUCCESS(
                f'完成。新建权限 {created_p} 条；角色 administrator / content_editor / viewer 已更新。'
            )
        )
