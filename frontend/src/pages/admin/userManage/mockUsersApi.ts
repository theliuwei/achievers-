import type { ProTableRequestParams, ProTableRequestResult } from '../../../components/pro/types'
import type { UserListSearchParams, UserRow, UserFormValues } from './types'
import type { SorterResult } from 'antd/es/table/interface'
import i18n from '../../../i18n'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

let seq = 100

const seedRows: UserRow[] = [
  {
    id: '1',
    username: 'alice',
    nickname: '爱丽丝',
    email: 'alice@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: '2',
    username: 'bob',
    nickname: '鲍勃',
    email: 'bob@example.com',
    role: 'editor',
    status: 'active',
    createdAt: '2026-02-15T10:30:00.000Z',
  },
  {
    id: '3',
    username: 'carol',
    nickname: '卡萝',
    email: 'carol@example.com',
    role: 'viewer',
    status: 'inactive',
    createdAt: '2026-03-01T12:00:00.000Z',
  },
  {
    id: '4',
    username: 'david',
    nickname: '大卫',
    email: 'david@example.com',
    role: 'editor',
    status: 'active',
    createdAt: '2026-03-20T09:15:00.000Z',
  },
  {
    id: '5',
    username: 'erin',
    nickname: '艾琳',
    email: 'erin@example.com',
    role: 'viewer',
    status: 'active',
    createdAt: '2026-04-01T14:45:00.000Z',
  },
]

/** 内存数据源（演示用，刷新页面会重置） */
let mockStore: UserRow[] = seedRows.map((r) => ({ ...r }))

function applyFilters(list: UserRow[], filters: UserListSearchParams): UserRow[] {
  let out = list
  const kw = filters.keyword?.trim().toLowerCase()
  if (kw) {
    out = out.filter(
      (u) =>
        u.username.toLowerCase().includes(kw) ||
        u.nickname.toLowerCase().includes(kw) ||
        u.email.toLowerCase().includes(kw),
    )
  }
  if (filters.role) {
    out = out.filter((u) => u.role === filters.role)
  }
  if (filters.onlyActive) {
    out = out.filter((u) => u.status === 'active')
  }
  return out
}

function applySorter(
  list: UserRow[],
  sorter: SorterResult<UserRow> | SorterResult<UserRow>[],
): UserRow[] {
  const s = Array.isArray(sorter) ? sorter[0] : sorter
  if (!s?.field || !s.order) {
    return list
  }
  const field = s.field as keyof UserRow
  const dir = s.order === 'ascend' ? 1 : -1
  return [...list].sort((a, b) => {
    const va = a[field]
    const vb = b[field]
    if (va === vb) {
      return 0
    }
    if (va == null) {
      return 1
    }
    if (vb == null) {
      return -1
    }
    return String(va).localeCompare(String(vb), i18n.language) * dir
  })
}

export async function mockFetchUserPage(
  filters: UserListSearchParams,
  table: ProTableRequestParams<UserRow>,
): Promise<ProTableRequestResult<UserRow>> {
  await delay(280)
  let list = applyFilters(mockStore, filters)
  list = applySorter(list, table.sorter)
  const total = list.length
  const start = (table.current - 1) * table.pageSize
  const data = list.slice(start, start + table.pageSize)
  return { data, total }
}

export async function mockCreateUser(values: UserFormValues): Promise<UserRow> {
  await delay(200)
  if (mockStore.some((u) => u.username === values.username)) {
    throw new Error(i18n.t('common:userManage.errors.usernameExists'))
  }
  const row: UserRow = {
    id: String(++seq),
    username: values.username,
    nickname: values.nickname,
    email: values.email,
    role: values.role,
    status: values.active ? 'active' : 'inactive',
    createdAt: new Date().toISOString(),
  }
  mockStore = [row, ...mockStore]
  return row
}

export async function mockUpdateUser(values: UserFormValues): Promise<UserRow> {
  await delay(200)
  const id = values.id
  if (!id) {
    throw new Error(i18n.t('common:userManage.errors.missingId'))
  }
  const idx = mockStore.findIndex((u) => u.id === id)
  if (idx === -1) {
    throw new Error(i18n.t('common:userManage.errors.userNotFound'))
  }
  const prev = mockStore[idx]
  const next: UserRow = {
    ...prev,
    username: values.username,
    nickname: values.nickname,
    email: values.email,
    role: values.role,
    status: values.active ? 'active' : 'inactive',
  }
  mockStore = [...mockStore.slice(0, idx), next, ...mockStore.slice(idx + 1)]
  return next
}

export async function mockDeleteUsers(ids: string[]): Promise<void> {
  await delay(200)
  if (ids.length === 0) {
    return
  }
  const idSet = new Set(ids)
  mockStore = mockStore.filter((u) => !idSet.has(u.id))
}

export async function mockImportUsers(file: File): Promise<{ imported: number }> {
  await delay(400)
  void file
  const stamp = Date.now()
  const extra: UserRow[] = [
    {
      id: String(++seq),
      username: `imported_${stamp}`,
      nickname: i18n.t('common:userManage.import.userA'),
      email: `import_a_${stamp}@example.com`,
      role: 'editor',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: String(++seq),
      username: `imported_b_${stamp}`,
      nickname: i18n.t('common:userManage.import.userB'),
      email: `import_b_${stamp}@example.com`,
      role: 'viewer',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ]
  mockStore = [...extra, ...mockStore]
  return { imported: extra.length }
}

/** 演示导出：CSV（Excel 可直接打开），含当前筛选条件说明 */
export async function mockExportUsers(
  filters: UserListSearchParams,
  signal?: AbortSignal,
): Promise<Blob> {
  await delay(220)
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError')
  }
  const list = applyFilters(mockStore, filters)
  const header = 'id,username,nickname,email,role,status,createdAt\n'
  const body = list
    .map(
      (u) =>
        [u.id, u.username, u.nickname, u.email, u.role, u.status, u.createdAt].join(','),
    )
    .join('\n')
  const meta = `# filters: ${JSON.stringify(filters)}\n`
  const csv = `\ufeff${meta}${header}${body}`
  return new Blob([csv], { type: 'text/csv;charset=utf-8' })
}
