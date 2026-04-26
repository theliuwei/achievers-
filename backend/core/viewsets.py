from django.utils import timezone
from django.db import models
from rest_framework import viewsets
from rest_framework.exceptions import APIException


SOFT_DELETE_UNIQUE_SUFFIX = '__deleted__'
SOFT_DELETE_UNIQUE_FIELD_TYPES = (
    models.CharField,
    models.EmailField,
    models.SlugField,
    models.URLField,
)


def _soft_deleted_unique_value(value: str, instance_pk: object, max_length: int | None) -> str:
    timestamp = timezone.now().strftime('%Y%m%d%H%M%S%f')
    suffix = f'{SOFT_DELETE_UNIQUE_SUFFIX}{instance_pk}_{timestamp}'
    if max_length and len(value) + len(suffix) > max_length:
        value = value[: max_length - len(suffix)]
    return f'{value}{suffix}'


class SoftDeleteModelViewSet(viewsets.ModelViewSet):
    """所有业务 API 删除都必须是软删除，并释放 unique 文本字段。"""

    def _release_unique_text_fields(self, instance) -> list[str]:
        updated_fields: list[str] = []
        for field in instance._meta.fields:
            if not getattr(field, 'unique', False):
                continue
            if not isinstance(field, SOFT_DELETE_UNIQUE_FIELD_TYPES):
                continue
            value = getattr(instance, field.attname, None)
            if not value or SOFT_DELETE_UNIQUE_SUFFIX in str(value):
                continue
            next_value = _soft_deleted_unique_value(
                str(value),
                instance.pk,
                getattr(field, 'max_length', None),
            )
            setattr(instance, field.attname, next_value)
            updated_fields.append(field.attname)
        return updated_fields

    def perform_destroy(self, instance):
        if not hasattr(instance, 'is_deleted'):
            raise APIException('该资源未配置软删除字段，禁止通过 API 删除。')
        update_fields = self._release_unique_text_fields(instance)
        instance.is_deleted = True
        update_fields.append('is_deleted')
        if hasattr(instance, 'updated_at'):
            instance.updated_at = timezone.now()
            update_fields.append('updated_at')
        instance.save(update_fields=update_fields)
