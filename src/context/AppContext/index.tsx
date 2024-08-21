import {Context, createContext, JSX, PropsWithChildren, useEffect, useState} from "react";
import {Web3, Address} from "web3";
import IlkRegistryABI from '../../../abis/IlkRegistry.abi.json';
import DssCdpManagerABI from '../../../abis/DssCdpManager.abi.json';
import VaultInfoABI from '../../../abis/VaultInfo.abi.json';
import VatABI from '../../../abis/Vat.abi.json';
import {
  DSS_CDP_MANAGER_CONTRACT_ADDRESS, ETH_PRICE_IN_USD,
  ILK_REGISTRY_CONTRACT_ADDRESS, VAT_CONTRACT_ADDRESS,
  VAULT_INFO_CONTRACT_ADDRESS
} from "../../const";

interface AppContextValue {
  isLoading: boolean
  totalVaults: number
  collateralTypes: CollateralType[]
  toggleCollateralType: Function
  searchForCdps: Function
  vaults: CdpInfo[]
}

export type CdpInfo = {
  cdpId: number
  collateral: string
  debt: string
  totalDebt?: string|number
  collateralizationRatio?: string|number
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
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ availableCollateralTypes, setAvailableCollateralTypes ] = useState<CollateralType[]>([]);
  const [ activeCollateralTypes, setActiveCollateralTypes ] = useState<CollateralType[]>([]);
  const [ totalVaults, setTotalVaults ] = useState<number>(0);
  const [ vaults, setVaults ] = useState<CdpInfo[]>([]);
  
  const web3 = new Web3(Web3.givenProvider || `wss://mainnet.infura.io/ws/v3/${import.meta.env.VITE_INFURA_API_KEY}`);
  const IlkRegistryContract = new web3.eth.Contract(IlkRegistryABI, ILK_REGISTRY_CONTRACT_ADDRESS);
  const DssCdpManagerContract = new web3.eth.Contract(DssCdpManagerABI, DSS_CDP_MANAGER_CONTRACT_ADDRESS);
  const VaultInfoContract = new web3.eth.Contract(VaultInfoABI, VAULT_INFO_CONTRACT_ADDRESS);
  const VatContract = new web3.eth.Contract(VatABI, VAT_CONTRACT_ADDRESS);
  
  const SEARCH_SIZE = 20;
  
  useEffect(() => {
    fetchBasicInfos()
  }, []);
  
  const fetchBasicInfos = async () => {
    setVaults([]);
    setIsLoading(true);
    
    await fetchCollateralTypes();
    await fetchTotalVaults();
    
    setTimeout(() => {
      setIsLoading(false);
    }, 500)
  }
  
  const fetchCollateralTypes = async () => setAvailableCollateralTypes(
    (await IlkRegistryContract.methods.list().call() || [])
      .map( (ilk) => ({ ilk, name: web3.utils.hexToUtf8(ilk) }))
    );
  
  const fetchTotalVaults = async () => setTotalVaults(
    web3.utils.toNumber(await DssCdpManagerContract.methods.cdpi().call()) as number
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
  
  // "cache" ilkInfo, there is no need ( or there is? ) to fetch it already exist
  const getIlkInfo = async (ilk: string, useCachedValueIfExist: boolean = true): Promise<IlkInfo> => {
    let ilkInfo: IlkInfo|null = JSON.parse(localStorage.getItem(`${ilk}_info`));
    if (!ilkInfo || !useCachedValueIfExist) {
      const { Art, dust, line, rate, spot } = await VatContract.methods.ilks(ilk).call();
      ilkInfo = {
        Art: Art.toString(),
        dust: dust.toString(),
        line: line.toString(),
        rate: rate.toString(),
        spot: spot.toString()
      };
      localStorage.setItem(`${ilk}_info`, JSON.stringify(ilkInfo));
    }
    
    return ilkInfo
  }
  
  // keep CdpInfo "cached" too
  const getCdpInfoByCdpId = async (cdpId: number, useCachedValueIfExist: boolean = true): Promise<CdpInfo> => {
    let cdpInfo: CdpInfo|null = JSON.parse(localStorage.getItem(`${cdpId}_vault_info`));
    if (!cdpInfo || !useCachedValueIfExist) {
      const { collateral, debt, ilk, owner, urn, userAddr } = await VaultInfoContract.methods.getCdpInfo(cdpId).call();
      cdpInfo = {
        cdpId: cdpId,
        collateral: web3.utils.fromWei(collateral, 'ether'),
        debt: debt.toString(),
        ilk: web3.utils.toUtf8(ilk),
        owner: owner,
        urn: urn,
        userAddr: userAddr,
        totalDebt: 0
      };
      localStorage.setItem(`${cdpId}_vault_info`, JSON.stringify(cdpInfo));
    }
    
    return cdpInfo;
  }
  
  const calculateCdpTotalDebt = (cdp: CdpInfo, ilkInfo: IlkInfo): string => {
    const totalDebt = (BigInt(cdp.debt) * BigInt(ilkInfo.rate)) / BigInt(10 ** 27);

    return web3.utils.fromWei(totalDebt, 'ether');
  }
  
  const calculateCdpCollateralizationRatio = (cdp: CdpInfo): string => {
    const collateralValue = cdp.collateral * ETH_PRICE_IN_USD;
    
    const collateralizationRatio = collateralValue / cdp.totalDebt;
    if (isNaN(collateralizationRatio)) return '0';
    return (collateralizationRatio * 100).toFixed(2);
  }
  
  const searchForCdp = async (roughCdpId: number, size = SEARCH_SIZE) => {
    if (!roughCdpId) {
      setVaults([]);
      return;
    }
    // sort ids first, closest to a roughCdpId
    const vaultIds = [...Array(totalVaults).keys()]
      .sort((a, b) => Math.abs(a - roughCdpId) - Math.abs(b - roughCdpId))
    
    const vaults = [];
    // todo: em I sure about this? what if there is no CDPs near roughCdpId?
    for (let i = 0; i <= totalVaults; i++) {
      const cdpId = vaultIds[i];
      if (!cdpId) continue;
      // exit from loop once when target size is reached
      // if (vaults.length >= size) break;
      if (vaults.length >= 1 || !cdpId) break; // todo: remove this once when function is ready

      // @note: no BathRequest available :( https://github.com/web3/web3.js/issues/6224
      const ilk = await getIlkByCdpId(cdpId);
      const ilkInfo: IlkInfo = await getIlkInfo(ilk);

      if (activeCollateralTypes.length <= 0 || activeCollateralTypes.map( val => val.ilk ).indexOf(ilk) >= 0) {
        const cdpInfo: CdpInfo = await getCdpInfoByCdpId(cdpId);
        cdpInfo.totalDebt = calculateCdpTotalDebt(cdpInfo, ilkInfo);
        cdpInfo.collateralizationRatio = calculateCdpCollateralizationRatio(cdpInfo);
        
        vaults.push(cdpInfo);
      }
    }
    
    setVaults(vaults);
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
    vaults,
    isLoading,
    totalVaults,
    toggleCollateralType,
    collateralTypes: availableCollateralTypes,
    searchForCdps: searchForCdp
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}
