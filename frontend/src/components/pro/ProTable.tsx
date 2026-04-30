import { useEffect, useMemo, useRef, useState } from 'react'
import { Table } from 'antd'
import type { TableProps } from 'antd'
import type { SorterResult } from 'antd/es/table/interface'
import i18n from '../../i18n'
import type { ProTableProps, ProTableRequestParams } from './types'

function normalizeSorter<T extends object>(
  sorter: SorterResult<T> | SorterResult<T>[] | undefined,
): SorterResult<T> | SorterResult<T>[] {
  if (sorter === undefined) {
    return {}
  }
  return sorter
}

function ProTableInner<T extends object = Record<string, unknown>>({
  columns,
  request,
  pagination: paginationProp,
  defaultPageSize = 10,
  scroll,
  rowKey = 'id',
  ...tableRest
}: Omit<ProTableProps<T>, 'searchParams'>) {
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(
    paginationProp === false
      ? defaultPageSize
      : (paginationProp?.defaultPageSize ?? defaultPageSize),
  )
  const [sorter, setSorter] = useState<SorterResult<T> | SorterResult<T>[]>({})

  const requestRef = useRef(request)
  useEffect(() => {
    requestRef.current = request
  }, [request])

  useEffect(() => {
    let cancelled = false

    const exec = async () => {
      setLoading(true)
      try {
        const params: ProTableRequestParams<T> = {
          current,
          pageSize,
          sorter: normalizeSorter(sorter),
        }
        const { data, total: nextTotal } = await requestRef.current(params)
        if (!cancelled) {
          setDataSource(data)
          setTotal(nextTotal)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void exec()
    return () => {
      cancelled = true
    }
  }, [current, pageSize, sorter])

  const paginationDisabled = paginationProp === false

  const mergedPagination = useMemo((): TableProps<T>['pagination'] => {
    if (paginationDisabled) {
      return false
    }
    const base = paginationProp ?? {}
    return {
      ...base,
      current,
      pageSize,
      total,
      showSizeChanger: base.showSizeChanger ?? true,
      showQuickJumper: base.showQuickJumper ?? true,
      showTotal:
        base.showTotal ??
        ((t, range) =>
          i18n.t('common:pagination.totalRange', {
            start: range[0],
            end: range[1],
            total: t,
          })),
      onChange: (page, size) => {
        setCurrent(page)
        setPageSize(size ?? pageSize)
        base.onChange?.(page, size)
      },
      onShowSizeChange: (page, size) => {
        setCurrent(page)
        setPageSize(size)
        base.onShowSizeChange?.(page, size)
      },
    }
  }, [paginationDisabled, paginationProp, current, pageSize, total])

  const handleTableChange: TableProps<T>['onChange'] = (pag, _filters, nextSorter) => {
    if (!paginationDisabled && pag) {
      setCurrent(pag.current ?? 1)
      setPageSize(pag.pageSize ?? pageSize)
    }
    setSorter(nextSorter as SorterResult<T> | SorterResult<T>[])
  }

  return (
    <Table<T>
      {...tableRest}
      rowKey={rowKey}
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      pagination={mergedPagination}
      scroll={scroll}
      onChange={handleTableChange}
    />
  )
}

/**
 * 带远程数据、分页与排序的表格；`searchParams` 变化时会重置内部分页并重新请求（通过 remount 子树实现）。
 */
export function ProTable<T extends object = Record<string, unknown>>(props: ProTableProps<T>) {
  const { searchParams, ...innerProps } = props
  const resetKey = useMemo(() => JSON.stringify(searchParams ?? {}), [searchParams])
  return <ProTableInner<T> key={resetKey} {...innerProps} />
}
