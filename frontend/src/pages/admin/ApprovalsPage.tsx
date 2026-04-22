import { App, Button, Space, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import {
  approveRegistration,
  fetchPendingRegistrations,
  rejectRegistration,
  type PendingUser,
} from '../../api/pendingRegistrations'
import { ActionIcon, ACTION_ICON_LABELS } from '../../components/action-icons'

const { Title, Paragraph } = Typography

const ApprovalsPage = () => {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<PendingUser[]>([])
  const [actingId, setActingId] = useState<number | null>(null)

  const load = () => {
    void (async () => {
      setLoading(true)
      try {
        const data = await fetchPendingRegistrations()
        setRows(data)
      } catch (e) {
        message.error(e instanceof Error ? e.message : '加载失败')
        setRows([])
      } finally {
        setLoading(false)
      }
    })()
  }

  useEffect(() => {
    let alive = true
    void (async () => {
      setLoading(true)
      try {
        const data = await fetchPendingRegistrations()
        if (!alive) {
          return
        }
        setRows(data)
      } catch (e) {
        if (!alive) {
          return
        }
        message.error(e instanceof Error ? e.message : '加载失败')
        setRows([])
      } finally {
        if (alive) {
          setLoading(false)
        }
      }
    })()
    return () => {
      alive = false
    }
  }, [message])

  const onApprove = async (id: number) => {
    setActingId(id)
    try {
      await approveRegistration(id)
      message.success('已通过')
      await load()
    } catch (e) {
      message.error(e instanceof Error ? e.message : '操作失败')
    } finally {
      setActingId(null)
    }
  }

  const onReject = async (id: number) => {
    setActingId(id)
    try {
      await rejectRegistration(id)
      message.success('已拒绝')
      await load()
    } catch (e) {
      message.error(e instanceof Error ? e.message : '操作失败')
    } finally {
      setActingId(null)
    }
  }

  const columns: ColumnsType<PendingUser> = [
    { title: 'ID', dataIndex: 'id', width: 72 },
    { title: '用户名', dataIndex: 'username' },
    { title: '邮箱', dataIndex: 'email', ellipsis: true },
    { title: '名', dataIndex: 'first_name' },
    { title: '姓', dataIndex: 'last_name' },
    { title: '申请时间', dataIndex: 'date_joined', width: 200 },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            loading={actingId === record.id}
            onClick={() => void onApprove(record.id)}
          >
            通过
          </Button>
          <Button
            danger
            size="small"
            loading={actingId === record.id}
            onClick={() => void onReject(record.id)}
          >
            拒绝
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginTop: 0 }}>
        审批管理
      </Title>
      <Paragraph type="secondary">
        公开注册提交的账号在此审核；通过后账号激活并默认绑定 viewer 角色，拒绝则删除申请记录。
      </Paragraph>
      <Button
        type="primary"
        icon={<ActionIcon type="refresh" />}
        onClick={load}
        style={{ marginBottom: 12 }}
      >
        {ACTION_ICON_LABELS.refresh}
      </Button>
      <Table<PendingUser>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 20 }}
      />
    </div>
  )
}

export default ApprovalsPage
