import { createEntityApi } from '../components/admin-table'

export interface TenantRow {
  id: number
  created_at?: string
  updated_at?: string
  name: string
  code: string
  address: string
  contact_name: string
  contact_phone: string
  contact_email: string
  primary_admin: number | null
  is_active: boolean
  subscription_starts_at: string | null
  subscription_expires_at: string | null
  max_members: number
  storage_quota_mb: number
  storage_used_mb: number
  locked_reason: string
  is_subscription_expired?: boolean
  active_member_count?: number
}

export interface TenantMembershipRow {
  id: number
  created_at?: string
  updated_at?: string
  user: number
  tenant: number
  status: 'invited' | 'active' | 'suspended'
  title: string
  department: number | null
  reports_to: number | null
  invited_by: number | null
  roles: number[]
}

export interface DepartmentRow {
  id: number
  created_at?: string
  updated_at?: string
  tenant: number
  name: string
  parent: number | null
  manager: number | null
  sort_order: number
  is_active: boolean
}

export interface ProductRow {
  id: number
  created_at?: string
  updated_at?: string
  sku: string | null
  name: string
  slug: string
  summary: string
  description: string
  attributes: Record<string, unknown>
  origin_country: string
  source_url: string
  external_id: string
  status: 'draft' | 'active' | 'archived'
  sort_order: number
  category: number
  brand?: { id: number; name: string; slug: string }
}

export interface CustomerRow {
  id: number
  created_at?: string
  updated_at?: string
  tenant: number
  name: string
  company_name: string
  country: string
  email: string
  phone: string
  whatsapp: string
  source: string
  level: 'normal' | 'important'
  notes: string
  owner: number | null
}

export interface InquiryRow {
  id: number
  created_at?: string
  updated_at?: string
  tenant: number
  customer: number | null
  subject: string
  product_name: string
  message: string
  country: string
  source: string
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'invalid'
  assignee: number | null
}

export interface QuotationRow {
  id: number
  created_at?: string
  updated_at?: string
  tenant: number
  customer: number | null
  inquiry: number | null
  quote_no: string
  currency: string
  total_amount: string
  trade_term: string
  status: 'draft' | 'sent' | 'confirmed' | 'won' | 'lost'
  valid_until: string | null
  owner: number | null
}

export type TenantPayload = Omit<
  TenantRow,
  'id' | 'created_at' | 'updated_at' | 'is_subscription_expired' | 'active_member_count'
>
export type TenantMembershipPayload = Omit<TenantMembershipRow, 'id' | 'created_at' | 'updated_at'>
export type DepartmentPayload = Omit<DepartmentRow, 'id' | 'created_at' | 'updated_at'>
export type ProductPayload = Omit<ProductRow, 'id' | 'created_at' | 'updated_at' | 'brand'>
export type CustomerPayload = Omit<CustomerRow, 'id' | 'created_at' | 'updated_at'>
export type InquiryPayload = Omit<InquiryRow, 'id' | 'created_at' | 'updated_at'>
export type QuotationPayload = Omit<QuotationRow, 'id' | 'created_at' | 'updated_at'>

export const tenantApi = createEntityApi<TenantRow, TenantPayload>('/api/v1/tenants/')
export const departmentApi = createEntityApi<DepartmentRow, DepartmentPayload>('/api/v1/departments/')
export const tenantMembershipApi = createEntityApi<TenantMembershipRow, TenantMembershipPayload>(
  '/api/v1/tenant-memberships/',
)
export const productApi = createEntityApi<ProductRow, ProductPayload>('/api/v1/admin-products/')
export const customerApi = createEntityApi<CustomerRow, CustomerPayload>('/api/v1/customers/')
export const inquiryApi = createEntityApi<InquiryRow, InquiryPayload>('/api/v1/inquiries/')
export const quotationApi = createEntityApi<QuotationRow, QuotationPayload>('/api/v1/quotations/')
