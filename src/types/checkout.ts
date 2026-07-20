export type DeliveryMethod = 'nova_poshta' | 'courier'

export type PaymentMethod = 'pickup' | 'google_pay' | 'apple_pay'

export interface CheckoutContact {
  firstName: string
  lastName: string
  phone: string
  email: string
}

export interface CheckoutLocation {
  deliveryMethod: DeliveryMethod
  city: string
  /** Nova Poshta settlement / city Ref (for warehouse lookup). */
  cityRef?: string
  branch: string
  /** Nova Poshta warehouse Ref. */
  warehouseRef?: string
  address: string
}

export interface CheckoutPayment {
  paymentMethod: PaymentMethod | null
  comment: string
}

export interface SavedCheckoutProfile {
  contact: CheckoutContact
  location: CheckoutLocation
}
