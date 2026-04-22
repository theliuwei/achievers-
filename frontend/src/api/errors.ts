/** 解析 DRF 常见错误体为一条可读文案 */
export const parseApiError = (data: unknown): string => {
  if (!data || typeof data !== 'object') {
    return '请求失败，请稍后重试'
  }
  const d = data as Record<string, unknown>
  if (typeof d.detail === 'string') {
    return d.detail
  }
  if (Array.isArray(d.detail) && d.detail.length > 0) {
    return String(d.detail[0])
  }
  const nonField = d.non_field_errors
  if (Array.isArray(nonField) && nonField.length > 0) {
    return String(nonField[0])
  }
  for (const [, v] of Object.entries(d)) {
    if (Array.isArray(v) && v.length > 0) {
      return String(v[0])
    }
  }
  return '请求失败，请稍后重试'
}
