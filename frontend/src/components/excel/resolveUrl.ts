import { apiUrl } from '../../api/client'

/** 绝对 URL 原样返回；否则按站点 API 基址拼接 */
export const resolveApiOrAbsoluteUrl = (url: string): string => {
  if (/^https?:\/\//i.test(url)) {
    return url
  }
  return apiUrl(url)
}
