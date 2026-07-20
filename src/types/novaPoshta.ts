export interface NovaPoshtaCity {
  ref: string
  name: string
  area?: string
  /** Display label, e.g. "м. Кропивницький, Кіровоградська обл." */
  present: string
}

export interface NovaPoshtaWarehouse {
  ref: string
  number: string
  name: string
  shortAddress: string
  cityRef: string
  cityName: string
}

export interface NovaPoshtaCitySearchResponse {
  items: NovaPoshtaCity[]
}

export interface NovaPoshtaWarehouseSearchResponse {
  items: NovaPoshtaWarehouse[]
}
