from django.db import models
from django.utils import timezone


class BaseQuerySet(models.QuerySet):
    """支持 QuerySet.delete() 批量软删。"""

    def delete(self):  # type: ignore[override]
        return self.update(is_deleted=True, updated_at=timezone.now())


class BaseManager(models.Manager.from_queryset(BaseQuerySet)):
    """默认排除 is_deleted=True 的记录。"""

    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)


class BaseModel(models.Model):
    """
    业务表公共字段：创建/修改时间、软删除。
    默认管理器 objects 不返回已删数据；需包含已删请使用 all_objects。
    """

    # 使用 default 而非 auto_now_add，便于已有表迁移时自动填充历史行，语义与「首次保存时间」一致。
    created_at = models.DateTimeField(
        '创建时间',
        default=timezone.now,
        db_index=True,
        editable=False,
    )
    updated_at = models.DateTimeField('更新时间', auto_now=True, db_index=True)
    is_deleted = models.BooleanField('是否删除', default=False, db_index=True)

    objects = BaseManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):  # type: ignore[override]
        """软删除：标记 is_deleted，不物理删除行。"""
        self.is_deleted = True
        self.save(update_fields=['is_deleted', 'updated_at'])
