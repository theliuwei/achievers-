from django.core.management.base import BaseCommand
from django.utils.translation import gettext as _

from users.models import Permission, Role


def _perm(code: str, name: str, desc: str = '') -> tuple[str, str, str]:
    return (code, name, desc)


TENANT_ROLE_PERMISSIONS: dict[str, dict[str, object]] = {
    'tenant_admin': {
        'name': '合作公司管理员',
        'description': '合作公司侧管理员，可查看并维护公司、成员、产品、询盘、客户和报价模块。',
        'data_scope': Role.DataScope.TENANT,
        'permissions': {
            'tenants.view',
            'tenants.create',
            'tenants.update',
            'members.view',
            'members.create',
            'members.update',
            'members.delete',
            'products.view',
            'products.create',
            'products.update',
            'products.delete',
            'products.upload',
            'products.download',
            'inquiries.view',
            'inquiries.create',
            'inquiries.update',
            'inquiries.delete',
            'customers.view',
            'customers.create',
            'customers.update',
            'customers.delete',
            'quotations.view',
            'quotations.create',
            'quotations.update',
            'quotations.delete',
            'quotations.download',
        },
    },
    'tenant_sales': {
        'name': '外贸业务员',
        'description': '负责询盘、客户和报价，可查看产品资料。',
        'data_scope': Role.DataScope.OWN,
        'permissions': {
            'products.view',
            'inquiries.view',
            'inquiries.create',
            'inquiries.update',
            'customers.view',
            'customers.create',
            'customers.update',
            'quotations.view',
            'quotations.create',
            'quotations.update',
            'quotations.download',
        },
    },
    'tenant_sales_manager': {
        'name': '销售经理',
        'description': '可查看本部门与下属业务员的客户、询盘和报价数据。',
        'data_scope': Role.DataScope.DEPARTMENT,
        'permissions': {
            'products.view',
            'inquiries.view',
            'inquiries.create',
            'inquiries.update',
            'customers.view',
            'customers.create',
            'customers.update',
            'quotations.view',
            'quotations.create',
            'quotations.update',
            'quotations.download',
        },
    },
    'tenant_product_manager': {
        'name': '产品维护员',
        'description': '负责产品资料维护，仅看到产品管理模块。',
        'data_scope': Role.DataScope.TENANT,
        'permissions': {
            'products.view',
            'products.create',
            'products.update',
            'products.upload',
            'products.download',
        },
    },
    'tenant_viewer': {
        'name': '合作公司只读',
        'description': '只能查看产品、询盘、客户和报价，不可修改。',
        'data_scope': Role.DataScope.TENANT,
        'permissions': {
            'products.view',
            'inquiries.view',
            'customers.view',
            'quotations.view',
        },
    },
}


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
    # 外贸 SaaS 核心模块
    _perm('tenants.view', '公司管理-查看', '查看租户/公司资料'),
    _perm('tenants.create', '公司管理-新增', '新增租户/公司'),
    _perm('tenants.update', '公司管理-修改', '编辑租户/公司资料、订阅状态'),
    _perm('tenants.delete', '公司管理-删除', '删除或停用租户/公司'),
    _perm('members.view', '成员管理-查看', '查看公司成员'),
    _perm('members.create', '成员管理-新增', '邀请或新增公司成员'),
    _perm('members.update', '成员管理-修改', '编辑成员资料、角色、状态'),
    _perm('members.delete', '成员管理-删除', '移除公司成员'),
    _perm('inquiries.view', '询盘管理-查看', '查看询盘列表、详情'),
    _perm('inquiries.create', '询盘管理-新增', '新增或导入询盘'),
    _perm('inquiries.update', '询盘管理-修改', '跟进、分配、更新询盘状态'),
    _perm('inquiries.delete', '询盘管理-删除', '删除无效询盘'),
    _perm('customers.view', '客户管理-查看', '查看海外客户资料'),
    _perm('customers.create', '客户管理-新增', '新增海外客户'),
    _perm('customers.update', '客户管理-修改', '编辑客户资料、跟进记录'),
    _perm('customers.delete', '客户管理-删除', '删除客户资料'),
    _perm('quotations.view', '报价管理-查看', '查看报价单'),
    _perm('quotations.create', '报价管理-新增', '创建报价单'),
    _perm('quotations.update', '报价管理-修改', '编辑报价单、报价明细'),
    _perm('quotations.delete', '报价管理-删除', '删除报价单'),
    _perm('quotations.download', '报价管理-下载', '导出报价单 PDF/Excel'),
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
    # VAT
    _perm('vat.view', 'VAT-查看', '查看 VAT 税率'),
    _perm('vat.create', 'VAT-新增', '新增 VAT 税率'),
    _perm('vat.update', 'VAT-编辑', '编辑 VAT 税率'),
    _perm('vat.delete', 'VAT-删除', '删除 VAT 税率'),
    # Product translations
    _perm('product_translations.view', '产品翻译-查看', '查看产品翻译列表与详情'),
    _perm('product_translations.create', '产品翻译-新增', '新增产品翻译'),
    _perm('product_translations.update', '产品翻译-编辑', '编辑产品翻译'),
    _perm('product_translations.delete', '产品翻译-删除', '删除产品翻译'),
    # Category translations
    _perm('category_translations.view', '类目翻译-查看', '查看类目翻译列表与详情'),
    _perm('category_translations.create', '类目翻译-新增', '新增类目翻译'),
    _perm('category_translations.update', '类目翻译-编辑', '编辑类目翻译'),
    _perm('category_translations.delete', '类目翻译-删除', '删除类目翻译'),
    # Consent logs
    _perm('consent.view', '同意记录-查看', '查看用户同意记录'),
    # GDPR self-service
    _perm('gdpr.export', 'GDPR-导出个人数据', '导出当前登录用户的个人数据'),
    _perm('gdpr.delete', 'GDPR-删除个人数据', '注销并匿名化当前登录用户数据'),
]


