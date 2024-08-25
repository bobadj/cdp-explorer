import {Address, Bytes} from "web3";

export type CollateralType = {
  ilk: Bytes
  name: string
}

export type VatInfo = {
  Art: string
  dust: string
  line: string
  rate: string
  spot: string
}

export type IlkInfo = {
  name: string
  symbol: string
  class: number
  dec: number
  gem: Address
  pip: Address
  join: Address
  xlip: Address
}

export type SpotterInfo = {
  pip: Address
  mat: number|string
}

export type JugInfo = {
  duty: number|string
  rho: number|string
}

export type CDPBasicInfo = {
  id: number
  owner: Address|string,
  ilk: string
  collateral: string
  debt: string
  totalDebt: string
  collateralRatio?: string|number
  currency: string
  currencySymbol: string
}

export type CDPDetailedInfo = CDPBasicInfo & {
  ilkRation: string|number
  stabilityFee: string|number
}