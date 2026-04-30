from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.translation import gettext as _

from users.models import Tenant


MOCK_COMPANIES = [
    ('ningbo_huaxin_export', '宁波华信进出口有限公司', 420, True),
    ('shenzhen_bright_tech', '深圳博瑞特科技有限公司', 365, True),
    ('guangzhou_ocean_trade', '广州远洋贸易有限公司', 300, True),
    ('yiwu_global_supply', '义乌环球供应链有限公司', 240, True),
    ('hangzhou_silkroad', '杭州丝路电子商务有限公司', 180, True),
    ('xiamen_sea_star', '厦门海星工贸有限公司', 150, True),
    ('qingdao_harbor_machinery', '青岛港湾机械有限公司', 120, True),
    ('suzhou_precision_export', '苏州精工出口有限公司', 90, True),
    ('foshan_homeware', '佛山家居用品有限公司', 60, True),
    ('wenzhou_new_energy', '温州新能源设备有限公司', 45, True),
    ('dongguan_smart_factory', '东莞智造工厂有限公司', 30, True),
    ('shanghai_trial_customer', '上海试用客户有限公司', -15, False),
]


class Command(BaseCommand):
    help = _('Seed company mock data (Tenant). Idempotent by code.')

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0
        now = timezone.now()

        for code, name, expire_days, is_active in MOCK_COMPANIES:
            _, created = Tenant.objects.update_or_create(
                code=code,
                defaults={
                    'name': name,
                    'is_active': is_active,
                    'subscription_expires_at': now + timedelta(days=expire_days),
                },
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        _('Company created: %(name)s (%(code)s)') % {'name': name, 'code': code}
                    )
                )
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                _('Company mock data finished: created %(created)s, updated %(updated)s.')
                % {'created': created_count, 'updated': updated_count}
            )
        )
