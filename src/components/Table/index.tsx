import {FC, JSX} from "react";

const Table: FC = (): JSX.Element => {
  return (
    <table className="border-collapse bg-surface table-auto w-full text-sm shadow-lg rounded-md min-h-[250px]">
      <thead className="border-b-2 border-b-slate-200">
      <tr>
        <th className="py-4 px-3 text-start">ID</th>
        <th className="py-4 px-3 text-start">Debt</th>
        <th className="py-4 px-3 text-start">Collateral Type</th>
        <th className="py-4 px-3 text-start">Collateral</th>
        <th className="py-4 px-3 text-start">Ratio</th>
      </tr>
      </thead>
      {/*<tbody>*/}
      {/*<tr>*/}
      {/*  <td colSpan="5" className="text-center">*/}
      {/*    <span className="text-2xl text-slate-500">Start search to preview results</span>*/}
      {/*  </td>*/}
      {/*</tr>*/}
      {/*</tbody>*/}
      <tbody>
      <tr className="hover:bg-sky-200 cursor-pointer">
        <td className="p-3">10011</td>
        <td className="p-3">3.00M DAI</td>
        <td className="p-3">ETH-A</td>
        <td className="p-3">225,000 ETH</td>
        <td className="p-3">300%</td>
      </tr>
      <tr className="bg-slate-200 hover:bg-sky-200 cursor-pointer">
        <td className="p-3">10011</td>
        <td className="p-3">3.00M DAI</td>
        <td className="p-3">ETH-A</td>
        <td className="p-3">225,000 ETH</td>
        <td className="p-3">300%</td>
      </tr>
      <tr className="hover:bg-sky-200 cursor-pointer">
        <td className="p-3">10011</td>
        <td className="p-3">3.00M DAI</td>
        <td className="p-3">ETH-A</td>
        <td className="p-3">225,000 ETH</td>
        <td className="p-3">300%</td>
      </tr>
      <tr className="bg-slate-200 hover:bg-sky-200 cursor-pointer">
        <td className="p-3">10011</td>
        <td className="p-3">3.00M DAI</td>
        <td className="p-3">ETH-A</td>
        <td className="p-3">225,000 ETH</td>
        <td className="p-3">300%</td>
      </tr>
      <tr className="hover:bg-sky-200 cursor-pointer">
        <td className="p-3">10011</td>
        <td className="p-3">3.00M DAI</td>
        <td className="p-3">ETH-A</td>
        <td className="p-3">225,000 ETH</td>
        <td className="p-3">300%</td>
      </tr>
      <tr className="bg-slate-200 hover:bg-sky-200 cursor-pointer">
        <td className="p-3">10011</td>
        <td className="p-3">3.00M DAI</td>
        <td className="p-3">ETH-A</td>
        <td className="p-3">225,000 ETH</td>
        <td className="p-3">300%</td>
      </tr>
      <tr className="hover:bg-sky-200 cursor-pointer">
        <td className="p-3">10011</td>
        <td className="p-3">3.00M DAI</td>
        <td className="p-3">ETH-A</td>
        <td className="p-3">225,000 ETH</td>
        <td className="p-3">300%</td>
      </tr>
      <tr className="bg-slate-200 hover:bg-sky-200 cursor-pointer">
        <td className="p-3">10011</td>
        <td className="p-3">3.00M DAI</td>
        <td className="p-3">ETH-A</td>
        <td className="p-3">225,000 ETH</td>
        <td className="p-3">300%</td>
      </tr>
      <tr className="hover:bg-sky-200 cursor-pointer">
        <td className="p-3">10011</td>
        <td className="p-3">3.00M DAI</td>
        <td className="p-3">ETH-A</td>
        <td className="p-3">225,000 ETH</td>
        <td className="p-3">300%</td>
      </tr>
      </tbody>
    </table>
  )
}

export default Table;