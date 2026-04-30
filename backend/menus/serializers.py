from rest_framework import serializers

from .models import NavMenuItem


class NavMenuItemSerializer(serializers.ModelSerializer):
    parent_display = serializers.SerializerMethodField()

    class Meta:
        model = NavMenuItem
        fields = (
            'id',
            'parent',
            'parent_display',
            'title',
            'path',
            'icon',
            'permission_code',
            'sort_order',
            'is_active',
        )

    def get_parent_display(self, obj):
        if not obj.parent:
            return None
        return obj.parent.title
