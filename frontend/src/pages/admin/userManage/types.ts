export type UserStatus = 'active' | 'inactive'

export interface UserRow {
  id: string
  username: string
  nickname: string
  email: string
  role: string
  status: UserStatus
  createdAt: string
}

/** 列表查询（可序列化，作为 ProTable searchParams） */
export interface UserListSearchParams {
  keyword?: string
  role?: string
  onlyActive?: boolean
  /** 来自搜索区 Upload 的文件名，仅演示 */
  attachmentHint?: string
}

export interface UserFormValues extends Record<string, unknown> {
  id?: string
  username: string
  nickname: string
  email: string
  role: string
  /** 与 Switch + valuePropName checked 对应 */
  active: boolean
}
