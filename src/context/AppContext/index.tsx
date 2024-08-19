import {Context, createContext, JSX, PropsWithChildren, useEffect, useState} from "react";
import {Web3, Address} from "web3";
import IlkRegistryABI from '../../../abis/IlkRegistry.abi.json';
import DssCdpManagerABI from '../../../abis/DssCdpManager.abi.json';
import VaultInfoABI from '../../../abis/VaultInfo.abi.json';
import VatABI from '../../../abis/Vat.abi.json';
import {
  DSS_CDP_MANAGER_CONTRACT_ADDRESS,
  ILK_REGISTRY_CONTRACT_ADDRESS, VAT_CONTRACT_ADDRESS,
  VAULT_INFO_CONTRACT_ADDRESS
} from "../../const";

interface AppContextValue {
  totalVaults: number
  collateralTypes: CollateralType[]
  toggleCollateralType: Function
}

export type VaultInfo = {
  cdpId: number
  collateral: string
  debt: string
  ilk: string
  owner: Address
  urn: Address
  userAddr: Address
}

export type CollateralType = {
  ilk: string
  name: string
}

export type IlkInfo = {
  Art: string
  dust: string
  line: string
  rate: string
  spot: string
}

export const AppContext: Context<AppContextValue> = createContext({} as AppContextValue);

type AppProviderProps = PropsWithChildren & {}

export default function AppProvider({ children }: AppProviderProps): JSX.Element {
  const [ availableCollateralTypes, setAvailableCollateralTypes ] = useState<CollateralType[]>([]);
  const [ activeCollateralTypes, setActiveCollateralTypes ] = useState<CollateralType[]>([]);
  const [ totalVaults, setTotalVaults ] = useState<number>(0);
  
  const web3 = new Web3(Web3.givenProvider || `wss://mainnet.infura.io/ws/v3/${import.meta.env.VITE_INFURA_API_KEY}`);
  const IlkRegistryContract = new web3.eth.Contract(IlkRegistryABI, ILK_REGISTRY_CONTRACT_ADDRESS);
  const DssCdpManagerContract = new web3.eth.Contract(DssCdpManagerABI, DSS_CDP_MANAGER_CONTRACT_ADDRESS);
  const VaultInfoContract = new web3.eth.Contract(VaultInfoABI, VAULT_INFO_CONTRACT_ADDRESS);
  const VatContract = new web3.eth.Contract(VatABI, VAT_CONTRACT_ADDRESS);
  
  const SEARCH_SIZE = 20;
  
  useEffect(() => {
    fetchCollateralTypes()
    fetchTotalVaults()
  }, []);
  
  const fetchCollateralTypes = async () => setAvailableCollateralTypes(
    (await IlkRegistryContract.methods.list().call() || [])
      .map( (ilk) => ({ ilk, name: web3.utils.hexToUtf8(ilk) }))
    );
  
  const fetchTotalVaults = async () => setTotalVaults(
    await DssCdpManagerContract.methods.cdpi().call() as number
  );
  
  // "cache" cdpId => ilk map, to avoid unnecessary calls
  const getIlkByCdpId = async (cdpId: number, useCachedValueIfExist: boolean = true): Promise<string> => {
    const cachedIlksMap: object = JSON.parse(localStorage.getItem('ilks_map')) || {};
    let ilk = cachedIlksMap[cdpId];
    if (!ilk || !useCachedValueIfExist) {
      ilk = await DssCdpManagerContract.methods.ilks(cdpId).call();
      localStorage.setItem('ilks_map', JSON.stringify({...cachedIlksMap, [cdpId]: ilk}));
    }
    
    return ilk;
  }
  
  // "cache" ilkInfo, there is no need ( or there is? ) to fetch it if already exist
  const getIlkInfo = async (ilk: string, useCachedValueIfExist: boolean = true): Promise<IlkInfo> => {
    let ilkInfo: IlkInfo|null = JSON.parse(localStorage.getItem(`${ilk}_info`));
    if (!ilkInfo || !useCachedValueIfExist) {
      const { Art, dust, line, rate, spot } = await VatContract.methods.ilks(ilk).call();
      ilkInfo = {
        Art: web3.utils.fromWei(Art, 'ether'),
        dust: web3.utils.fromWei(dust, 'ether'),
        line: web3.utils.fromWei(line, 'ether'),
        rate: web3.utils.fromWei(rate, 'ether'),
        spot: web3.utils.fromWei(spot, 'ether')
      };
      localStorage.setItem(`${ilk}_info`, JSON.stringify(ilkInfo));
    }
    
    return ilkInfo
  }
  
  // keep vaultInfo "cached" too
  const getCdpInfoByCdpId = async (cdpId: number, useCachedValueIfExist: boolean = true): Promise<VaultInfo> => {
    let vaultInfo: VaultInfo|null = JSON.parse(localStorage.getItem(`${cdpId}_vault_info`));
    if (!vaultInfo || !useCachedValueIfExist) {
      const { collateral, debt, ilk, owner, urn, userAddr } = await VaultInfoContract.methods.getCdpInfo(cdpId).call();
      vaultInfo = {
        cdpId: cdpId,
        collateral: web3.utils.fromWei(collateral, 'ether'),
        debt: web3.utils.fromWei(debt, 'ether'),
        ilk: web3.utils.toUtf8(ilk),
        owner: owner,
        urn: urn,
        userAddr: userAddr
      };
      localStorage.setItem(`${cdpId}_vault_info`, JSON.stringify(vaultInfo));
    }
    
    return vaultInfo;
  }
  
  const searchForCdp = async (roughCdpId: number, size = SEARCH_SIZE) => {
    // sort ids first, closest to a roughCdpId
    const vaultIds = [...Array(totalVaults).keys()]
      .sort((a, b) => Math.abs(a - roughCdpId) - Math.abs(b - roughCdpId))
    
    const vaults = [];
    // todo: em I sure about this? what if there is no CDPs near roughCdpId?
    for (let i = 0; i <= totalVaults; i++) {
      // exit from loop once when target size is reached
      // if (vaults.length >= size) break;
      if (vaults.length >= 1) break; // todo: remove this once when function is ready
      const cdpId = vaultIds[i];
      
      // @note: no BathRequest available :( https://github.com/web3/web3.js/issues/6224
      const cachedIlksMap: object = JSON.parse(localStorage.getItem('ilks_map')) || {};
      const ilk = await getIlkByCdpId(cachedIlksMap[cdpId]);
      const ilkInfo: IlkInfo = await getIlkInfo(ilk);
      
      if (activeCollateralTypes.length <= 0 || activeCollateralTypes.map( val => val.ilk ).indexOf(ilk) >= 0) {
        const vaultInfo: VaultInfo = await getCdpInfoByCdpId(cdpId);
        
        vaults.push(vaultInfo);
      }
    }
  }
  
  const toggleCollateralType = (type: CollateralType) => {
    const ind = activeCollateralTypes.indexOf(type)
    if (ind >= 0) {
      setActiveCollateralTypes(activeCollateralTypes.filter((_, i) => i !== ind));
    } else  {
      setActiveCollateralTypes([...activeCollateralTypes, type]);
    }
  }
  
  const contextValue: AppContextValue = {
    totalVaults,
    toggleCollateralType,
    collateralTypes: availableCollateralTypes
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}
