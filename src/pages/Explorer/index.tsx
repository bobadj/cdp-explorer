import {FC, JSX, useEffect, useRef, useState} from "react";
import {Table, Search, Select, Loader, Progress} from "../../components";
import {useAppContext, useClickOutside} from "../../hooks";
import {numberFormatter} from "../../utils";
import {useNavigate} from "react-router-dom";
import type {CollateralType} from "../../types";
import classNames from "classnames";

const Explorer: FC = (): JSX.Element => {
  const [ selectedCollateralTypes, setSelectedCollateralTypes ] = useState<CollateralType[]>([]);
  const [ isSearchFocused, setIsSearchFocused ] = useState<boolean>(false);
  const [ searchedValue, setSearchedValue ] = useState<string>();
  
  const navigate = useNavigate();
  const { searchProgress, vaults, isLoading, collateralTypes, totalVaults, searchForCdps, totalDebt } = useAppContext();
  
  const ref = useRef<HTMLDivElement|null>(null);
  useClickOutside(ref, () => setIsSearchFocused(vaults.length > 0));
  
  useEffect(() => {
    search()
  }, [selectedCollateralTypes, searchedValue]);
  
  const search = async () => await searchForCdps(searchedValue, selectedCollateralTypes);
  
  return (
    <Loader isLoading={isLoading}>
      <div className="bg-surface relative w-full md:w-[70%] m-auto pt-20">
        <h1 className="text-5xl md:text-6xl lg:mt-16 text-center font-bold tracking-wide max-w-[70%] mx-auto">
          {totalVaults.toLocaleString()} total MakerDAO vaults with ~{numberFormatter(totalDebt.toString())} in DAI
        </h1>
        <div ref={ref}
             className={classNames(
               'mt-14 shadow-xl transition-all duration-300',
               {
                 'translate-y-[-250px] md:translate-y-[-300px] lg:translate-y-[-250px]': isSearchFocused,
               }
             )}
        >
          <Search onChange={setSearchedValue}
                  allow={new RegExp('^[0-9]+$')}
                  disabled={searchProgress && searchProgress > 0}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search for CDP by id" />
          <div className={classNames(
            'bg-white hidden overflow-auto transition-all duration-500 opacity-0 shadow-xl rounded-b-md w-full border-t border-slate-200',
            {
              'opacity-100 !block': isSearchFocused,
              'h-[250px]': (vaults || []).length <= 0,
              'h-[500px]': (vaults || []).length > 0,
            }
          )}>
            <div className="flex flex-row justify-between items-center my-2 px-3">
              <span className="text-xs font-semibold italic text-slate-400 hidden lg:inline-block">search result will display 20 CDPs closest to actual cdpId</span>
              <Select label="Collateral Type:"
                      options={collateralTypes}
                      valueKey="ilk"
                      labelKey="name"
                      onChange={setSelectedCollateralTypes}
                      disabled={searchProgress && searchProgress > 0}
              />
            </div>
            <Table className="w-full h-[70%]"
                   data={vaults}
                   hideHeader
                   onClick={(id) => navigate(`/cdp/${id}`)}
                   showLoadingAnimation={searchProgress && searchProgress > 0}
                   loadingAnimation={<Progress progress={searchProgress} />}
                   emptyTitle="Start search to preview results" />
          </div>
        </div>
      </div>
    </Loader>
  )
}

export default Explorer;