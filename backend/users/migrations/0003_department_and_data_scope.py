import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_tenant_application_and_quotas'),
    ]

    operations = [
        migrations.AddField(
            model_name='role',
            name='data_scope',
            field=models.CharField(
                choices=[
                    ('own', '本人数据'),
                    ('department', '部门/下属数据'),
                    ('tenant', '公司全部数据'),
                    ('all', '平台全部数据'),
                ],
                db_index=True,
                default='own',
                max_length=20,
                verbose_name='数据权限范围',
            ),
        ),
        migrations.CreateModel(
            name='Department',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(db_index=True, default=django.utils.timezone.now, editable=False, verbose_name='创建时间')),
                ('updated_at', models.DateTimeField(auto_now=True, db_index=True, verbose_name='更新时间')),
                ('is_deleted', models.BooleanField(db_index=True, default=False, verbose_name='是否删除')),
                ('name', models.CharField(max_length=100, verbose_name='部门名称')),
                ('sort_order', models.PositiveIntegerField(default=0, verbose_name='排序')),
                ('is_active', models.BooleanField(db_index=True, default=True, verbose_name='启用')),
                ('manager', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='managed_departments', to=settings.AUTH_USER_MODEL, verbose_name='部门负责人')),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='children', to='users.department', verbose_name='上级部门')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='departments', to='users.tenant', verbose_name='租户')),
            ],
            options={
                'verbose_name': '部门',
                'verbose_name_plural': '部门',
                'db_table': 'Department',
                'ordering': ['tenant_id', 'sort_order', 'id'],
            },
        ),
        migrations.AddField(
            model_name='tenantmembership',
            name='department',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='memberships', to='users.department', verbose_name='所属部门'),
        ),
        migrations.AddField(
            model_name='tenantmembership',
            name='reports_to',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='direct_reports', to='users.tenantmembership', verbose_name='直属上级'),
        ),
        migrations.AddConstraint(
            model_name='department',
            constraint=models.UniqueConstraint(condition=models.Q(('is_deleted', False)), fields=('tenant', 'name'), name='users_department_tenant_name_uniq_active'),
        ),
    ]
