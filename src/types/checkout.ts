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
  /** Settlement Ref for Nova Poshta warehouse lookup. Optional for Ukrposhta free-text city. */
  cityRef?: string
  /** Nova Poshta warehouse label, or optional Ukrposhta branch description. */
  branch: string
  /** Nova Poshta warehouse Ref. Unused for Ukrposhta (manual / by index). */
  warehouseRef?: string
  address: string
  /** Ukrposhta postal index (required for Ukrposhta delivery). */
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
