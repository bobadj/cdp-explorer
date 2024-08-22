import {FC, JSX, useEffect, useState} from "react";
import {Table, Search, Select, Loader, Progress} from "../../components";
import {useAppContext} from "../../hooks";
import {numberFormatter} from "../../utils";
import type {CollateralType} from "../../context/AppContext";

const Explorer: FC = (): JSX.Element => {
  const [ selectedCollateralTypes, setSelectedCollateralTypes ] = useState<CollateralType[]>([]);
  const [ searchedValue, setSearchedValue ] = useState<string>();
  
  const { searchProgress, vaults, isLoading, collateralTypes, totalVaults, searchForCdps, totalDebt } = useAppContext();
  
  useEffect(() => {
    search()
  }, [selectedCollateralTypes, searchedValue]);
  
  const search = async () => await searchForCdps(searchedValue, selectedCollateralTypes);

  return (
    <Loader isLoading={isLoading}>
      <div className="bg-slate-200 pb-32 pt-20">
        <div className="max-w-[80%] mx-auto text-center">
          <h1 className="text-6xl mb-14 font-bold tracking-wide max-w-[60%] mx-auto">
            {totalVaults.toLocaleString()} total MakerDAO vaults with ~{numberFormatter(totalDebt)} in DAI
          </h1>
          <Search onChange={setSearchedValue}
                  allow={new RegExp('^[0-9]+$')}
                  disabled={searchProgress && searchProgress > 0}
                  className="mx-auto shadow-sm"
                  placeholder="Search for CDP by id" />
          <p className="text-start mx-3 mt-1 text-slate-500 text-xs">* search result will display 20 CDPs closest to actual cdpId</p>
        </div>
      </div>
      <div className="container mx-auto mt-[-100px] pb-[50px]">
        <Select className="justify-end"
                label="Collateral Type:"
                options={collateralTypes}
                valueKey="ilk"
                labelKey="name"
                onChange={setSelectedCollateralTypes}
                disabled={searchProgress && searchProgress > 0}
        />
        <Table data={vaults}
               showLoadingAnimation={searchProgress && searchProgress > 0}
               loadingAnimation={<Progress progress={searchProgress} />}
               emptyTitle="Start search to preview results" />
      </div>
    </Loader>
  )
}

export default Explorer;