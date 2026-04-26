import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('users', '0001_initial'),
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Customer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(db_index=True, default=django.utils.timezone.now, editable=False, verbose_name='创建时间')),
                ('updated_at', models.DateTimeField(auto_now=True, db_index=True, verbose_name='更新时间')),
                ('is_deleted', models.BooleanField(db_index=True, default=False, verbose_name='是否删除')),
                ('name', models.CharField(max_length=120, verbose_name='客户姓名')),
                ('company_name', models.CharField(blank=True, default='', max_length=200, verbose_name='客户公司')),
                ('country', models.CharField(blank=True, default='', max_length=120, verbose_name='国家/地区')),
                ('email', models.EmailField(blank=True, default='', max_length=254, verbose_name='邮箱')),
                ('phone', models.CharField(blank=True, default='', max_length=64, verbose_name='电话')),
                ('whatsapp', models.CharField(blank=True, default='', max_length=64, verbose_name='WhatsApp')),
                ('source', models.CharField(blank=True, default='', max_length=120, verbose_name='来源')),
                ('level', models.CharField(choices=[('normal', '普通'), ('important', '重点')], default='normal', max_length=20, verbose_name='客户等级')),
                ('notes', models.TextField(blank=True, default='', verbose_name='备注')),
                ('owner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='owned_customers', to=settings.AUTH_USER_MODEL, verbose_name='负责人')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='customers', to='users.tenant', verbose_name='租户')),
            ],
            options={'verbose_name': '客户', 'verbose_name_plural': '客户', 'db_table': 'Customer', 'ordering': ['-updated_at', 'id']},
        ),
        migrations.CreateModel(
            name='Inquiry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(db_index=True, default=django.utils.timezone.now, editable=False, verbose_name='创建时间')),
                ('updated_at', models.DateTimeField(auto_now=True, db_index=True, verbose_name='更新时间')),
                ('is_deleted', models.BooleanField(db_index=True, default=False, verbose_name='是否删除')),
                ('subject', models.CharField(max_length=240, verbose_name='询盘主题')),
                ('product_name', models.CharField(blank=True, default='', max_length=240, verbose_name='询盘产品')),
                ('message', models.TextField(blank=True, default='', verbose_name='询盘内容')),
                ('country', models.CharField(blank=True, default='', max_length=120, verbose_name='国家/地区')),
                ('source', models.CharField(blank=True, default='官网', max_length=120, verbose_name='来源')),
                ('status', models.CharField(choices=[('new', '新询盘'), ('contacted', '已联系'), ('quoted', '已报价'), ('won', '已成交'), ('invalid', '无效')], default='new', max_length=20, verbose_name='状态')),
                ('assignee', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_inquiries', to=settings.AUTH_USER_MODEL, verbose_name='负责人')),
                ('customer', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='inquiries', to='api.customer', verbose_name='客户')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inquiries', to='users.tenant', verbose_name='租户')),
            ],
            options={'verbose_name': '询盘', 'verbose_name_plural': '询盘', 'db_table': 'Inquiry', 'ordering': ['-created_at', 'id']},
        ),
        migrations.CreateModel(
            name='Quotation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(db_index=True, default=django.utils.timezone.now, editable=False, verbose_name='创建时间')),
                ('updated_at', models.DateTimeField(auto_now=True, db_index=True, verbose_name='更新时间')),
                ('is_deleted', models.BooleanField(db_index=True, default=False, verbose_name='是否删除')),
                ('quote_no', models.CharField(db_index=True, max_length=64, unique=True, verbose_name='报价单号')),
                ('currency', models.CharField(default='USD', max_length=12, verbose_name='币种')),
                ('total_amount', models.DecimalField(decimal_places=2, default=0, max_digits=12, verbose_name='报价总额')),
                ('trade_term', models.CharField(blank=True, default='', max_length=120, verbose_name='贸易条款')),
                ('status', models.CharField(choices=[('draft', '草稿'), ('sent', '已发送'), ('confirmed', '已确认'), ('won', '已成交'), ('lost', '已失效')], default='draft', max_length=20, verbose_name='状态')),
                ('valid_until', models.DateField(blank=True, null=True, verbose_name='有效期至')),
                ('customer', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='quotations', to='api.customer', verbose_name='客户')),
                ('inquiry', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='quotations', to='api.inquiry', verbose_name='关联询盘')),
                ('owner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='owned_quotations', to=settings.AUTH_USER_MODEL, verbose_name='负责人')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='quotations', to='users.tenant', verbose_name='租户')),
            ],
            options={'verbose_name': '报价', 'verbose_name_plural': '报价', 'db_table': 'Quotation', 'ordering': ['-created_at', 'id']},
        ),
        migrations.CreateModel(
            name='QuotationItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(db_index=True, default=django.utils.timezone.now, editable=False, verbose_name='创建时间')),
                ('updated_at', models.DateTimeField(auto_now=True, db_index=True, verbose_name='更新时间')),
                ('is_deleted', models.BooleanField(db_index=True, default=False, verbose_name='是否删除')),
                ('product_name', models.CharField(max_length=240, verbose_name='产品名称')),
                ('sku', models.CharField(blank=True, default='', max_length=120, verbose_name='型号/SKU')),
                ('quantity', models.PositiveIntegerField(default=1, verbose_name='数量')),
                ('unit_price', models.DecimalField(decimal_places=2, default=0, max_digits=12, verbose_name='单价')),
                ('total_price', models.DecimalField(decimal_places=2, default=0, max_digits=12, verbose_name='小计')),
                ('remark', models.CharField(blank=True, default='', max_length=240, verbose_name='备注')),
                ('product', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='quotation_items', to='products.product', verbose_name='产品')),
                ('quotation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='api.quotation', verbose_name='报价单')),
            ],
            options={'verbose_name': '报价明细', 'verbose_name_plural': '报价明细', 'db_table': 'QuotationItem', 'ordering': ['quotation_id', 'id']},
        ),
    ]
