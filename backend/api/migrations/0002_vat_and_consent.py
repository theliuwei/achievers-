from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_department_and_data_scope'),
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='VATRate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(db_index=True, default=django.utils.timezone.now, editable=False, verbose_name='创建时间')),
                ('updated_at', models.DateTimeField(auto_now=True, db_index=True, verbose_name='更新时间')),
                ('is_deleted', models.BooleanField(db_index=True, default=False, verbose_name='是否删除')),
                ('country_code', models.CharField(db_index=True, max_length=8, verbose_name='国家代码')),
                ('name', models.CharField(max_length=100, verbose_name='税率名称')),
                ('rate', models.DecimalField(decimal_places=2, max_digits=5, verbose_name='税率(%)')),
                ('is_price_included_default', models.BooleanField(default=False, verbose_name='默认含税展示')),
                ('effective_from', models.DateField(verbose_name='生效开始')),
                ('effective_to', models.DateField(blank=True, null=True, verbose_name='生效结束')),
                ('is_active', models.BooleanField(db_index=True, default=True, verbose_name='启用')),
            ],
            options={
                'verbose_name': 'VAT 税率',
                'verbose_name_plural': 'VAT 税率',
                'db_table': 'VATRate',
                'ordering': ['country_code', '-effective_from', '-id'],
            },
        ),
        migrations.CreateModel(
            name='ConsentLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(db_index=True, default=django.utils.timezone.now, editable=False, verbose_name='创建时间')),
                ('updated_at', models.DateTimeField(auto_now=True, db_index=True, verbose_name='更新时间')),
                ('is_deleted', models.BooleanField(db_index=True, default=False, verbose_name='是否删除')),
                ('consent_type', models.CharField(choices=[('cookie', 'Cookie Consent'), ('privacy_policy', 'Privacy Policy'), ('marketing', 'Marketing Consent'), ('terms', 'Terms Agreement')], db_index=True, max_length=32, verbose_name='同意类型')),
                ('action', models.CharField(choices=[('accepted', 'Accepted'), ('revoked', 'Revoked'), ('updated', 'Updated')], db_index=True, max_length=16, verbose_name='操作')),
                ('policy_version', models.CharField(blank=True, default='', max_length=50, verbose_name='政策版本')),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True, verbose_name='IP 地址')),
                ('user_agent', models.CharField(blank=True, default='', max_length=500, verbose_name='User Agent')),
                ('metadata', models.JSONField(blank=True, default=dict, verbose_name='扩展元数据')),
                ('tenant', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='consent_logs', to='users.tenant', verbose_name='租户')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='consent_logs', to='users.userinfo', verbose_name='用户')),
            ],
            options={
                'verbose_name': '用户同意记录',
                'verbose_name_plural': '用户同意记录',
                'db_table': 'ConsentLog',
                'ordering': ['-created_at', '-id'],
            },
        ),
    ]
