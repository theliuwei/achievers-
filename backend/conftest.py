import os

import django
import pytest
from django.core.management import call_command
from django.test.utils import (
    setup_databases,
    setup_test_environment,
    teardown_databases,
    teardown_test_environment,
)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

_DB_CFG = None


def pytest_sessionstart(session):
    global _DB_CFG
    setup_test_environment()
    _DB_CFG = setup_databases(verbosity=0, interactive=False, keepdb=False)


def pytest_sessionfinish(session, exitstatus):
    teardown_databases(_DB_CFG, verbosity=0)
    teardown_test_environment()


@pytest.fixture(autouse=True)
def isolate_db():
    call_command('flush', verbosity=0, interactive=False)
