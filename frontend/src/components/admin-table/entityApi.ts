import type { Key } from 'react'
import { del, get, patch, post } from '../../api/http'
import type { EntityApi, EntityRecord } from './types'

interface DrfPage<T> {
  count: number
  results: T[]
}

const normalizePage = <T,>(data: T[] | DrfPage<T>) => {
  if (Array.isArray(data)) {
    return { data, total: data.length }
  }
  return { data: data.results, total: data.count }
}

export const createEntityApi = <
  T extends EntityRecord,
  FormValues extends object = Record<string, unknown>,
>(
  baseUrl: string,
): EntityApi<T, FormValues> => ({
  list: async (params) => {
    const { current, pageSize, ...rest } = params
    const data = await get<T[] | DrfPage<T>>(baseUrl, {
      params: {
        ...rest,
        page: current,
        page_size: pageSize,
      },
    })
    return normalizePage(data)
  },
  create: (values) => post<T, FormValues>(baseUrl, values),
  update: (id: Key, values) => patch<T, FormValues>(`${baseUrl}${id}/`, values),
  remove: (id: Key) => del<void>(`${baseUrl}${id}/`),
})
