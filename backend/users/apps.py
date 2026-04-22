from django.apps import AppConfig


class UsersConfig(AppConfig):
    name = 'users'
    verbose_name = '用户与权限'

    def ready(self) -> None:
        import users.signals  # noqa: F401

        from django.contrib import admin
        from django.contrib.auth import get_user_model

        from users.admin import UserAdmin

        user_model = get_user_model()
        if admin.site.is_registered(user_model):
            admin.site.unregister(user_model)
        admin.site.register(user_model, UserAdmin)

