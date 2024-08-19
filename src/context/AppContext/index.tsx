import {Context, createContext, JSX, PropsWithChildren, useEffect, useState} from "react";
import {Web3} from "web3";
import IlkRegistryABI from '../../../abis/IlkRegistry.abi.json';
import DssCdpManagerABI from '../../../abis/DssCdpManager.abi.json';
import {DSS_CDP_MANAGER_CONTRACT_ADDRESS, ILK_REGISTRY_CONTRACT_ADDRESS} from "../../const";

interface AppContextValue {
  totalVaults: number
  collateralTypes: CollateralType[]
}

export interface CollateralType {
  ilk: string
  name: string
}

export const AppContext: Context<AppContextValue> = createContext({} as AppContextValue);

type AppProviderProps = PropsWithChildren & {}

export default function AppProvider({ children }: AppProviderProps): JSX.Element {
  const [ availableCollateralTypes, setAvailableCollateralTypes ] = useState<CollateralType[]>([]);
  const [ totalVaults, setTotalVaults ] = useState<number>(0);
  
  const web3 = new Web3(Web3.givenProvider || `wss://mainnet.infura.io/ws/v3/${import.meta.env.VITE_INFURA_API_KEY}`);
  const IlkRegistryContract = new web3.eth.Contract(IlkRegistryABI, ILK_REGISTRY_CONTRACT_ADDRESS);
  const DssCdpManagerContract = new web3.eth.Contract(DssCdpManagerABI, DSS_CDP_MANAGER_CONTRACT_ADDRESS);
  
  useEffect(() => {
    fetchCollateralTypes()
    fetchTotalVaults()
  }, []);
  
  const fetchCollateralTypes = async () => {
    const collateralTypes = await IlkRegistryContract.methods.list().call();
    setAvailableCollateralTypes(
      (collateralTypes || [])
        .map( (ilk) => ({ ilk, name: web3.utils.hexToUtf8(ilk).trim() }))
    );
  }
  
  const fetchTotalVaults = async () => {
    const cdpi = await DssCdpManagerContract.methods.cdpi().call();
    
    setTotalVaults(web3.utils.toNumber(cdpi) as number);
  }
  
  const contextValue: AppContextValue = {
    totalVaults,
    collateralTypes: availableCollateralTypes
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}
