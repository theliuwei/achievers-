import { useMemo, useRef, useState } from 'react'
import type { CSSProperties, Key, MouseEvent as ReactMouseEvent } from 'react'
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { ProForm, ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components'
import { App, Button, Card, Space, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import i18n from '../../i18n'
import { useLocaleFormat } from '../../i18n/useLocaleFormat'
import { optionsToValueEnum, renderFormItem } from './renderers'
import type { AdminTablePageProps, EntityRecord } from './types'

const { Text } = Typography
const MIN_COLUMN_WIDTH = 80

type ResizableHeaderCellProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  onColumnResize?: (nextWidth: number) => void
}

const resizeHandleStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  right: -4,
  width: 8,
  height: '100%',
  cursor: 'col-resize',
  userSelect: 'none',
  zIndex: 1,
}

const ResizableHeaderCell = ({
  onColumnResize,
  style,
  children,
  ...rest
}: ResizableHeaderCellProps) => {
  const onMouseDown = (event: ReactMouseEvent<HTMLSpanElement>) => {
    if (!onColumnResize) return
    event.preventDefault()
    event.stopPropagation()
    const th = event.currentTarget.parentElement as HTMLTableCellElement | null
    const startWidth = Math.max(
      MIN_COLUMN_WIDTH,
      Math.round((th?.getBoundingClientRect().width ?? 0) || MIN_COLUMN_WIDTH),
    )
    const startX = event.clientX

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX
      onColumnResize(Math.max(MIN_COLUMN_WIDTH, startWidth + delta))
    }
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return (
    <th
      {...rest}
      style={{
        ...style,
        position: 'relative',
      }}
    >
      {children}
      {onColumnResize ? <span style={resizeHandleStyle} onMouseDown={onMouseDown} /> : null}
    </th>
  )
}

export function AdminTablePage<
  T extends EntityRecord,
  FormValues extends EntityRecord = EntityRecord,
