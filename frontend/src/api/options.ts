import type { FieldOption } from '../components/admin-table'
import i18n from '../i18n'
import { get } from './http'

interface DrfPage<T> {
  count: number
  results: T[]
}

type OptionValue = string | number | boolean

export const searchableSelectProps = {
  showSearch: true,
  allowClear: true,
  filterOption: false,
}

const normalizeList = <T,>(data: T[] | DrfPage<T>) => (Array.isArray(data) ? data : data.results)

const loadOptions = async <T,>(
  url: string,
  keyword: string | undefined,
  getValue: (item: T) => OptionValue,
  getLabel: (item: T) => string,
  params?: Record<string, unknown>,
): Promise<FieldOption[]> => {
  const data = await get<T[] | DrfPage<T>>(url, {
    params: {
      ...params,
      search: keyword?.trim() || undefined,
      page: 1,
      page_size: 50,
    },
  })

  return normalizeList(data).map((item) => ({
    label: getLabel(item),
    value: getValue(item),
  }))
}

interface TenantOptionRow {
  id: number
  name: string
  code: string
}

interface UserOptionRow {
  id: number
  username: string
  email?: string
}

interface DepartmentOptionRow {
  id: number
  name: string
}

interface MembershipOptionRow {
  id: number
  user_display?: string | null
  title?: string
}

interface RoleOptionRow {
  id: number
  name: string
  code: string
}

interface PermissionOptionRow {
  id: number
  name: string
  code: string
}

interface ProductCategoryOptionRow {
  id: number
  name: string
  brand_detail?: { name: string } | null
}

interface ProductOptionRow {
  id: number
  name: string
  sku?: string | null
}

interface CustomerOptionRow {
  id: number
  name: string
  company_name: string
}

interface InquiryOptionRow {
  id: number
  subject: string
}

interface NavMenuItemOptionRow {
  id: number
  title: string
  path: string
}

export const tenantOptions = (keyword?: string) =>
  loadOptions<TenantOptionRow>(
    '/api/v1/tenants/',
    keyword,
    (item) => item.id,
    (item) => `${item.name}（${item.code}）`,
  )

export const userOptions = (keyword?: string) =>
  loadOptions<UserOptionRow>(
    '/api/v1/accounts/',
    keyword,
    (item) => item.id,
    (item) => (item.email ? `${item.username}（${item.email}）` : item.username),
  )

export const departmentOptions = (keyword?: string) =>
  loadOptions<DepartmentOptionRow>(
    '/api/v1/departments/',
    keyword,
    (item) => item.id,
    (item) => item.name,
  )

export const membershipOptions = (keyword?: string) =>
  loadOptions<MembershipOptionRow>(
    '/api/v1/tenant-memberships/',
    keyword,
    (item) => item.id,
    (item) =>
      [item.user_display, item.title].filter(Boolean).join(' / ') ||
      i18n.t('common:member.fallbackLabel', { id: item.id }),
  )

export const roleOptions = (keyword?: string) =>
  loadOptions<RoleOptionRow>(
    '/api/v1/roles/',
    keyword,
    (item) => item.id,
    (item) => `${item.name}（${item.code}）`,
  )

export const permissionOptions = (keyword?: string) =>
  loadOptions<PermissionOptionRow>(
    '/api/v1/permissions/',
    keyword,
    (item) => item.id,
    (item) => `${item.name}（${item.code}）`,
  )

export const productCategoryOptions = (keyword?: string) =>
  loadOptions<ProductCategoryOptionRow>(
    '/api/v1/admin-product-categories/',
    keyword,
    (item) => item.id,
    (item) => (item.brand_detail?.name ? `${item.name}（${item.brand_detail.name}）` : item.name),
  )

export const productOptions = (keyword?: string) =>
  loadOptions<ProductOptionRow>(
    '/api/v1/admin-products/',
    keyword,
    (item) => item.id,
    (item) => (item.sku ? `${item.name}（${item.sku}）` : item.name),
  )

export const customerOptions = (keyword?: string) =>
  loadOptions<CustomerOptionRow>(
    '/api/v1/customers/',
    keyword,
    (item) => item.id,
    (item) => item.company_name || item.name,
  )

export const inquiryOptions = (keyword?: string) =>
  loadOptions<InquiryOptionRow>(
    '/api/v1/inquiries/',
    keyword,
    (item) => item.id,
    (item) => item.subject,
  )

export const navMenuItemOptions = (keyword?: string) =>
  loadOptions<NavMenuItemOptionRow>(
    '/api/v1/nav-menu-items/',
    keyword,
    (item) => item.id,
    (item) => (item.path ? `${item.title}（${item.path}）` : item.title),
  )
