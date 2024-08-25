import {Context, createContext, JSX, PropsWithChildren, useEffect, useState} from "react";
import {Address, Bytes, HexString, Web3} from "web3";
import IlkRegistryABI from '../../../abis/IlkRegistry.abi.json';
import DssCdpManagerABI from '../../../abis/DssCdpManager.abi.json';
import VaultInfoABI from '../../../abis/VaultInfo.abi.json';
import VatABI from '../../../abis/Vat.abi.json';
import SpotterABI from '../../../abis/Spotter.abi.json';
import JugABI from '../../../abis/Jug.abi.json';
import CatABI from '../../../abis/Cat.abi.json';
import {
  DSS_CDP_MANAGER_CONTRACT_ADDRESS,
  ILK_REGISTRY_CONTRACT_ADDRESS,
  PRICE_FEED,
  RAD,
  RAY,
  VAT_CONTRACT_ADDRESS,
  VAULT_INFO_CONTRACT_ADDRESS,
  SPOTTER_CONTRACT_ADDRESS,
  CAT_CONTRACT_ADDRESS,
  JUG_CONTRACT_ADDRESS, SECONDS_IN_YEAR,
} from "../../const";

interface AppContextValue {
  isLoading: boolean
  totalVaults: number
  collateralTypes: CollateralType[]
  searchForCdps: Function
  fetchCdpById: Function
  vaults: CDPBasicInfo[]
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

export const AppContext: Context<AppContextValue> = createContext({} as AppContextValue);

type AppProviderProps = PropsWithChildren & {}

export default function AppProvider({ children }: AppProviderProps): JSX.Element {
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ searchProgress, setSearchProgress ] = useState<number|null>(null);
  const [ totalDebt, setTotalDebt ] = useState<number|BigInt>(0);
  const [ availableCollateralTypes, setAvailableCollateralTypes ] = useState<CollateralType[]>([]);
  const [ totalVaults, setTotalVaults ] = useState<number>(0);
  const [ vaults, setVaults ] = useState<CDPBasicInfo[]>([]);
  
