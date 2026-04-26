import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='tenant',
            name='address',
            field=models.TextField(blank=True, default='', verbose_name='公司地址'),
        ),
        migrations.AddField(
            model_name='tenant',
            name='contact_email',
            field=models.EmailField(blank=True, default='', max_length=254, verbose_name='联系邮箱'),
        ),
        migrations.AddField(
            model_name='tenant',
            name='contact_name',
            field=models.CharField(blank=True, default='', max_length=100, verbose_name='联系人'),
        ),
        migrations.AddField(
            model_name='tenant',
            name='contact_phone',
            field=models.CharField(blank=True, default='', max_length=32, verbose_name='联系电话'),
        ),
        migrations.AddField(
            model_name='tenant',
            name='locked_reason',
            field=models.CharField(blank=True, default='', max_length=200, verbose_name='锁定原因'),
        ),
        migrations.AddField(
            model_name='tenant',
            name='max_members',
            field=models.PositiveIntegerField(default=20, verbose_name='员工账号上限'),
        ),
        migrations.AddField(
            model_name='tenant',
            name='primary_admin',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='primary_admin_tenants',
                to=settings.AUTH_USER_MODEL,
                verbose_name='主管理员',
            ),
        ),
        migrations.AddField(
            model_name='tenant',
            name='storage_quota_mb',
            field=models.PositiveIntegerField(default=1024, verbose_name='附件容量上限(MB)'),
        ),
        migrations.AddField(
            model_name='tenant',
            name='storage_used_mb',
            field=models.PositiveIntegerField(default=0, verbose_name='附件已用容量(MB)'),
        ),
        migrations.AddField(
            model_name='tenant',
            name='subscription_starts_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True, verbose_name='订阅/合同开始时间'),
        ),
        migrations.CreateModel(
            name='TenantRegistrationApplication',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(db_index=True, default=django.utils.timezone.now, editable=False, verbose_name='创建时间')),
                ('updated_at', models.DateTimeField(auto_now=True, db_index=True, verbose_name='更新时间')),
                ('is_deleted', models.BooleanField(db_index=True, default=False, verbose_name='是否删除')),
                ('company_name', models.CharField(max_length=200, verbose_name='公司名称')),
                ('company_code', models.SlugField(db_index=True, max_length=64, verbose_name='公司代码')),
                ('company_address', models.TextField(blank=True, default='', verbose_name='公司地址')),
                ('contact_name', models.CharField(blank=True, default='', max_length=100, verbose_name='联系人')),
                ('contact_phone', models.CharField(blank=True, default='', max_length=32, verbose_name='联系电话')),
                ('contact_email', models.EmailField(blank=True, default='', max_length=254, verbose_name='联系邮箱')),
                ('admin_username', models.CharField(db_index=True, max_length=150, verbose_name='主管理员用户名')),
                ('admin_email', models.EmailField(db_index=True, max_length=254, verbose_name='主管理员邮箱')),
                ('admin_first_name', models.CharField(blank=True, default='', max_length=150, verbose_name='主管理员名')),
                ('admin_last_name', models.CharField(blank=True, default='', max_length=150, verbose_name='主管理员姓')),
                ('admin_phone', models.CharField(blank=True, default='', max_length=32, verbose_name='主管理员手机')),
                ('admin_password_hash', models.CharField(max_length=128, verbose_name='主管理员密码哈希')),
                ('requested_max_members', models.PositiveIntegerField(default=20, verbose_name='申请员工账号上限')),
                ('requested_storage_quota_mb', models.PositiveIntegerField(default=1024, verbose_name='申请附件容量(MB)')),
                ('status', models.CharField(choices=[('pending', '待审核'), ('approved', '已通过'), ('rejected', '已拒绝')], db_index=True, default='pending', max_length=16, verbose_name='审核状态')),
                ('reviewed_at', models.DateTimeField(blank=True, null=True, verbose_name='审核时间')),
                ('reject_reason', models.TextField(blank=True, default='', verbose_name='拒绝原因')),
                ('reviewed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reviewed_tenant_applications', to=settings.AUTH_USER_MODEL, verbose_name='审核人')),
                ('tenant', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='registration_application', to='users.tenant', verbose_name='创建的租户')),
            ],
            options={
                'verbose_name': '租户入驻申请',
                'verbose_name_plural': '租户入驻申请',
                'db_table': 'TenantRegistrationApplication',
                'ordering': ['-created_at', '-id'],
            },
        ),
    ]
