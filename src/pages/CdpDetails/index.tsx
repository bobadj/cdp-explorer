import {FC, JSX, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Button, Loader} from "../../components";
import {formatAddress, currencyFormatter, numberFormatter} from "../../utils";
import {useAppContext, useWeb3Wallet} from "../../hooks";
import {PRICE_FEED} from "../../const";
import {ButtonClassTypes} from "../../types/enum";
import {CDPDetailedInfo} from "../../types";

const CdpDetails: FC = (): JSX.Element => {
  const { cdpId } = useParams();
  const { isConnected, signMessage } = useWeb3Wallet();
  const { isLoading, fetchCdpById } = useAppContext();
  
  const [ signedMessage, setSignedMessage ] = useState<string>();
  const [ cdp, setCdp ] = useState<CDPDetailedInfo>()
  
  useEffect(() => {
    if (cdpId) getCdpById(cdpId);
  }, [cdpId]);
  
  const getCdpById = async (cdpId) => setCdp(
    await fetchCdpById(cdpId)
  );
  
  const handleMessageSign = async () => setSignedMessage(
    await signMessage('Ovo je moj CDP')
  );
  
  return (
    <Loader isLoading={isLoading}>
      <div className="bg-surface container pt-12 mx-auto">
        <div className="w-full flex flex-col md:flex-row justify-between items-center bg-white rounded-md shadow-md p-8">
          <div className="text-center md:text-start">
            <h2 className="font-bold text-2xl mb">Position owner: {formatAddress(cdp?.owner)}</h2>
            { !isConnected && <p className="text-sm">Please connect your wallet in order to sing.</p>}
          </div>
          {
            !signedMessage
            &&
              <Button className="px-14 py-3 mt-5 md:mt-0"
                      onClick={handleMessageSign}
                      disabled={!isConnected}
                      classType={ButtonClassTypes.decorative}>
                  Ovo je moj CDP
              </Button>
          }
        </div>
        <div className="flex flex-col gap-5 w-full mt-5 bg-white rounded-md shadow-md px-8 py-5">
          <div className="flex flex-col lg:flex-row">
            <div className="basis-1/2">
              <h2 className="font-semibold text-4xl w-full mb-4">{cdp?.ilk} CDP #{cdpId}</h2>
              <div className="flex flex-col gap-5 justify-between pe-0 lg:pe-[120px]">
                <div className="flex flex-col">
                  <span className="text-md font-light">Ratio:</span>
                  <span className="text-5xl">{cdp?.collateralRatio}%</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex flex-col">
                    <span className="text-md font-light">Collateral:</span>
                    <span className="text-4xl">
                      {numberFormatter(cdp?.collateral.toString())} <span className="text-lg">{cdp?.currencySymbol}</span>
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-md font-light">Debt:</span>
                    <span className="text-4xl">
                      {numberFormatter(+cdp?.totalDebt.toString())} <span className="text-lg">DAI</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-2 mt-12 text-sm">
                <span>
                  Current Price: {currencyFormatter(PRICE_FEED[cdp?.currencySymbol] || 0)}
                </span>
                <span>
                  Next ETH Price: {currencyFormatter(PRICE_FEED[cdp?.currencySymbol] || 0)}
                </span>
              </div>
            </div>
            <div className="basis-1/2 ps-0 md:ps-[50px]">
              <h4 className="text-2xl font-semibold mb-4">CDP Information</h4>
              <div className="flex flex-col">
                <div className="flex flex-row justify-between border-b border-slate-400 py-2">
                  <span className="text-xs font-bold text-slate-600 items-center">Stability Fee</span>
                  <span className="text-xs font-bold text-slate-600 items-center">{cdp?.stabilityFee}%</span>
                </div>
                <div className="flex flex-row justify-between border-b border-slate-400 py-2">
                  <span className="text-xs font-bold text-slate-600 items-center">Liquidation Fee</span>
                  <span className="text-xs font-bold text-slate-600 items-center">{cdp?.liquidationFee}%</span>
                </div>
                <div className="flex flex-row justify-between border-b border-slate-400 py-2">
                  <span className="text-xs font-bold text-slate-600 items-center">Collateral ratio</span>
                  <span className="text-xs font-bold text-slate-600 items-center">{cdp?.ilkRation}%</span>
                </div>
                <div className="flex flex-row justify-between border-b border-slate-400 py-2">
                  <span className="text-xs font-bold text-slate-600 items-center">Debt celling</span>
                  <span className="text-xs font-bold text-slate-600 items-center">{numberFormatter(cdp?.debtCelling || 0)} DAI</span>
                </div>
                <div className="flex flex-row justify-between border-b border-slate-400 py-2">
                  <span className="text-xs font-bold text-slate-600 items-center">Min. debt</span>
                  <span className="text-xs font-bold text-slate-600 items-center">{numberFormatter(+cdp?.minDebt)} DAI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Loader>
  )
}

export default CdpDetails;