export type DeliveryMethod = 'nova_poshta' | 'ukrposhta' | 'self_pickup'

export type NovaPoshtaType = 'warehouse' | 'parcel_locker' | 'courier'

export type UkrposhtaType = 'basic' | 'priority'

export type PaymentMethod = 'bank_transfer' | 'pickup' | 'liqpay'

export interface CheckoutContact {
  firstName: string
  lastName: string
  phone: string
  email: string
}

export interface CheckoutLocation {
  deliveryMethod: DeliveryMethod
  /** Nova Poshta subtype: branch / locker / courier. */
  novaPoshtaType: NovaPoshtaType
  /** Ukrposhta tariff: basic or priority. */
  ukrposhtaType: UkrposhtaType
  city: string
  /** Settlement / city Ref for Nova Poshta or Ukrposhta branch lookup. */
  cityRef?: string
  branch: string
  /** Branch / warehouse Ref (Nova Poshta warehouse or Ukrposhta post office). */
  warehouseRef?: string
  address: string
  /** Ukrposhta postal index (auto-filled from selected branch). */
  postalIndex: string
}

export interface CheckoutPayment {
  paymentMethod: PaymentMethod | null
  comment: string
}

export interface SavedCheckoutProfile {
  contact: CheckoutContact
  location: CheckoutLocation
}
