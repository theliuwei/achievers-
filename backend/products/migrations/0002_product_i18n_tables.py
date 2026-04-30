from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProductCategoryTranslation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(db_index=True, default=django.utils.timezone.now, editable=False, verbose_name='创建时间')),
                ('updated_at', models.DateTimeField(auto_now=True, db_index=True, verbose_name='更新时间')),
                ('is_deleted', models.BooleanField(db_index=True, default=False, verbose_name='是否删除')),
                ('language', models.CharField(choices=[('en', 'English'), ('zh-hans', 'Simplified Chinese'), ('id', 'Indonesian'), ('vi', 'Vietnamese'), ('ru', 'Russian'), ('de', 'German'), ('fr', 'French'), ('es', 'Spanish'), ('it', 'Italian'), ('pt', 'Portuguese'), ('pl', 'Polish'), ('nl', 'Dutch'), ('th', 'Thai')], db_index=True, max_length=10, verbose_name='语言')),
                ('name', models.CharField(max_length=255, verbose_name='名称')),
                ('description', models.TextField(blank=True, default='', verbose_name='说明')),
                ('seo_title', models.CharField(blank=True, default='', max_length=255, verbose_name='SEO 标题')),
                ('seo_description', models.CharField(blank=True, default='', max_length=500, verbose_name='SEO 描述')),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='translations', to='products.productcategory', verbose_name='类目')),
            ],
            options={
                'verbose_name': '产品类目翻译',
                'verbose_name_plural': '产品类目翻译',
                'db_table': 'ProductCategoryTranslation',
                'ordering': ['category_id', 'language'],
            },
        ),
        migrations.CreateModel(
            name='ProductTranslation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(db_index=True, default=django.utils.timezone.now, editable=False, verbose_name='创建时间')),
                ('updated_at', models.DateTimeField(auto_now=True, db_index=True, verbose_name='更新时间')),
                ('is_deleted', models.BooleanField(db_index=True, default=False, verbose_name='是否删除')),
                ('language', models.CharField(choices=[('en', 'English'), ('zh-hans', 'Simplified Chinese'), ('id', 'Indonesian'), ('vi', 'Vietnamese'), ('ru', 'Russian'), ('de', 'German'), ('fr', 'French'), ('es', 'Spanish'), ('it', 'Italian'), ('pt', 'Portuguese'), ('pl', 'Polish'), ('nl', 'Dutch'), ('th', 'Thai')], db_index=True, max_length=10, verbose_name='语言')),
                ('name', models.CharField(max_length=500, verbose_name='名称')),
                ('summary', models.CharField(blank=True, default='', max_length=1000, verbose_name='摘要')),
                ('description', models.TextField(blank=True, default='', verbose_name='详情')),
                ('seo_title', models.CharField(blank=True, default='', max_length=255, verbose_name='SEO 标题')),
                ('seo_description', models.CharField(blank=True, default='', max_length=500, verbose_name='SEO 描述')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='translations', to='products.product', verbose_name='产品')),
            ],
            options={
                'verbose_name': '产品翻译',
                'verbose_name_plural': '产品翻译',
                'db_table': 'ProductTranslation',
                'ordering': ['product_id', 'language'],
            },
        ),
        migrations.CreateModel(
            name='ProductLocalizedImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(db_index=True, default=django.utils.timezone.now, editable=False, verbose_name='创建时间')),
                ('updated_at', models.DateTimeField(auto_now=True, db_index=True, verbose_name='更新时间')),
                ('is_deleted', models.BooleanField(db_index=True, default=False, verbose_name='是否删除')),
                ('language', models.CharField(choices=[('en', 'English'), ('zh-hans', 'Simplified Chinese'), ('id', 'Indonesian'), ('vi', 'Vietnamese'), ('ru', 'Russian'), ('de', 'German'), ('fr', 'French'), ('es', 'Spanish'), ('it', 'Italian'), ('pt', 'Portuguese'), ('pl', 'Polish'), ('nl', 'Dutch'), ('th', 'Thai')], db_index=True, max_length=10, verbose_name='语言')),
                ('image_url', models.URLField(max_length=800, verbose_name='图片 URL')),
                ('alt_text', models.CharField(blank=True, default='', max_length=255, verbose_name='替代文本')),
                ('sort_order', models.PositiveSmallIntegerField(default=0, verbose_name='排序')),
                ('is_primary', models.BooleanField(default=False, verbose_name='主图')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='localized_images', to='products.product', verbose_name='产品')),
            ],
            options={
                'verbose_name': '产品多语言图片',
                'verbose_name_plural': '产品多语言图片',
                'db_table': 'ProductLocalizedImage',
                'ordering': ['product_id', 'language', 'sort_order', 'id'],
            },
        ),
        migrations.AddConstraint(
            model_name='producttranslation',
            constraint=models.UniqueConstraint(fields=('product', 'language'), name='uniq_product_translation_product_language'),
        ),
        migrations.AddConstraint(
            model_name='productcategorytranslation',
            constraint=models.UniqueConstraint(fields=('category', 'language'), name='uniq_product_category_translation_category_language'),
        ),
    ]