class Command(BaseCommand):
    help = _('Seed default permissions and sample roles (idempotent by code).')

    def handle(self, *args, **options):
        created_p = 0
        for sort, (code, name, desc) in enumerate(DEFAULT_PERMISSIONS):
            _, c = Permission.objects.update_or_create(
                code=code,
                defaults={'name': name, 'description': desc, 'sort_order': sort},
            )
            if c:
                created_p += 1
                self.stdout.write(self.style.SUCCESS(_('Permission created: %(code)s') % {'code': code}))

        admin_role, _ = Role.objects.update_or_create(
            code='administrator',
            defaults={
                'name': '管理员',
                'description': '业务侧全部权限（非 Django 超级用户）',
                'data_scope': Role.DataScope.ALL,
                'is_active': True,
                'is_system': True,
            },
        )
        admin_role.permissions.set(Permission.objects.all())
        self.stdout.write(self.style.SUCCESS(_('Role administrator bound to all permissions.')))

        editor_role, _ = Role.objects.update_or_create(
            code='content_editor',
            defaults={
                'name': '内容编辑',
                'description': '可改产品/品牌/公司内容，无删除与用户管理',
                'data_scope': Role.DataScope.TENANT,
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
                'data_scope': Role.DataScope.TENANT,
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

        for role_code, config in TENANT_ROLE_PERMISSIONS.items():
            role, _ = Role.objects.update_or_create(
                code=role_code,
                defaults={
                    'name': str(config['name']),
                    'description': str(config['description']),
                    'data_scope': config.get('data_scope', Role.DataScope.OWN),
                    'is_active': True,
                    'is_system': True,
                },
            )
            role.permissions.set(
                Permission.objects.filter(code__in=config['permissions'])
            )
            self.stdout.write(self.style.SUCCESS(_('Role %(role)s updated.') % {'role': role_code}))

        self.stdout.write(
            self.style.SUCCESS(
                _('Completed. Created %(count)s permissions; updated administrator/content_editor/viewer and tenant sample roles.')
                % {'count': created_p}
            )
        )
