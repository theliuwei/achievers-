import { useMemo } from 'react'
import { Space, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import { roleOptions, searchableSelectProps, tenantOptions } from '../../api/options'
import { fetchUsers, userApi, type UserPayload, type UserRow } from '../../api/users'

type UserFormValues = UserPayload & Record<string, unknown>

const UserManagePage = () => {
  const { t } = useTranslation('common')
  const activeOptions = useMemo(
    () => [
      { label: t('status.enabled'), value: true },
      { label: t('status.disabled'), value: false },
    ],
    [t],
  )
  const staffOptions = useMemo(
    () => [
      { label: t('common.yes'), value: true },
      { label: t('common.no'), value: false },
    ],
    [t],
  )
  const userKindOptions = useMemo(
    () => [
      { label: t('user.kind.platform'), value: 'platform' },
      { label: t('user.kind.tenant'), value: 'tenant' },
    ],
    [t],
  )
  const fields = useMemo<EntityFieldConfig<UserRow>[]>(
    () => [
      { key: 'id', title: t('fields.id'), valueType: 'digit', form: false, search: true, table: { width: 72 } },
      {
        key: 'username',
        title: t('user.fields.username'),
        valueType: 'text',
        search: true,
        form: { rules: [{ required: true, message: t('user.validation.usernameRequired') }], readonlyOnEdit: true },
        table: { width: 140, sorter: true },
      },
      {
        key: 'email',
        title: t('user.fields.email'),
        valueType: 'text',
        search: true,
        form: { rules: [{ required: true, message: t('user.validation.emailRequired') }] },
        table: { width: 220, ellipsis: true },
      },
      {
        key: 'password',
        title: t('user.fields.password'),
        valueType: 'text',
        table: false,
        search: false,
        form: { placeholder: t('user.validation.passwordPlaceholder') },
      },
      { key: 'first_name', title: t('user.fields.firstName'), valueType: 'text', search: true, table: { width: 120 } },
      { key: 'last_name', title: t('user.fields.lastName'), valueType: 'text', search: true, table: { width: 120 } },
      {
        key: 'user_kind',
        title: t('user.fields.userKind'),
        valueType: 'select',
        options: userKindOptions,
        search: true,
        form: { rules: [{ required: true, message: t('user.validation.userKindRequired') }] },
        table: {
          width: 120,
          render: (_, row) => (
            <Tag color={row.user_kind === 'platform' ? 'blue' : 'cyan'}>
              {row.user_kind === 'platform' ? t('user.kind.platformShort') : t('user.kind.tenantShort')}
            </Tag>
          ),
        },
      },
      {
        key: 'is_active',
        title: t('status.label'),
        valueType: 'select',
        options: activeOptions,
        search: true,
        form: { rules: [{ required: true, message: t('user.validation.statusRequired') }] },
        table: {
          width: 90,
          render: (_, row) => (
            <Tag color={row.is_active ? 'green' : 'default'}>{row.is_active ? t('status.enabled') : t('status.disabled')}</Tag>
          ),
        },
      },
      {
        key: 'is_staff',
        title: t('user.fields.isStaff'),
        valueType: 'select',
        options: staffOptions,
        search: true,
        form: { rules: [{ required: true, message: t('user.validation.isStaffRequired') }] },
        table: {
          width: 110,
          render: (_, row) => <Tag color={row.is_staff ? 'blue' : 'default'}>{row.is_staff ? t('common.yes') : t('common.no')}</Tag>,
        },
      },
      {
        key: 'default_tenant',
        title: t('user.fields.defaultTenant'),
        valueType: 'select',
        search: { valueType: 'digit' },
        form: { request: tenantOptions, componentProps: searchableSelectProps },
        table: { width: 180, render: (_, row) => row.default_tenant_display || row.default_tenant || '-' },
      },
      {
        key: 'role_ids',
        title: t('user.fields.roles'),
        valueType: 'select',
        search: false,
        table: false,
        form: { request: roleOptions, componentProps: { ...searchableSelectProps, mode: 'multiple' } },
      },
      {
        key: 'roles',
        title: t('user.fields.roles'),
        search: false,
        form: false,
        table: {
          width: 220,
          render: (_, row) => (
            <Space wrap size={[0, 4]}>
              {row.roles?.length ? row.roles.map((role) => <Tag key={role.id}>{role.name}</Tag>) : <Tag>{t('common.unbound')}</Tag>}
            </Space>
          ),
        },
      },
      { key: 'created_at', title: t('fields.createdAt'), valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
      { key: 'updated_at', title: t('fields.updatedAt'), valueType: 'dateTime', form: false, search: false, table: { width: 170 } },
    ],
    [activeOptions, staffOptions, t, userKindOptions],
  )

  return (
    <AdminTablePage<UserRow, UserFormValues>
      listTitle={t('common.listTitle')}
      fields={fields}
      api={{ ...userApi, list: fetchUsers }}
      rowKey="id"
      createTitle={t('user.actions.create')}
      editTitle={t('user.actions.edit')}
      createDefaults={{ is_active: true, is_staff: false, user_kind: 'tenant', role_ids: [] }}
      recordToFormValues={(record) => ({
        ...record,
        role_ids: record.roles.map((role) => role.id),
      })}
      transformSubmit={(values, editing) => {
        const payload: UserPayload = {
          username: values.username.trim(),
          email: values.email.trim(),
          first_name: values.first_name?.trim() ?? '',
          last_name: values.last_name?.trim() ?? '',
          is_active: values.is_active,
          is_staff: values.is_staff,
          user_kind: values.user_kind,
          default_tenant: values.default_tenant ?? null,
          role_ids: values.role_ids ?? [],
        }
        if (!editing || values.password) {
          payload.password = values.password
        }
        return payload
      }}
      tableScrollX={1500}
    />
  )
}

export default UserManagePage
