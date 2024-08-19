import {FC, JSX} from "react";
import {Table, Search, Select} from "../../components";
import {useAppContext} from "../../hooks";

const Explorer: FC = (): JSX.Element => {
  const { collateralTypes, totalVaults } = useAppContext();
  
  return (
    <>
      <div className="bg-slate-200 pb-32 pt-20">
        <div className="max-w-[80%] mx-auto text-center">
          <h1 className="text-6xl mb-14 font-bold tracking-wide max-w-[70%] mx-auto">{totalVaults.toLocaleString()} total MakerDAO vaults with ~1.1 billions in DAI</h1>
          <Search className="mx-auto shadow-sm" placeholder="Search for CDP by id" />
          <p className="text-start mx-3 mt-1 text-slate-500 text-xs">* search result will display 20 CDPs closest to actual cdpId</p>
        </div>
      </div>
      <div className="container mx-auto mt-[-100px] pb-[50px]">
        <Select className="justify-end"
                label="Collateral Type:"
                options={collateralTypes}
                valueKey="ilk"
                labelKey="name"
        />
        <Table />
      </div>
    </>
  )
}

export default Explorer;