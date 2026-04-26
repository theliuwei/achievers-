import { useMemo, useRef, useState } from 'react'
import type { Key } from 'react'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { ModalForm, ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components'
import { App, Button, Card, Space, Typography } from 'antd'
import { optionsToValueEnum, renderFormItem } from './renderers'
import type { AdminTablePageProps, EntityRecord } from './types'

const { Text } = Typography

export function AdminTablePage<
  T extends EntityRecord,
  FormValues extends EntityRecord = EntityRecord,
>({
  rowKey = 'id' as keyof T & string,
  listTitle = '应用列表',
  fields,
  api,
  createTitle = '新增',
  editTitle = '编辑',
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
  const actionRef = useRef<ActionType>(null)
  const formRef = useRef<ProFormInstance>(null)
  const [selectedRows, setSelectedRows] = useState<T[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)

  const columns = useMemo<ProColumns<T>[]>(() => {
    const generated = fields.map((field): ProColumns<T> => {
      const table = field.table === false ? {} : (field.table ?? {})
      const search = field.search === true ? {} : field.search
      return {
        title: field.title,
        dataIndex: field.dataIndex ?? field.key,
        valueType: field.valueType === 'textarea' ? 'text' : field.valueType,
        valueEnum: optionsToValueEnum(field.options),
        hideInTable: field.table === false,
        hideInSearch: field.search === false || field.search == null,
        render: field.render,
        ...table,
        ...(search && typeof search === 'object' ? search : {}),
      }
    })

    if (!canUpdate && !extraActions) {
      return generated
    }

    return [
      ...generated,
      {
        title: '操作',
        valueType: 'option',
        width: 120,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            {canUpdate && api.update ? (
              <Button
                size="small"
                type="link"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditing(record)
                  setModalOpen(true)
                }}
              >
                编辑
              </Button>
            ) : null}
            {extraActions?.(record, actionRef.current ?? undefined)}
          </Space>
        ),
      },
    ]
  }, [api.update, canUpdate, extraActions, fields])

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
  }

  const submit = async (values: FormValues) => {
    const payload = transformSubmit ? transformSubmit(values, editing) : values
    if (editing) {
      if (!api.update) return false
      await api.update(editing[rowKey] as Key, payload)
      message.success('保存成功')
    } else {
      if (!api.create) return false
      await api.create(payload)
      message.success('新增成功')
    }
    closeModal()
    actionRef.current?.reload()
    return true
  }

  const deleteRows = () => {
    if (!selectedRows.length || !api.remove) {
      return
    }
    modal.confirm({
      title: '确认删除',
      content: `将删除 ${selectedRows.length} 条记录，是否继续？`,
      okText: '删除',
      okType: 'danger',
      onOk: async () => {
        await Promise.all(selectedRows.map((row) => api.remove?.(row[rowKey] as Key)))
        message.success('删除成功')
        setSelectedRows([])
        actionRef.current?.reload()
      },
    })
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
          optionRender: (_, __, dom) => {
            const [resetButton, submitButton, ...restButtons] = dom
            return [submitButton, resetButton, ...restButtons].filter(Boolean)
          },
        }}
        pagination={{ defaultPageSize: 20, showSizeChanger: true }}
        scroll={{ x: tableScrollX }}
        rowSelection={{
          onChange: (_, rows) => setSelectedRows(rows),
        }}
        tableAlertRender={({ selectedRowKeys }) => (
          <Text>
            已选择 <Text strong>{selectedRowKeys.length}</Text> 项
          </Text>
        )}
        tableAlertOptionRender={() => (
          <Button type="link" size="small" onClick={() => setSelectedRows([])}>
            清空
          </Button>
        )}
        headerTitle={listTitle}
        toolBarRender={() => [
          canCreate && api.create ? (
            <Button key="create" type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增
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
              删除
            </Button>
          ) : null,
        ]}
      />

      <ModalForm<FormValues>
        formRef={formRef}
        open={modalOpen}
        title={editing ? editTitle : createTitle}
        modalProps={{ destroyOnClose: true, onCancel: closeModal }}
        initialValues={
          editing
            ? (recordToFormValues?.(editing) ?? (editing as unknown as Partial<FormValues>))
            : createDefaults
        }
        onFinish={submit}
        grid
      >
        {fields
          .filter((field) => field.form !== false)
          .map((field) => renderFormItem(field, editing))}
      </ModalForm>
    </Card>
  )
}