  const web3 = new Web3(Web3.givenProvider || `https://eth-mainnet.g.alchemy.com/v2/tXDmSv5BEVKZ6Xj5uzpdWE3wMdX3DhtU`);
  const IlkRegistryContract = new web3.eth.Contract(IlkRegistryABI, ILK_REGISTRY_CONTRACT_ADDRESS);
  const DssCdpManagerContract = new web3.eth.Contract(DssCdpManagerABI, DSS_CDP_MANAGER_CONTRACT_ADDRESS);
  const VaultInfoContract = new web3.eth.Contract(VaultInfoABI, VAULT_INFO_CONTRACT_ADDRESS);
  const VatContract = new web3.eth.Contract(VatABI, VAT_CONTRACT_ADDRESS);
  const SpotterContract = new web3.eth.Contract(SpotterABI, SPOTTER_CONTRACT_ADDRESS);
  const JugContract = new web3.eth.Contract(JugABI, JUG_CONTRACT_ADDRESS);
  const CatContract = new web3.eth.Contract(CatABI, CAT_CONTRACT_ADDRESS);
  
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
  const getIlkByCdpId = async (cdpId: number): Promise<string> => {
    const cachedIlksMap: object = JSON.parse(localStorage.getItem('ilks_map')) || {};
    let ilk = cachedIlksMap[cdpId];
    if (!ilk) {
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
  
  const getSpotterInfoByIlk = async (ilk: string|HexString, useCachedValueIfExist: boolean = true): Promise<SpotterInfo> => {
    let spotterInfo: SpotterInfo|null = JSON.parse(localStorage.getItem(`${ilk}_spotter_info`));
    if (!spotterInfo || !useCachedValueIfExist) {
      const { pip, mat } = await SpotterContract.methods.ilks(ilk).call();
      spotterInfo = {
        pip,
        mat: mat.toString()
      };
      localStorage.setItem(`${ilk}_spotter_info`, JSON.stringify(spotterInfo));
    }
    
    return spotterInfo
  }
  
  const getJugInfoByIlk = async (ilk: string|HexString, useCachedValueIfExist: boolean = true): Promise<JugInfo> => {
    let jugInfo: JugInfo|null = JSON.parse(localStorage.getItem(`${ilk}_jug_info`));
    if (!jugInfo || !useCachedValueIfExist) {
      const { duty, rho } = await JugContract.methods.ilks(ilk).call();
      jugInfo = {
        rho: rho.toString(),
        duty: duty.toString()
      };
      localStorage.setItem(`${ilk}_jug_info`, JSON.stringify(jugInfo));
    }
    
    return jugInfo
  }
  
  const getCdpBasicInfoById = async (cdpId: number): Promise<CDPBasicInfo> => {
    const { collateral, debt, ilk, owner } = await VaultInfoContract.methods.getCdpInfo(cdpId).call();
    const { rate }: VatInfo = await getVatInfo(ilk);
    const { symbol, name }: IlkInfo = await getIlkInfo(ilk);
    
    const totalDebt = calculateCdpTotalDebt(debt, rate);
    
    return {
      id: cdpId,
      owner,
      ilk: web3.utils.toUtf8(ilk),
      collateral: web3.utils.fromWei(collateral, 'ether'),
      debt,
      totalDebt: totalDebt,
      collateralRatio: calculateCollateralRatio(collateral, totalDebt, symbol),
      currency: name,
      currencySymbol: symbol
    };
  }
  
  const calculateCdpTotalDebt = (debt: number|string|BigInt, rate: string|number|BigInt): string => {
    const totalDebt = (BigInt(debt) * BigInt(rate)) / BigInt(RAY);
    
    return web3.utils.fromWei(
      totalDebt,
      'ether'
    );
  }
  
  const calculateCollateralRatio = (collateral: string|number|BigInt, debt: string|number|BigInt, currency: string): string => {
    const collateralValue = web3.utils.fromWei(collateral, 'ether') * (PRICE_FEED[currency] || 0);
    
    const collateralRatio = collateralValue / debt;
    if (isNaN(collateralRatio) || !isFinite(collateralRatio))
      return '0';
    
    return (collateralRatio * 100).toFixed(2);
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
      const progress = vaults.length || 1;
      setSearchProgress((100 * progress) / size)

      try {
        // @note: no BathRequest available :( https://github.com/web3/web3.js/issues/6224
        const ilk = await getIlkByCdpId(cdpId);

        if (collateralTypes.length <= 0 || collateralTypes.map( val => val.ilk ).indexOf(ilk) >= 0) {
          const cdpBasicInfo = await getCdpBasicInfoById(cdpId);

          vaults.push(cdpBasicInfo);
        }

        // @note: there was issue with "too many requests per second", therefore delay is introduced
        await new Promise(_ => setTimeout(_, 300));
      } catch (e) {
        console.error(e);

        setSearchProgress((100 * (progress + 1)) / size)
      }
    }
    
    setVaults(vaults);
    setSearchProgress(null);
  }
  
  const fetchCdpById = async (cdpId: number): Promise<CDPDetailedInfo> => {
    setIsLoading(true);
    
    const cdpBasicInfo: CDPBasicInfo = await getCdpBasicInfoById(cdpId);
    const { mat } = await getSpotterInfoByIlk(web3.utils.asciiToHex(cdpBasicInfo.ilk));
    const { duty } = await getJugInfoByIlk(web3.utils.asciiToHex(cdpBasicInfo.ilk));
    
    const ilkRatio = ((mat / RAY) * 100).toFixed(2);
    const stabilityFeePercentage = (Math.pow(duty / RAY, SECONDS_IN_YEAR) - 1) * 100;
    

    setIsLoading(false)
    
    return {
      ...cdpBasicInfo,
      ilkRation: ilkRatio,
      stabilityFee: stabilityFeePercentage.toFixed(2)
    }
  }
  
  const contextValue: AppContextValue = {
    vaults,
    isLoading,
    totalVaults,
    searchProgress,
    totalDebt,
    collateralTypes: availableCollateralTypes,
    searchForCdps: searchForCdp,
    fetchCdpById
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}
