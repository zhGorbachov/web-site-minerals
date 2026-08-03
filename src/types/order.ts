export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'assembling'
  | 'ready'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'unpaid' | 'awaiting_payment' | 'paid' | 'failed'

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  productImage: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  userId: string | null
  status: OrderStatus
  paymentStatus?: PaymentStatus
  totalPrice: number
  paymentMethod: string
  deliveryMethod: string
  /** Full name of the bank-transfer payer (as on the card statement). */
  payerFullName?: string | null
  liqpayOrderId?: string | null
  items: OrderItem[]
  createdAt: string
}

export type OrderPaymentCheckout = {
  data: string
  signature: string
  checkoutUrl: string
}

export type CreateOrderResult = Order & {
  payment?: OrderPaymentCheckout
}

export type OrderPaymentStatus = {
  id: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  totalPrice: number
}
