from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class PendingRegistrationSerializer(serializers.ModelSerializer):
    """待审批注册用户列表。"""

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'date_joined',
        )
        read_only_fields = fields
