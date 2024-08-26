import {FC, JSX, ReactNode} from "react";
import {numberFormatter} from "../../utils";
import {CDPBasicInfo} from "../../types";
import classNames from "classnames";
import arrow from './assets/arrow.svg';

type TableProps = {
  className?: string
  data: CDPBasicInfo[]
  emptyTitle: string
  showLoadingAnimation: boolean
  hideHeader: boolean
  loadingAnimation?: ReactNode
  onClick?: (id: number) => void
}

const Table: FC = ({ className, data, emptyTitle, onClick, loadingAnimation, hideHeader = false, showLoadingAnimation = false }: TableProps): JSX.Element => {
  const handleClick = (id: number) => {
    if (onClick)
      onClick(id)
  }
  
  return (
    <table className={classNames('border-collapse table-auto w-full text-sm rounded-md', className)}>
      {
        !hideHeader &&
          <thead className="border-b-2 border-b-slate-200">
            <tr>
                <th className="py-4 px-3 text-start">ID</th>
                <th className="py-4 px-3 text-start">Collateral Type</th>
                <th className="py-4 px-3 text-start">Debt</th>
                <th className="py-4 px-3 text-start">Collateral</th>
                <th className="py-4 px-3 text-start">Ratio</th>
                <th className="py-4 px-3 text-center"></th>
            </tr>
          </thead>
      }
      <tbody>
      {
        showLoadingAnimation
          ?
          <tr>
            <td colSpan="5" className="text-center">
              {loadingAnimation}
            </td>
          </tr>
          :
          (data || []).length <= 0
            ?
            <tr>
              <td colSpan="5" className="text-center">
                <span className="text-2xl text-slate-500">{emptyTitle}</span>
              </td>
            </tr>
            :
            (data || [])
              .map( (d, i) => (
                <tr key={`table__data__${i}`}
                    onClick={() => handleClick(d.id)}
                    className={classNames('hover:bg-sky-200 cursor-pointer', { 'bg-slate-200': i % 2 === 0 })}>
                  <td className="p-3">{d.id}</td>
                  <td className="p-3">{d.ilk}</td>
                  <td className="p-3">{numberFormatter(+d.totalDebt)} DAI</td>
                  <td className="p-3">{numberFormatter(+d.collateral)} {d.currencySymbol}</td>
                  <td className="p-3">{d.collateralRatio}%</td>
                  <td><img className="max-h-[25px]" src={arrow} alt=""/></td>
                </tr>
              ))
      }
      </tbody>
    </table>
  )
}

export default Table;