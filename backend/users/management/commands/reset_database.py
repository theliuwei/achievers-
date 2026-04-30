"""
开发期破坏性恢复：把当前 DB 内的所有表全部 DROP，然后从零跑 migrate。
仅用于本地/测试库。线上严禁使用。
"""

from django.conf import settings
from django.core.management import BaseCommand, CommandError, call_command
from django.db import connection
from django.utils.translation import gettext as _


class Command(BaseCommand):
    help = _('Destructive: drop all tables in current database and run migrate from scratch (development only).')

    def add_arguments(self, parser):
        parser.add_argument(
            '--yes',
            action='store_true',
            help=_('Required confirmation flag; without it this command only prints planned actions.'),
        )

    def handle(self, *args, **options):
        if connection.vendor != 'mysql':
            raise CommandError(_('This command currently supports MySQL only.'))

        db_name = settings.DATABASES['default']['NAME']
        self.stdout.write(self.style.WARNING(
            _('Target database: %(db_name)s (vendor=%(vendor)s)') % {
                'db_name': db_name,
                'vendor': connection.vendor,
            }
        ))

        with connection.cursor() as cursor:
            cursor.execute('SHOW TABLES')
            tables = [row[0] for row in cursor.fetchall()]

        if not tables:
            self.stdout.write(_('No tables found in current database. Running migrate directly...'))
        else:
            self.stdout.write(_('The following %(count)s tables will be dropped:') % {'count': len(tables)})
            for t in tables:
                self.stdout.write(f'  - {t}')

        if not options['yes']:
            self.stdout.write(self.style.NOTICE(
                _('\nMissing --yes, dry run only. Re-run to execute:')
                + '\n  python manage.py reset_database --yes'
            ))
            return

        if tables:
            with connection.cursor() as cursor:
                cursor.execute('SET FOREIGN_KEY_CHECKS = 0')
                for t in tables:
                    cursor.execute(f'DROP TABLE IF EXISTS `{t}`')
                cursor.execute('SET FOREIGN_KEY_CHECKS = 1')
            self.stdout.write(self.style.SUCCESS(
                _('Dropped %(count)s tables.') % {'count': len(tables)}
            ))

        self.stdout.write(_('Starting migrate...'))
        call_command('migrate', interactive=False, verbosity=1)
        self.stdout.write(self.style.SUCCESS(_('Database reset completed and migrations applied.')))
