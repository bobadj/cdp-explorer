import type {CDPBasicInfo, CollateralType} from "../utils/types.tsx";
import type {Address, Web3} from "web3";

export interface AppContextValue {
  isLoading: boolean
  totalVaults: number
  collateralTypes: CollateralType[]
  searchForCdps: Function
  vaults: CDPBasicInfo[]
  searchProgress: number|null
  totalDebt: number|BigInt
  fetchCdpDetailedInfoById: Function
}

export interface Web3WalletContextValue {
  web3: Web3,
  chainId: string|null
  latestBlock: string|null
  accounts: Address[]
  connectWallet: Function
  signMessage: Function
  isConnected: boolean
}