>({
  rowKey = 'id' as keyof T & string,
  listTitle,
  fields,
  api,
  createTitle,
  editTitle,
  createDefaults,
  recordToFormValues,
  transformSubmit,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
  tableScrollX = 'max-content',
  extraActions,
}: AdminTablePageProps<T, FormValues>) {
  const { message, modal } = App.useApp()
  const { t } = useTranslation('common')
  const { formatNumber } = useLocaleFormat()
  const actionRef = useRef<ActionType>(null)
  const formRef = useRef<ProFormInstance>(null)
  const [selectedRows, setSelectedRows] = useState<T[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})
  const resolvedListTitle = listTitle ?? i18n.t('common:common.listTitle')
  const resolvedCreateTitle = createTitle ?? t('adminTable.create')
  const resolvedEditTitle = editTitle ?? t('adminTable.edit')

  const columns = useMemo<ProColumns<T>[]>(() => {
    const generated = fields.map((field): ProColumns<T> => {
      const table = field.table === false ? {} : (field.table ?? {})
      const search = field.search === true ? {} : field.search
      const columnKey = String(field.dataIndex ?? field.key)
      const configuredWidth = typeof table.width === 'number' ? table.width : undefined
      const width = columnWidths[columnKey] ?? configuredWidth
      const column: ProColumns<T> = {
        title: field.title,
        dataIndex: field.dataIndex ?? field.key,
        valueType: field.valueType === 'textarea' ? 'text' : field.valueType,
        valueEnum: optionsToValueEnum(field.options),
        hideInTable: field.table === false,
        hideInSearch: field.search === false || field.search == null,
        render: field.render,
        // Keep dense table layout: long cell content is truncated and full text
        // is available on hover. Field-level table.ellipsis can override this.
        ellipsis: table.ellipsis ?? true,
        ...table,
        width,
        ...(search && typeof search === 'object' ? search : {}),
      }
      ;(column as ProColumns<T> & { onHeaderCell?: () => ResizableHeaderCellProps }).onHeaderCell =
        () => ({
          onColumnResize: (nextWidth) => {
            setColumnWidths((prev) => ({
              ...prev,
              [columnKey]: Math.round(nextWidth),
            }))
          },
        })
      const existingFieldProps = (column as { fieldProps?: unknown }).fieldProps
      if (!existingFieldProps || typeof existingFieldProps !== 'object' || Array.isArray(existingFieldProps)) {
        const isSelect = column.valueType === 'select'
        ;(column as { fieldProps?: Record<string, unknown> }).fieldProps = {
          ...(typeof existingFieldProps === 'object' && !Array.isArray(existingFieldProps)
            ? (existingFieldProps as Record<string, unknown>)
            : {}),
          placeholder: isSelect ? t('form.placeholders.select') : t('form.placeholders.input'),
        }
      } else if (!('placeholder' in (existingFieldProps as Record<string, unknown>))) {
        const isSelect = column.valueType === 'select'
        ;(column as { fieldProps?: Record<string, unknown> }).fieldProps = {
          ...(existingFieldProps as Record<string, unknown>),
          placeholder: isSelect ? t('form.placeholders.select') : t('form.placeholders.input'),
        }
      }
      return column
    })

    if (!canUpdate && !extraActions) {
      return generated
    }

    return [
      ...generated,
      {
        title: t('adminTable.actions'),
        valueType: 'option',
        width: columnWidths.__actions ?? 120,
        fixed: 'right',
        onHeaderCell: () => ({
          onColumnResize: (nextWidth: number) => {
            setColumnWidths((prev) => ({
              ...prev,
              __actions: Math.round(nextWidth),
            }))
          },
        }),
        render: (_, record) => (
          <Space>
            {canUpdate && api.update ? (
              <Button
                size="small"
                type="link"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditing(record)
                  setFormOpen(true)
                }}
              >
                {t('adminTable.edit')}
              </Button>
            ) : null}
            {extraActions?.(record, actionRef.current ?? undefined)}
          </Space>
        ),
      },
    ]
  }, [api.update, canUpdate, columnWidths, extraActions, fields, t])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditing(null)
  }

  const submit = async (values: FormValues) => {
    try {
      const payload = transformSubmit ? transformSubmit(values, editing) : values
      if (editing) {
        if (!api.update) return false
        await api.update(editing[rowKey] as Key, payload)
        message.success(t('messages.saveSuccess'))
      } else {
        if (!api.create) return false
        await api.create(payload)
        message.success(t('messages.createSuccess'))
      }
      closeForm()
      actionRef.current?.reload()
      return true
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('messages.submitFailed'))
      return false
    }
  }

  const deleteRows = () => {
    if (!selectedRows.length || !api.remove) {
      return
    }
    modal.confirm({
      title: t('adminTable.confirmDeleteTitle'),
      content: t('adminTable.confirmDeleteContent', { count: formatNumber(selectedRows.length) }),
      okText: t('adminTable.delete'),
      okType: 'danger',
      onOk: async () => {
        try {
          await Promise.all(selectedRows.map((row) => api.remove?.(row[rowKey] as Key)))
          message.success(t('messages.deleteSuccess'))
          setSelectedRows([])
          actionRef.current?.reload()
        } catch (error) {
          message.error(error instanceof Error ? error.message : t('messages.deleteFailed'))
          throw error
        }
      },
    })
  }

  if (formOpen) {
    const resolvedFormTitle = editing ? resolvedEditTitle : resolvedCreateTitle
    const initialValues = editing
      ? (recordToFormValues?.(editing) ?? (editing as unknown as Partial<FormValues>))
      : createDefaults

    return (
      <Card
        bordered={false}
        title={resolvedFormTitle}
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={closeForm}>
            {t('adminTable.backToList')}
          </Button>
        }
        styles={{ body: { padding: 24 } }}
      >
        <ProForm<FormValues>
          key={editing ? String(editing[rowKey]) : 'create'}
          formRef={formRef}
          layout="vertical"
          initialValues={initialValues}
          onFinish={submit}
          grid
          submitter={{
            searchConfig: { submitText: t('actions.confirm'), resetText: t('actions.cancel') },
            resetButtonProps: {
              preventDefault: true,
              onClick: closeForm,
            },
            render: (_, dom) => (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{dom}</div>
            ),
          }}
        >
          {fields
            .filter((field) => field.form !== false)
            .map((field) => renderFormItem(field, editing))}
        </ProForm>
      </Card>
    )
  }

  return (
    <Card bordered={false} styles={{ body: { padding: 24 } }}>
      <ProTable<T>
        actionRef={actionRef}
        rowKey={rowKey}
        columns={columns}
        request={async (params) => {
          const result = await api.list(params)
          return {
            data: result.data,
            total: result.total,
            success: true,
          }
        }}
        search={{
          labelWidth: 'auto',
          searchText: t('actions.search'),
          resetText: t('actions.reset'),
          collapseRender: (collapsed) =>
            collapsed ? t('actions.expand') : t('actions.collapse'),
          optionRender: (_, __, dom) => {
            const [resetButton, submitButton, ...restButtons] = dom
            return [submitButton, resetButton, ...restButtons].filter(Boolean)
          },
        }}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          showTotal: (total, range) =>
            t('pagination.totalRange', {
              start: formatNumber(range[0]),
              end: formatNumber(range[1]),
              total: formatNumber(total),
            }),
        }}
        scroll={{ x: tableScrollX }}
        components={{
          header: {
            cell: ResizableHeaderCell,
          },
        }}
        rowSelection={{
          onChange: (_, rows) => setSelectedRows(rows),
        }}
        tableAlertRender={({ selectedRowKeys }) => (
          <Text>
            {t('adminTable.selected')} <Text strong>{formatNumber(selectedRowKeys.length)}</Text>{' '}
            {t('adminTable.items')}
          </Text>
        )}
        tableAlertOptionRender={() => (
          <Button type="link" size="small" onClick={() => setSelectedRows([])}>
            {t('actions.clear')}
          </Button>
        )}
        headerTitle={resolvedListTitle}
        toolBarRender={() => [
          canCreate && api.create ? (
            <Button key="create" type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t('adminTable.create')}
            </Button>
          ) : null,
          canDelete && api.remove ? (
            <Button
              key="delete"
              danger
              icon={<DeleteOutlined />}
              disabled={!selectedRows.length}
              onClick={deleteRows}
            >
              {t('adminTable.delete')}
            </Button>
          ) : null,
        ]}
      />
    </Card>
  )
}
