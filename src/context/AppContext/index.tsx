import {Context, createContext, JSX, PropsWithChildren, useEffect, useState} from "react";
import {Address, HexString} from "web3";
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
  JUG_CONTRACT_ADDRESS, SECONDS_IN_YEAR,
  CAT_CONTRACT_ADDRESS, ZERO_ADDRESS
} from "../../const";
import {useWeb3Wallet} from "../../hooks";
import {AppContextValue} from "../../types/interfaces";
import {
  CatInfo,
  CDPBasicInfo,
  CDPDetailedInfo,
  CollateralType,
  IlkInfo,
  JugInfo,
  SpotterInfo,
  VatInfo
} from "../../types";

export const AppContext: Context<AppContextValue> = createContext({} as AppContextValue);

type AppProviderProps = PropsWithChildren & {}

export default function AppProvider({ children }: AppProviderProps): JSX.Element {
  const { web3 } = useWeb3Wallet();
  
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ searchProgress, setSearchProgress ] = useState<number|null>(null);
  const [ totalDebt, setTotalDebt ] = useState<number|BigInt>(0);
  const [ availableCollateralTypes, setAvailableCollateralTypes ] = useState<CollateralType[]>([]);
  const [ totalVaults, setTotalVaults ] = useState<number>(0);
  const [ vaults, setVaults ] = useState<CDPBasicInfo[]>([]);
  
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
    
    // delay loader a bit, just for smoother experience
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
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
    let vatInfo: VatInfo|null = JSON.parse(localStorage.getItem(`${ilk}_vat_info`) as string);
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
  
  const getCatInfoByIlk = async (ilk: string|HexString, useCachedValueIfExist: boolean = true): Promise<CatInfo> => {
    let catInfo: CatInfo|null = JSON.parse(localStorage.getItem(`${ilk}_cat_info`));
    if (!catInfo || !useCachedValueIfExist) {
      const { flip, chop, lump } = await CatContract.methods.ilks(ilk).call();
      catInfo = {
        flip,
        chop: chop.toString(),
        lump: lump.toString()
      };
      localStorage.setItem(`${ilk}_cat_info`, JSON.stringify(catInfo));
    }
    
    return catInfo
  }
  
  const getCdpBasicInfoById = async (cdpId: number): Promise<CDPBasicInfo> => {
    const { collateral, debt, ilk, owner } = await VaultInfoContract.methods.getCdpInfo(cdpId).call();
    const { rate, line, dust }: VatInfo = await getVatInfo(ilk);
    const { symbol, name }: IlkInfo = await getIlkInfo(ilk);
    
    const totalDebt = calculateCdpTotalDebt(debt, rate);
    const debtCelling = calculateDebtCelling(line);
    const minDebt = calculateMinDebt(dust);
    
    return {
      id: cdpId,
      owner,
      ilk: web3.utils.toUtf8(ilk),
      collateral: web3.utils.fromWei(collateral, 'ether'),
      debt,
      totalDebt: totalDebt,
      collateralRatio: calculateCollateralRatio(collateral, totalDebt, symbol),
      currency: name,
      currencySymbol: symbol,
      debtCelling: debtCelling,
      minDebt
    };
  }
  
  const calculateCdpTotalDebt = (debt: number|string|BigInt, rate: string|number|BigInt): string => {
    const totalDebt = (BigInt(debt) * BigInt(rate)) / BigInt(RAY);
    
    return web3.utils.fromWei(
      totalDebt,
      'ether'
    );
  }
  
  const calculateDebtCelling = (line: number|string|BigInt): number => line / RAD;
  
  const calculateMinDebt = (dust: number|string|BigInt): number => dust / RAD;
  
  const calculateIlkRatio = (mat: string|number): number => (mat / RAY) * 100;
  
  const calculateStabilityFee = (duty: string|number) => (Math.pow(duty / RAY, SECONDS_IN_YEAR) - 1) * 100;
  
  const calculateLiquidationFee = (chop: string|number, flip: string|Address) => {
    let liquidationFee = ((chop / RAY) - 1) * 100;
    if (flip === ZERO_ADDRESS)
      liquidationFee = 0;
    
    return liquidationFee;
  }
  
  const calculateMaxWithdrawal = (cdp: CDPBasicInfo, mat: BigInt): number => {
    const liquidationRatio = parseFloat(mat.toString()) / RAY;
    const requiredCollateral = (cdp.totalDebt * liquidationRatio) / PRICE_FEED[cdp.currencySymbol];

    return cdp.collateral - requiredCollateral;
  }
  
  const calculateMaxDebt = (cdp: CDPBasicInfo, mat: BigInt): number => {
    const liquidationRatio = parseFloat(mat.toString()) / RAY;

    return (cdp.collateral * PRICE_FEED[cdp.currencySymbol]) / liquidationRatio;
  }
  
  const calculateCollateralRatio = (collateral: string|number|BigInt, debt: string|number|BigInt, currency: string): string => {
    const collateralValue = web3.utils.fromWei(collateral, 'ether') * (PRICE_FEED[currency] || 0);
    
    const collateralRatio = collateralValue / debt;
    if (isNaN(collateralRatio) || !isFinite(collateralRatio))
      return '0';
    
    return (collateralRatio * 100).toFixed(2);
  }
  
  const searchForCdp = async (roughCdpId: number, collateralTypes: CollateralType[] = [], size = SEARCH_SIZE) => {
    setVaults([]);
    if (!roughCdpId) return;
    
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
        await new Promise(_ => setTimeout(_, 100));
      } catch (e) {
        console.error(e);

        setSearchProgress((100 * (progress + 1)) / size)
      }
    }
    
    setVaults(vaults);
    setSearchProgress(null);
  }
  
  const fetchCdpDetailedInfoById = async (cdpId: number): Promise<CDPDetailedInfo> => {
    setIsLoading(true);
    
    const cdpBasicInfo: CDPBasicInfo = await getCdpBasicInfoById(cdpId);
    const ilk = web3.utils.asciiToHex(cdpBasicInfo.ilk);
    const { mat } = await getSpotterInfoByIlk(ilk);
    const { duty } = await getJugInfoByIlk(ilk);
    const { chop, flip } = await getCatInfoByIlk(ilk);
    
    const ilkRatio = calculateIlkRatio(mat);
    const stabilityFee = calculateStabilityFee(duty);
    const maxWithdrawal = calculateMaxWithdrawal(cdpBasicInfo, BigInt(mat));
    const maxDebt = calculateMaxDebt(cdpBasicInfo, BigInt(mat));
    const liquidationFee = calculateLiquidationFee(chop, flip);
    
    // delay loader a bit, just for smoother experience
    setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return {
      ...cdpBasicInfo,
      ilkRation: ilkRatio.toFixed(2),
      liquidationFee: liquidationFee.toFixed(2),
      stabilityFee: stabilityFee.toFixed(2),
      maxWithdrawal: maxWithdrawal.toFixed(2),
      maxDebt: maxDebt.toFixed(2),
    };
  }
  
  const contextValue: AppContextValue = {
    vaults,
    isLoading,
    totalVaults,
    searchProgress,
    totalDebt,
    collateralTypes: availableCollateralTypes,
    searchForCdps: searchForCdp,
    fetchCdpDetailedInfoById
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}
