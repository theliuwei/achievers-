from django.conf import settings
from django.db import migrations


def backfill_profiles(apps, schema_editor):
    User = apps.get_model(*settings.AUTH_USER_MODEL.split('.'))
    UserProfile = apps.get_model('users', 'UserProfile')
    for user in User.objects.all().iterator():
        UserProfile.objects.get_or_create(user_id=user.pk)


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(backfill_profiles, migrations.RunPython.noop),
    ]
