export interface UkrposhtaCity {
  ref: string
  name: string
  area?: string
  /** Display label, e.g. "м. Кропивницький, Кіровоградська обл." */
  present: string
}

export interface UkrposhtaBranch {
  ref: string
  number: string
  name: string
  shortAddress: string
  cityRef: string
  cityName: string
  /** 5-digit postal index of the post office. */
  postalIndex: string
}

export interface UkrposhtaCitySearchResponse {
  items: UkrposhtaCity[]
}

export interface UkrposhtaBranchSearchResponse {
  items: UkrposhtaBranch[]
}
