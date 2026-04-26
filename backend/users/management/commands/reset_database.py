"""
开发期破坏性恢复：把当前 DB 内的所有表全部 DROP，然后从零跑 migrate。
仅用于本地/测试库。线上严禁使用。
"""

from django.conf import settings
from django.core.management import BaseCommand, CommandError, call_command
from django.db import connection


class Command(BaseCommand):
    help = '【破坏性】DROP 当前数据库内所有表，再从零执行 migrate（仅限开发库）'

    def add_arguments(self, parser):
        parser.add_argument(
            '--yes',
            action='store_true',
            help='必填确认；不加该参数则只会打印将要执行的动作。',
        )

    def handle(self, *args, **options):
        if connection.vendor != 'mysql':
            raise CommandError('当前命令仅适配 MySQL。')

        db_name = settings.DATABASES['default']['NAME']
        self.stdout.write(self.style.WARNING(
            f'目标数据库：{db_name}（vendor={connection.vendor}）'
        ))

        with connection.cursor() as cursor:
            cursor.execute('SHOW TABLES')
            tables = [row[0] for row in cursor.fetchall()]

        if not tables:
            self.stdout.write('当前数据库无表，直接执行 migrate…')
        else:
            self.stdout.write(f'即将 DROP 以下 {len(tables)} 张表：')
            for t in tables:
                self.stdout.write(f'  - {t}')

        if not options['yes']:
            self.stdout.write(self.style.NOTICE(
                '\n未加 --yes，仅 dry run；如确认无误请重新执行：'
                '\n  python manage.py reset_database --yes'
            ))
            return

        if tables:
            with connection.cursor() as cursor:
                cursor.execute('SET FOREIGN_KEY_CHECKS = 0')
                for t in tables:
                    cursor.execute(f'DROP TABLE IF EXISTS `{t}`')
                cursor.execute('SET FOREIGN_KEY_CHECKS = 1')
            self.stdout.write(self.style.SUCCESS(
                f'已 DROP {len(tables)} 张表。'
            ))

        self.stdout.write('开始 migrate…')
        call_command('migrate', interactive=False, verbosity=1)
        self.stdout.write(self.style.SUCCESS('数据库已重置并完成迁移。'))
