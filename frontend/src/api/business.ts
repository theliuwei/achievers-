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
  primary_admin_display?: string | null
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
  user_display?: string | null
  tenant_display?: string | null
  status: 'invited' | 'active' | 'suspended'
  title: string
  department: number | null
  reports_to: number | null
  invited_by: number | null
  department_display?: string | null
  reports_to_display?: string | null
  invited_by_display?: string | null
  roles: number[]
  roles_display?: string[]
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
  category_display?: string | null
  brand?: { id: number; name: string; slug: string }
}

export interface CustomerRow {
  id: number
  created_at?: string
  updated_at?: string
  tenant: number
  tenant_display?: string | null
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
  owner_display?: string | null
}

export interface InquiryRow {
  id: number
  created_at?: string
  updated_at?: string
  tenant: number
  tenant_display?: string | null
  customer: number | null
  customer_display?: string | null
  subject: string
  product_name: string
  message: string
  country: string
  source: string
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'invalid'
  assignee: number | null
  assignee_display?: string | null
}

export interface QuotationRow {
  id: number
  created_at?: string
  updated_at?: string
  tenant: number
  tenant_display?: string | null
  customer: number | null
  customer_display?: string | null
  inquiry: number | null
  inquiry_display?: string | null
  quote_no: string
  currency: string
  total_amount: string
  trade_term: string
  status: 'draft' | 'sent' | 'confirmed' | 'won' | 'lost'
  valid_until: string | null
  owner: number | null
  owner_display?: string | null
}

export interface VATRateRow {
  id: number
  created_at?: string
  updated_at?: string
  country_code: string
  name: string
  rate: string
  is_price_included_default: boolean
  effective_from: string
  effective_to: string | null
  is_active: boolean
}

export interface ConsentLogRow {
  id: number
  created_at?: string
  updated_at?: string
  tenant: number | null
  tenant_display?: string | null
  user: number | null
  user_display?: string | null
  consent_type: 'cookie' | 'privacy_policy' | 'marketing' | 'terms'
  action: 'accepted' | 'revoked' | 'updated'
  policy_version: string
  ip_address: string | null
  user_agent: string
  metadata: Record<string, unknown>
}

export interface ProductTranslationRow {
  id: number
  created_at?: string
  updated_at?: string
  product: number
  product_display?: string | null
  language: string
  name: string
  summary: string
  description: string
  seo_title: string
  seo_description: string
}

export interface ProductCategoryTranslationRow {
  id: number
  created_at?: string
  updated_at?: string
  category: number
  category_display?: string | null
  language: string
  name: string
  description: string
  seo_title: string
  seo_description: string
}

export type TenantPayload = Omit<
  TenantRow,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'primary_admin_display'
  | 'is_subscription_expired'
  | 'active_member_count'
>
export type TenantMembershipPayload = Omit<
  TenantMembershipRow,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'user_display'
  | 'tenant_display'
  | 'department_display'
  | 'reports_to_display'
  | 'invited_by_display'
  | 'roles_display'
>
export type DepartmentPayload = Omit<DepartmentRow, 'id' | 'created_at' | 'updated_at'>
export type ProductPayload = Omit<ProductRow, 'id' | 'created_at' | 'updated_at' | 'category_display' | 'brand'>
export type CustomerPayload = Omit<
  CustomerRow,
  'id' | 'created_at' | 'updated_at' | 'tenant_display' | 'owner_display'
>
export type InquiryPayload = Omit<
  InquiryRow,
  'id' | 'created_at' | 'updated_at' | 'tenant_display' | 'customer_display' | 'assignee_display'
>
export type QuotationPayload = Omit<
  QuotationRow,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'tenant_display'
  | 'customer_display'
  | 'inquiry_display'
  | 'owner_display'
>
export type VATRatePayload = Omit<VATRateRow, 'id' | 'created_at' | 'updated_at'>
export type ProductTranslationPayload = Omit<
  ProductTranslationRow,
  'id' | 'created_at' | 'updated_at' | 'product_display'
>
export type ProductCategoryTranslationPayload = Omit<
  ProductCategoryTranslationRow,
  'id' | 'created_at' | 'updated_at' | 'category_display'
>

export const tenantApi = createEntityApi<TenantRow, TenantPayload>('/api/v1/tenants/')
export const departmentApi = createEntityApi<DepartmentRow, DepartmentPayload>('/api/v1/departments/')
export const tenantMembershipApi = createEntityApi<TenantMembershipRow, TenantMembershipPayload>(
  '/api/v1/tenant-memberships/',
)
export const productApi = createEntityApi<ProductRow, ProductPayload>('/api/v1/admin-products/')
export const customerApi = createEntityApi<CustomerRow, CustomerPayload>('/api/v1/customers/')
export const inquiryApi = createEntityApi<InquiryRow, InquiryPayload>('/api/v1/inquiries/')
export const quotationApi = createEntityApi<QuotationRow, QuotationPayload>('/api/v1/quotations/')
export const vatRateApi = createEntityApi<VATRateRow, VATRatePayload>('/api/v1/vat-rates/')
export const consentLogApi = createEntityApi<ConsentLogRow, never>('/api/v1/consent-logs/')
export const productTranslationApi = createEntityApi<ProductTranslationRow, ProductTranslationPayload>(
  '/api/v1/admin-product-translations/',
)
export const productCategoryTranslationApi = createEntityApi<
  ProductCategoryTranslationRow,
  ProductCategoryTranslationPayload
>('/api/v1/admin-product-category-translations/')
