import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tag, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import { permissionOptions, searchableSelectProps } from '../../api/options'
import {
  createRole,
  deleteRole,
  fetchPermissions,
  fetchRoles,
  updateRole,
  type RolePayload,
  type RoleRow,
} from '../../api/roles'

type RoleFormValues = RolePayload & Record<string, unknown>

const RoleManagePage = () => {
  const { t } = useTranslation('common')
  const { data: permissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: fetchPermissions,
  })

  const permissionNameMap = useMemo(
    () => new Map(permissions.map((permission) => [permission.id, permission.name])),
    [permissions],
  )
  const activeOptions = useMemo(
    () => [
      { label: t('status.enabled'), value: true },
      { label: t('status.disabled'), value: false },
    ],
    [t],
  )
  const systemOptions = useMemo(
    () => [
      { label: t('common.yes'), value: true },
      { label: t('common.no'), value: false },
    ],
    [t],
  )
  const dataScopeOptions = useMemo(
    () => [
      { label: t('role.scope.own'), value: 'own' },
      { label: t('role.scope.department'), value: 'department' },
      { label: t('role.scope.tenant'), value: 'tenant' },
      { label: t('role.scope.all'), value: 'all' },
    ],
    [t],
  )

  const fields = useMemo<EntityFieldConfig<RoleRow>[]>(
    () => [
      {
        key: 'id',
        title: t('fields.id'),
        valueType: 'digit',
        form: false,
        search: true,
        table: { width: 72, sorter: true },
      },
      {
        key: 'code',
        title: t('role.fields.code'),
        valueType: 'text',
        search: true,
        form: {
          rules: [{ required: true, message: t('role.validation.codeRequired') }],
          readonlyOnEdit: true,
        },
        table: { width: 180, sorter: true },
      },
      {
        key: 'name',
        title: t('role.fields.name'),
        valueType: 'text',
        search: true,
        form: { rules: [{ required: true, message: t('role.validation.nameRequired') }] },
        table: { width: 160, sorter: true },
      },
      {
        key: 'description',
        title: t('role.fields.description'),
        valueType: 'textarea',
        search: true,
        table: { ellipsis: true, width: 240 },
      },
      {
        key: 'data_scope',
        title: t('role.fields.dataScope'),
        valueType: 'select',
        options: dataScopeOptions,
        search: true,
        form: { rules: [{ required: true, message: t('role.validation.scopeRequired') }] },
        table: {
          width: 140,
          render: (_, record) => (
            <Tag>{dataScopeOptions.find((item) => item.value === record.data_scope)?.label}</Tag>
          ),
        },
      },
      {
        key: 'permissions',
        title: t('role.fields.permissions'),
        valueType: 'select',
        search: false,
        form: {
          request: permissionOptions,
          componentProps: {
            ...searchableSelectProps,
            mode: 'multiple',
          },
        },
        table: { width: 280 },
        render: (_, record) => {
          const ids = record.permissions ?? []
          if (!ids.length) return <Tag>{t('common.unbound')}</Tag>
          const visible = ids.slice(0, 3)
          return (
            <>
              {visible.map((id) => (
                <Tag key={id}>{permissionNameMap.get(id) ?? `#${id}`}</Tag>
              ))}
              {ids.length > visible.length ? (
                <Tooltip title={ids.map((id) => permissionNameMap.get(id) ?? `#${id}`).join(', ')}>
                  <Tag>+{ids.length - visible.length}</Tag>
                </Tooltip>
              ) : null}
            </>
          )
        },
      },
      {
        key: 'is_active',
        title: t('status.label'),
        valueType: 'select',
        options: activeOptions,
        search: true,
        form: { rules: [{ required: true, message: t('role.validation.statusRequired') }] },
        table: {
          width: 96,
          render: (_, record) => (
            <Tag color={record.is_active ? 'green' : 'default'}>
              {record.is_active ? t('status.enabled') : t('status.disabled')}
            </Tag>
          ),
        },
      },
      {
        key: 'is_system',
        title: t('role.fields.isSystem'),
        valueType: 'select',
        options: systemOptions,
        search: true,
        form: { rules: [{ required: true, message: t('role.validation.systemRequired') }] },
        table: {
          width: 110,
          render: (_, record) => (
            <Tag color={record.is_system ? 'blue' : 'default'}>
              {record.is_system ? t('common.yes') : t('common.no')}
            </Tag>
          ),
        },
      },
      {
        key: 'created_at',
        title: t('fields.createdAt'),
        valueType: 'dateTime',
        form: false,
        search: false,
        table: { width: 170, sorter: true },
      },
      {
        key: 'updated_at',
        title: t('fields.updatedAt'),
        valueType: 'dateTime',
        form: false,
        search: false,
        table: { width: 170, sorter: true },
      },
    ],
    [activeOptions, dataScopeOptions, permissionNameMap, systemOptions, t],
  )

  return (
    <AdminTablePage<RoleRow, RoleFormValues>
      listTitle={t('common.listTitle')}
      fields={fields}
      api={{
        list: fetchRoles,
        create: createRole,
        update: (id, values) => updateRole(Number(id), values),
        remove: (id) => deleteRole(Number(id)),
      }}
      rowKey="id"
      createTitle={t('role.actions.create')}
      editTitle={t('role.actions.edit')}
      createDefaults={{ data_scope: 'own', is_active: true, is_system: false, permissions: [] }}
      transformSubmit={(values) => ({
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description?.trim() ?? '',
        data_scope: values.data_scope,
        is_active: values.is_active,
        is_system: values.is_system,
        permissions: values.permissions ?? [],
      })}
      tableScrollX={1500}
    />
  )
}

export default RoleManagePage
