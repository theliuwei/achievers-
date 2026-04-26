"""
当 users.0001_initial 已记录但 users_user 物理表不存在时，
直接执行 sqlmigrate 输出的 DDL 把表建好——保留迁移记录，避免触发
InconsistentMigrationHistory（admin.0001 等已依赖 users.0001）。
"""

from io import StringIO

from django.core.management import BaseCommand, CommandError, call_command
from django.db import connection, transaction
from django.db.migrations.recorder import MigrationRecorder

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
    help = '修复：users 0001 已记录但缺表，重建 users_* 表（不动迁移记录）'

    def add_arguments(self, parser):
        parser.add_argument(
            '--drop-residual',
            action='store_true',
            help='先 DROP 残留的 users_* 表，再重建（破坏性，仅用于残破开发库）',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        existing = [t for t in USERS_TABLES if _table_exists(t)]
        if 'users_user' in existing:
            self.stdout.write(self.style.SUCCESS('users_user 已存在，无需修复。'))
            return
        if existing:
            if not options['drop_residual']:
                raise CommandError(
                    f'存在残留表 {existing}，确认后追加 --drop-residual 自动清理重建。'
                )
            self.stdout.write(f'DROP 残留表 {existing}…')
            with connection.cursor() as cursor:
                if connection.vendor == 'mysql':
                    cursor.execute('SET FOREIGN_KEY_CHECKS=0')
                for t in existing:
                    cursor.execute(f'DROP TABLE IF EXISTS `{t}`')
                if connection.vendor == 'mysql':
                    cursor.execute('SET FOREIGN_KEY_CHECKS=1')

        r = MigrationRecorder(connection)
        if not r.has_table():
            raise CommandError('无 django_migrations 表。')
        had_record = r.migration_qs.filter(
            app='users', name='0001_initial'
        ).exists()

        self.stdout.write('按 sqlmigrate users 0001_initial 输出执行建表…')
        n = _execute_ddl()
        if not _table_exists('users_user'):
            raise CommandError(f'已执行 {n} 条 DDL，但仍无 users_user，请检查上方报错。')
        if not had_record:
            r.record_applied('users', '0001_initial')
            self.stdout.write('已补登 users.0001_initial 为已应用。')
        self.stdout.write(self.style.SUCCESS(f'已执行 {n} 条 DDL，users 相关表已就绪。'))
