import { isAxiosError } from 'axios'
import type { TranslationKey } from '@/i18n/useTranslation'

export type AdminTab = 'orders' | 'products' | 'create' | 'subcategories' | 'users'

export const ADMIN_TABS: AdminTab[] = [
  'orders',
  'products',
  'create',
  'subcategories',
  'users',
]

export const ADMIN_TAB_LABELS: Record<AdminTab, TranslationKey> = {
  orders: 'admin.tabOrders',
  products: 'admin.tabProducts',
  create: 'admin.tabAddProduct',
  subcategories: 'admin.tabSubcategories',
  users: 'admin.tabUsers',
}

export function isAdminTab(value: string | null): value is AdminTab {
  return (
    value === 'orders' ||
    value === 'products' ||
    value === 'create' ||
    value === 'subcategories' ||
    value === 'users'
  )
}

export function adminTabPath(tab: AdminTab) {
  return tab === 'orders' ? '/admin' : `/admin?tab=${tab}`
}

export function mapAdminError(error: unknown): TranslationKey {
  if (isAxiosError(error)) {
    const code = error.response?.data?.error
    if (code === 'slug_taken') return 'admin.errorSlugTaken'
    if (code === 'sku_taken') return 'admin.errorSkuTaken'
    if (code === 'product_in_orders') return 'admin.errorInOrders'
    if (code === 'subcategory_has_products') return 'admin.errorSubHasProducts'
    if (error.response?.status === 403) return 'admin.forbidden'
  }
  return 'admin.errorGeneric'
}
