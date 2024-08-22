import {Context, createContext, JSX, PropsWithChildren, useEffect, useState} from "react";
import {Web3, Address, Bytes} from "web3";
import IlkRegistryABI from '../../../abis/IlkRegistry.abi.json';
import DssCdpManagerABI from '../../../abis/DssCdpManager.abi.json';
import VaultInfoABI from '../../../abis/VaultInfo.abi.json';
import VatABI from '../../../abis/Vat.abi.json';
import {
  RAY, RAD,
  DSS_CDP_MANAGER_CONTRACT_ADDRESS,
  ILK_REGISTRY_CONTRACT_ADDRESS, VAT_CONTRACT_ADDRESS,
  VAULT_INFO_CONTRACT_ADDRESS, PRICE_FEED
} from "../../const";
import {numberFormatter} from "../../utils";

interface AppContextValue {
  isLoading: boolean
  totalVaults: number
  collateralTypes: CollateralType[]
  searchForCdps: Function
  vaults: CdpInfo[]
  searchProgress: number|null
  totalDebt: number|BigInt
}

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

export type CdpInfo = {
  cdpId: number
  collateral: string
  debt: string
  totalDebt?: string|number
  collateralizationRatio?: string|number
  ilk: string
  owner: Address
  urn: Address
  userAddr: Address,
  ilkInfo?: IlkInfo
}

export const AppContext: Context<AppContextValue> = createContext({} as AppContextValue);

type AppProviderProps = PropsWithChildren & {}

export default function AppProvider({ children }: AppProviderProps): JSX.Element {
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ searchProgress, setSearchProgress ] = useState<number|null>(null);
  const [ totalDebt, setTotalDebt ] = useState<number|BigInt>(0);
  const [ availableCollateralTypes, setAvailableCollateralTypes ] = useState<CollateralType[]>([]);
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
    await calculateTotalDAIDebt();
    
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
  
  const calculateTotalDAIDebt = async () => {
    const debt = await VatContract.methods.debt().call();
    const vice = await VatContract.methods.vice().call();
    
    setTotalDebt(
      (BigInt(debt) - BigInt(vice)) / BigInt(RAD)
    );
  }
  
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
  
  // "cache" vatInfo, there is no need ( or there is? ) to fetch it already exist
  const getVatInfo = async (ilk: string, useCachedValueIfExist: boolean = true): Promise<VatInfo> => {
    let vatInfo: VatInfo|null = JSON.parse(localStorage.getItem(`${ilk}_vat_info`));
    if (!vatInfo || !useCachedValueIfExist) {
      const { Art, dust, line, rate, spot } = await VatContract.methods.ilks(ilk).call();
      vatInfo = {
        Art: Art.toString(),
        dust: dust.toString(),
        line: line.toString(),
        rate: rate.toString(),
        spot: spot.toString()
      };
      localStorage.setItem(`${ilk}_vat_info`, JSON.stringify(vatInfo));
    }
    
    return vatInfo
  }
  
  const getIlkInfo = async (ilk: string, useCachedValueIfExist: boolean = true): Promise<IlkInfo> => {
    let ilkInfo: IlkInfo|null = JSON.parse(localStorage.getItem(`${ilk}_info`));
    if (!ilkInfo || !useCachedValueIfExist) {
      const { name, symbol, dec, pip, join, xlip, gem, ...otherIlkInfo } = await IlkRegistryContract.methods.info(ilk).call();
      ilkInfo = {
        name,
        symbol,
        dec: +dec.toString(),
        class: +otherIlkInfo?.class.toString(),
        pip,
        join,
        xlip,
        gem
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
        userAddr: userAddr
      };
      localStorage.setItem(`${cdpId}_vault_info`, JSON.stringify(cdpInfo));
    }
    
    return cdpInfo;
  }
  
  const calculateCdpTotalDebt = (cdp: CdpInfo, vatInfo: VatInfo): string => {
    const totalDebt = (BigInt(cdp.debt) * BigInt(vatInfo.rate)) / BigInt(RAY);

    return web3.utils.fromWei(totalDebt, 'ether');
  }
  
  const calculateCdpCollateralizationRatio = (cdp: CdpInfo): string => {
    const collateralValue = cdp.collateral * (PRICE_FEED[cdp.ilkInfo?.symbol] || 0);
    
    const collateralizationRatio = collateralValue / cdp.totalDebt;
    if (isNaN(collateralizationRatio) || !isFinite(collateralizationRatio))
      return '0';
    
    return (collateralizationRatio * 100).toFixed(2);
  }
  
  const searchForCdp = async (roughCdpId: number, collateralTypes: CollateralType[] = [], size = SEARCH_SIZE) => {
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
      if (vaults.length >= size) break;
      setSearchProgress((100 * (vaults.length || 1)) / size)
      // if (vaults.length >= 1 || !cdpId) break; // todo: remove this once when function is ready

      try {
        // @note: no BathRequest available :( https://github.com/web3/web3.js/issues/6224
        const ilk = await getIlkByCdpId(cdpId);
        
        if (collateralTypes.length <= 0 || collateralTypes.map( val => val.ilk ).indexOf(ilk) >= 0) {
          const vatInfo: VatInfo = await getVatInfo(ilk);
          const ilkInfo: IlkInfo = await getIlkInfo(ilk);
          
          const cdpInfo: CdpInfo = await getCdpInfoByCdpId(cdpId);
          cdpInfo.ilkInfo = ilkInfo;
          cdpInfo.totalDebt = calculateCdpTotalDebt(cdpInfo, vatInfo);
          cdpInfo.collateralizationRatio = calculateCdpCollateralizationRatio(cdpInfo);
          
          vaults.push(cdpInfo);
        }
      } catch (e) {
        console.error(e);
        
        setSearchProgress((100 * (vaults.length || 1) + 1) / size)
      }
    }
    
    setVaults(vaults);
    setSearchProgress(null);
  }
  
  const contextValue: AppContextValue = {
    vaults,
    isLoading,
    totalVaults,
    searchProgress,
    totalDebt,
    collateralTypes: availableCollateralTypes,
    searchForCdps: searchForCdp
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}
