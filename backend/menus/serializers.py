from rest_framework import serializers

from .models import NavMenuItem


class NavMenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = NavMenuItem
        fields = (
            'id',
            'parent',
            'title',
            'path',
            'icon',
            'permission_code',
            'sort_order',
            'is_active',
        )
