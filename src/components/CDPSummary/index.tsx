import {FC, JSX} from "react";
import {currencyFormatter, numberFormatter} from "../../utils";
import {PRICE_FEED} from "../../const";
import {CDPDetailedInfo} from "../../types";

interface CDPSummaryProps {
  cdp: CDPDetailedInfo|undefined
}

const CDPSummary: FC<CDPSummaryProps> = ({ cdp }): JSX.Element => {
  return (
    <div className="flex flex-col gap-5 w-full mt-5 bg-white rounded-md shadow-md px-8 py-5">
      <div className="flex flex-col lg:flex-row">
        <div className="basis-1/2">
          <h2 className="font-semibold text-4xl w-full mb-4">{cdp?.ilk} CDP #{cdp?.id}</h2>
          <div className="flex flex-col gap-5 justify-between pe-0 lg:pe-[120px]">
            <div className="flex flex-col">
              <span className="text-md font-light">Ratio:</span>
              <span className="text-5xl">{cdp?.collateralRatio}%</span>
            </div>
            <div className="flex justify-between">
              <div className="flex flex-col">
                <span className="text-md font-light">Collateral:</span>
                <span className="text-4xl">
                      {numberFormatter(cdp?.collateral.toString() || 0)} <span className="text-lg">{cdp?.currencySymbol}</span>
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
            <div className="flex flex-row justify-between border-b border-slate-400 py-2">
              <span className="text-xs font-bold text-slate-600 items-center">Max. debt</span>
              <span className="text-xs font-bold text-slate-600 items-center">{numberFormatter(+cdp?.maxDebt)} DAI</span>
            </div>
            <div className="flex flex-row justify-between border-b border-slate-400 py-2">
              <span className="text-xs font-bold text-slate-600 items-center">Max. withdrawal</span>
              <span className="text-xs font-bold text-slate-600 items-center">{numberFormatter(+cdp?.maxWithdrawal)} {cdp?.currencySymbol}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CDPSummary;