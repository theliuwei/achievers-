"""
当 users.0001_initial 已记录但 users_user 物理表不存在时，
直接执行 sqlmigrate 输出的 DDL 把表建好——保留迁移记录，避免触发
InconsistentMigrationHistory（admin.0001 等已依赖 users.0001）。
"""

from io import StringIO

from django.core.management import BaseCommand, CommandError, call_command
from django.db import connection, transaction
from django.db.migrations.recorder import MigrationRecorder
from django.utils.translation import gettext as _

USERS_TABLES = (
    'users_permission',
    'users_tenant',
    'users_role',
    'users_role_permissions',
    'users_user',
    'users_user_groups',
    'users_user_user_permissions',
    'users_userprofile',
    'users_userprofile_roles',
    'users_tenantmembership',
    'users_tenantmembership_roles',
)


def _table_exists(name: str) -> bool:
    with connection.cursor() as cursor:
        if connection.vendor == 'mysql':
            cursor.execute("SHOW TABLES LIKE %s", [name])
            return bool(cursor.fetchone())
        if connection.vendor == 'sqlite':
            cursor.execute(
                "SELECT 1 FROM sqlite_master WHERE type='table' AND name=%s", [name]
            )
            return bool(cursor.fetchone())
    return False


def _sqlmigrate_text() -> str:
    buf = StringIO()
    call_command(
        'sqlmigrate', 'users', '0001_initial',
        stdout=buf, no_color=True, verbosity=0,
    )
    return buf.getvalue()


def _execute_ddl() -> int:
    raw = _sqlmigrate_text()
    cleaned: list[str] = []
    for line in raw.splitlines():
        s = line.strip()
        if not s or s.startswith('--'):
            continue
        cleaned.append(s)
    text = '\n'.join(cleaned)
    n = 0
    for chunk in text.split(';'):
        stmt = chunk.strip()
        if not stmt:
            continue
        with connection.cursor() as cursor:
            cursor.execute(stmt)
        n += 1
    return n


class Command(BaseCommand):
    help = _('Repair users_* tables when users.0001 is recorded but physical tables are missing.')

    def add_arguments(self, parser):
        parser.add_argument(
            '--drop-residual',
            action='store_true',
            help=_('Drop residual users_* tables before rebuilding (destructive, for broken dev DB only).'),
        )

    @transaction.atomic
    def handle(self, *args, **options):
        existing = [t for t in USERS_TABLES if _table_exists(t)]
        if 'users_user' in existing:
            self.stdout.write(self.style.SUCCESS(_('users_user already exists; no repair needed.')))
            return
        if existing:
            if not options['drop_residual']:
                raise CommandError(
                    _('Residual tables found %(tables)s; add --drop-residual to clean and rebuild.') % {
                        'tables': existing
                    }
                )
            self.stdout.write(_('Dropping residual tables %(tables)s...') % {'tables': existing})
            with connection.cursor() as cursor:
                if connection.vendor == 'mysql':
                    cursor.execute('SET FOREIGN_KEY_CHECKS=0')
                for t in existing:
                    cursor.execute(f'DROP TABLE IF EXISTS `{t}`')
                if connection.vendor == 'mysql':
                    cursor.execute('SET FOREIGN_KEY_CHECKS=1')

        r = MigrationRecorder(connection)
        if not r.has_table():
            raise CommandError(_('django_migrations table does not exist.'))
        had_record = r.migration_qs.filter(
            app='users', name='0001_initial'
        ).exists()

        self.stdout.write(_('Rebuilding tables using SQL from sqlmigrate users 0001_initial...'))
        n = _execute_ddl()
        if not _table_exists('users_user'):
            raise CommandError(
                _('Executed %(count)s DDL statements but users_user is still missing. Check errors above.')
                % {'count': n}
            )
        if not had_record:
            r.record_applied('users', '0001_initial')
            self.stdout.write(_('Marked users.0001_initial as applied.'))
        self.stdout.write(
            self.style.SUCCESS(
                _('Executed %(count)s DDL statements; users tables are ready.') % {'count': n}
            )
        )
