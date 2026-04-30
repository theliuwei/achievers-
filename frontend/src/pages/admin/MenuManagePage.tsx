import { useMemo } from 'react'
import { Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { AdminTablePage, type EntityFieldConfig } from '../../components/admin-table'
import { navMenuItemOptions, searchableSelectProps } from '../../api/options'
import {
  createNavMenuItem,
  deleteNavMenuItem,
  fetchNavMenuItems,
  updateNavMenuItem,
  type NavMenuItemPayload,
  type NavMenuItemRow,
} from '../../api/navMenuItems'

type MenuFormValues = NavMenuItemPayload & Record<string, unknown>

const renderDisplay = (displayValue?: string | null, id?: number | null) => displayValue || id || '-'
const MenuManagePage = () => {
  const { t } = useTranslation('common')
  const activeOptions = useMemo(
    () => [
      { label: t('status.enabled'), value: true },
      { label: t('status.disabled'), value: false },
    ],
    [t],
  )
  const fields = useMemo<EntityFieldConfig<NavMenuItemRow>[]>(
    () => [
      { key: 'id', title: t('fields.id'), valueType: 'digit', form: false, search: true, table: { width: 72 } },
      { key: 'title', title: t('menu.fields.title'), valueType: 'text', search: true, form: { rules: [{ required: true, message: t('menu.validation.titleRequired') }] }, table: { width: 160 } },
      { key: 'path', title: t('menu.fields.path'), valueType: 'text', search: true, form: { placeholder: t('menu.validation.pathPlaceholder') }, table: { width: 220, ellipsis: true } },
      {
        key: 'parent',
        title: t('menu.fields.parent'),
        valueType: 'select',
        search: { valueType: 'digit' },
        form: { placeholder: t('menu.validation.parentPlaceholder'), request: navMenuItemOptions, componentProps: searchableSelectProps },
        table: { width: 160, render: (_, row) => renderDisplay(row.parent_display, row.parent) },
      },
      { key: 'icon', title: t('menu.fields.icon'), valueType: 'text', search: true, table: { width: 180 } },
      { key: 'permission_code', title: t('menu.fields.permissionCode'), valueType: 'text', search: true, table: { width: 220, ellipsis: true } },
      { key: 'sort_order', title: t('fields.sortOrder'), valueType: 'digit', search: true, form: { rules: [{ required: true, message: t('menu.validation.sortRequired') }] }, table: { width: 90, sorter: true } },
      {
        key: 'is_active',
        title: t('status.label'),
        valueType: 'select',
        options: activeOptions,
        search: true,
        form: { rules: [{ required: true, message: t('menu.validation.statusRequired') }] },
        table: { width: 90, render: (_, row) => <Tag color={row.is_active ? 'green' : 'default'}>{row.is_active ? t('status.enabled') : t('status.disabled')}</Tag> },
      },
    ],
    [activeOptions, t],
  )
  return (
    <AdminTablePage<NavMenuItemRow, MenuFormValues>
      listTitle={t('common.listTitle')}
      fields={fields}
      api={{
        list: fetchNavMenuItems,
        create: createNavMenuItem,
        update: (id, values) => updateNavMenuItem(Number(id), values),
        remove: (id) => deleteNavMenuItem(Number(id)),
      }}
      rowKey="id"
      createTitle={t('menu.actions.create')}
      editTitle={t('menu.actions.edit')}
      createDefaults={{ parent: null, path: '', icon: '', permission_code: '', sort_order: 0, is_active: true }}
      transformSubmit={(values) => ({
        parent: values.parent ?? null,
        title: values.title.trim(),
        path: values.path?.trim() ?? '',
        icon: values.icon?.trim() ?? '',
        permission_code: values.permission_code?.trim() ?? '',
        sort_order: Number(values.sort_order ?? 0),
        is_active: values.is_active,
      })}
      tableScrollX={1200}
    />
  )
}

export default MenuManagePage
