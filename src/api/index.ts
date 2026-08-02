export { api, getAuthToken, setAuthToken, mediaUrl, API_URL, isMockMode } from './client'
export type { AuthResponse } from './AuthApi'
export type {
  AdminProductPayload,
  UploadedMedia,
  AdminUser,
  AdminOrder,
  AdminOrderCustomer,
  AdminOrderUpdatePayload,
} from './AdminApi'

import { isMockMode } from './client'
import { AuthApi as LiveAuthApi } from './AuthApi'
import { CatalogApi as LiveCatalogApi } from './CatalogApi'
import { CartApi as LiveCartApi } from './CartApi'
import { WishlistApi as LiveWishlistApi } from './WishlistApi'
import { AdminApi as LiveAdminApi } from './AdminApi'
import { OrdersApi as LiveOrdersApi } from './OrdersApi'
import { ReviewsApi as LiveReviewsApi } from './ReviewsApi'
import { MockAuthApi } from '@/mock/MockAuthApi'
import { MockCatalogApi } from '@/mock/MockCatalogApi'
import { MockCartApi } from '@/mock/MockCartApi'
import { MockWishlistApi } from '@/mock/MockWishlistApi'
import { MockAdminApi } from '@/mock/MockAdminApi'
import { MockOrdersApi } from '@/mock/MockOrdersApi'
import { MockReviewsApi } from '@/mock/MockReviewsApi'
import { NovaPoshtaApi } from './novaPoshtaClient'

export const AuthApi = isMockMode ? MockAuthApi : LiveAuthApi
export const CatalogApi = isMockMode ? MockCatalogApi : LiveCatalogApi
export const CartApi = isMockMode ? MockCartApi : LiveCartApi
export const WishlistApi = isMockMode ? MockWishlistApi : LiveWishlistApi
export const AdminApi = isMockMode ? MockAdminApi : LiveAdminApi
export const OrdersApi = isMockMode ? MockOrdersApi : LiveOrdersApi
export const ReviewsApi = isMockMode ? MockReviewsApi : LiveReviewsApi
export { NovaPoshtaApi }
