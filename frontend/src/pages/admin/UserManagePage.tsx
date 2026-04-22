import { useCallback, useMemo, useState } from 'react'
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import { App, Button, Modal, Space, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { UploadFile } from 'antd/es/upload'
import { Link } from 'react-router-dom'
import { apiUrl } from '../../api/client'
import { ActionModal, ProTable, SearchForm } from '../../components/pro'
import type { ProTableRequestParams } from '../../components/pro/types'
import { ExportExcel, ImportExcel } from '../../components/excel'
import { ListPageToolbar } from '../../components/list-page'
import {
  ACTION_ICON_LABELS,
  AddIcon,
  DeleteIcon,
  EditIcon,
  RefreshIcon,
} from '../../components/action-icons'
import {
  mockCreateUser,
  mockDeleteUsers,
  mockExportUsers,
  mockFetchUserPage,
  mockImportUsers,
  mockUpdateUser,
} from './userManage/mockUsersApi'
import { ROLE_OPTIONS, userFormModalSchema, userSearchSchema } from './userManage/schemas'
import type { UserFormValues, UserListSearchParams, UserRow } from './userManage/types'

const { Title, Text } = Typography

function pickSearchParams(values: Record<string, unknown>): UserListSearchParams {
  const fileList = values.attachment as UploadFile[] | undefined
  const first = fileList?.[0]
  return {
    keyword: typeof values.keyword === 'string' ? values.keyword.trim() || undefined : undefined,
    role: typeof values.role === 'string' ? values.role : undefined,
    onlyActive: Boolean(values.onlyActive),
    attachmentHint: first?.name,
  }
}

function rowToFormValues(row: UserRow): UserFormValues {
  return {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    email: row.email,
    role: row.role,
    active: row.status === 'active',
  }
}

const UserManagePage = () => {
  const { modal, message } = App.useApp()
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [searchParams, setSearchParams] = useState<UserListSearchParams>({})
  const [listVersion, setListVersion] = useState(0)
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [editing, setEditing] = useState<UserRow | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [selectedRows, setSelectedRows] = useState<UserRow[]>([])

  const tableSearchKey = useMemo(
    () => ({ ...searchParams, __v: listVersion }),
    [searchParams, listVersion],
  )

  const loadTable = useCallback(
    async (params: ProTableRequestParams<UserRow>) => mockFetchUserPage(searchParams, params),
    [searchParams],
  )

  const exportParams = useMemo(
    () => ({ ...searchParams } as Record<string, unknown>),
    [searchParams],
  )

  const exportApi = useCallback(
    async (params: Record<string, unknown>, opts?: { signal?: AbortSignal }) => {
      return mockExportUsers(params as UserListSearchParams, opts?.signal)
    },
    [],
  )

  const refreshTable = useCallback(() => {
    setListVersion((v) => v + 1)
  }, [])

  const handleSearchFinish = useCallback((values: Record<string, unknown>) => {
    setSearchParams(pickSearchParams(values))
  }, [])

  const handleSearchReset = useCallback(() => {
    setSearchParams({})
  }, [])

  const openCreate = useCallback(() => {
    setEditing(null)
    setUserModalOpen(true)
  }, [])

  const openEdit = useCallback((row: UserRow) => {
    setEditing(row)
    setUserModalOpen(true)
  }, [])

  const closeUserModal = useCallback(() => {
    setUserModalOpen(false)
    setEditing(null)
  }, [])

  const submitUser = useCallback(
    async (values: UserFormValues) => {
      if (editing) {
        await mockUpdateUser({ ...values, id: editing.id })
      } else {
        await mockCreateUser(values)
      }
      refreshTable()
      setSelectedRowKeys([])
      setSelectedRows([])
    },
    [editing, refreshTable],
  )

  const importUploadApi = useCallback(async (file: File) => mockImportUsers(file), [])

  const handleModify = useCallback(() => {
    const row = selectedRows[0]
    if (row) {
      openEdit(row)
    }
  }, [openEdit, selectedRows])

  const handleDelete = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      return
    }
    modal.confirm({
      title: '确认删除',
      content: `将删除 ${selectedRowKeys.length} 条用户记录（演示数据）。`,
      okText: '删除',
      okType: 'danger',
      onOk: async () => {
        await mockDeleteUsers(selectedRowKeys.map(String))
        message.success('已删除')
        setSelectedRowKeys([])
        setSelectedRows([])
        refreshTable()
      },
    })
  }, [message, modal, refreshTable, selectedRowKeys])

  const columns: ColumnsType<UserRow> = useMemo(
    () => [
      { title: '用户名', dataIndex: 'username', width: 120, sorter: true },
      { title: '昵称', dataIndex: 'nickname', width: 120, sorter: true },
      { title: '邮箱', dataIndex: 'email', ellipsis: true, sorter: true },
      {
        title: '角色',
        dataIndex: 'role',
        width: 100,
        render: (role: string) => ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role,
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (status: UserRow['status']) =>
          status === 'active' ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>,
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        width: 180,
        sorter: true,
        render: (iso: string) => new Date(iso).toLocaleString('zh-CN'),
      },
    ],
    [],
  )

  return (
    <div>
      <Title level={4} style={{ marginTop: 0 }}>
        用户管理
      </Title>
      <Text type="secondary">
        右侧工具栏为图标按钮（悬停可见说明）；表格左上方为导入 / 导出。修改与删除依赖表格多选。
      </Text>
      <div style={{ marginTop: 8 }}>
        <Link to={apiUrl('/api/docs/')} target="_blank" rel="noreferrer">
          打开 Swagger — accounts
        </Link>
      </div>

      <ListPageToolbar
        searchExpanded={searchExpanded}
        onToggleSearch={() => setSearchExpanded((v) => !v)}
        searchContent={
          <SearchForm
            schema={userSearchSchema}
            onFinish={handleSearchFinish}
            onReset={handleSearchReset}
            initialValues={{ onlyActive: false, attachment: [] }}
          />
        }
      >
        <Button
          type="primary"
          icon={<AddIcon />}
          onClick={openCreate}
          title={ACTION_ICON_LABELS.add}
          aria-label={ACTION_ICON_LABELS.add}
        />
        <Button
          icon={<EditIcon />}
          disabled={selectedRows.length !== 1}
          onClick={handleModify}
          title={ACTION_ICON_LABELS.edit}
          aria-label={ACTION_ICON_LABELS.edit}
        />
        <Button
          danger
          icon={<DeleteIcon />}
          disabled={selectedRowKeys.length === 0}
          onClick={handleDelete}
          title={ACTION_ICON_LABELS.delete}
          aria-label={ACTION_ICON_LABELS.delete}
        />
        <Button
          icon={<RefreshIcon />}
          onClick={refreshTable}
          title={ACTION_ICON_LABELS.refresh}
          aria-label={ACTION_ICON_LABELS.refresh}
        />
      </ListPageToolbar>

      <div style={{ marginBottom: 8 }}>
        <Space.Compact>
          <Button
            icon={<UploadOutlined />}
            onClick={() => setImportModalOpen(true)}
          >
            导入
          </Button>
          <ExportExcel
            api={exportApi}
            params={exportParams}
            fileName={`用户列表-${new Date().toISOString().slice(0, 10)}.csv`}
            buttonProps={{
              icon: <DownloadOutlined />,
              type: 'default',
            }}
          >
            导出
          </ExportExcel>
        </Space.Compact>
      </div>

      <ProTable<UserRow>
        rowKey="id"
        columns={columns}
        request={loadTable}
        searchParams={tableSearchKey}
        scroll={{ x: 960 }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys, rows) => {
            setSelectedRowKeys(keys)
            setSelectedRows(rows)
          },
        }}
      />

      <ActionModal<UserFormValues>
        open={userModalOpen}
        onClose={closeUserModal}
        title={editing ? '编辑用户' : '新增用户'}
        schema={userFormModalSchema}
        initialValues={editing ? rowToFormValues(editing) : undefined}
        createDefaults={{ active: true, role: 'editor' }}
        api={submitUser}
      />

      <Modal
        title="导入用户（Excel）"
        open={importModalOpen}
        onCancel={() => setImportModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={560}
      >
        <ImportExcel
          api={importUploadApi}
          templateUrl="/templates/users-import-template.csv"
          onSuccess={() => {
            setImportModalOpen(false)
            refreshTable()
          }}
        />
      </Modal>
    </div>
  )
}

export default UserManagePage
