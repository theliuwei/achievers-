const FIELD_LABELS: Record<string, string> = {
  code: '代码',
  detail: '详情',
  email: '邮箱',
  name: '名称',
  non_field_errors: '错误',
  password: '密码',
  path: '前端路由',
  phone: '联系电话',
  slug: 'URL 标识',
  title: '标题',
  username: '用户名',
}

const fieldLabel = (field: string) => FIELD_LABELS[field] ?? field

const flattenApiError = (value: unknown, prefix?: string): string[] => {
  if (value == null) {
    return []
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return [prefix ? `${fieldLabel(prefix)}：${String(value)}` : String(value)]
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenApiError(item, prefix))
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) =>
      flattenApiError(item, key),
    )
  }
  return []
}

/** 解析 DRF 常见错误体为一条可读文案，支持字段级错误。 */
export const parseApiError = (data: unknown): string => {
  if (typeof data === 'string') {
    return data
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const errorBody = data as Record<string, unknown>
    if (errorBody.detail != null) {
      const detailMessages = flattenApiError(errorBody.detail)
      if (detailMessages.length) {
        return detailMessages.join('；')
      }
    }
    if (errorBody.non_field_errors != null) {
      const nonFieldMessages = flattenApiError(errorBody.non_field_errors)
      if (nonFieldMessages.length) {
        return nonFieldMessages.join('；')
      }
    }
  }
  const messages = flattenApiError(data)
  return messages.length ? messages.join('；') : '请求失败，请稍后重试'
}
