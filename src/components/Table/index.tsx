import {FC, JSX} from "react";
import {numberFormatter} from "../../utils";
import classNames from "classnames";

type TableProps = {
  data: any[]
  emptyTitle: string
}

const Table: FC = ({ data, emptyTitle }: TableProps): JSX.Element => {
  return (
    <table className="border-collapse bg-surface table-auto w-full text-sm shadow-lg rounded-md min-h-[250px]">
      <thead className="border-b-2 border-b-slate-200">
      <tr>
        <th className="py-4 px-3 text-start">ID</th>
        <th className="py-4 px-3 text-start">Collateral Type</th>
        <th className="py-4 px-3 text-start">Debt</th>
        <th className="py-4 px-3 text-start">Collateral</th>
        <th className="py-4 px-3 text-start">Ratio</th>
      </tr>
      </thead>
      <tbody>
      {
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
              <tr key={`table__data__${i}`} className={classNames('hover:bg-sky-200 cursor-pointer', { 'bg-slate-200': i % 2 === 0 })}>
                <td className="p-3">{d.cdpId}</td>
                <td className="p-3">{d.ilk}</td>
                <td className="p-3">{numberFormatter(+d.totalDebt)} DAI</td>
                <td className="p-3">{numberFormatter(+d.collateral)} {d?.ilkInfo?.symbol}</td>
                <td className="p-3">{d.collateralizationRatio}%</td>
              </tr>
            ))
      }
      </tbody>
    </table>
  )
}

export default Table;