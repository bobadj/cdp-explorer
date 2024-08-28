import {FC, JSX, useEffect, useRef, useState} from "react";
import classNames from "classnames";
import {Progress, Search, Select, Table} from "../../components";
import {useAppContext, useClickOutside} from "../../hooks";
import {CollateralType} from "../../types";
import {useNavigate} from "react-router-dom";

interface AdvancedSearchProps {
  onChange?: (search: string|undefined, collateralOptions: CollateralType[]) => void
}

const AdvancedSearch: FC<AdvancedSearchProps> = ({ onChange }): JSX.Element => {
  const [ selectedCollateralTypes, setSelectedCollateralTypes ] = useState<CollateralType[]>([]);
  const [ isSearchFocused, setIsSearchFocused ] = useState<boolean>(false);
  const [ searchedValue, setSearchedValue ] = useState<string>();
  
  const navigate = useNavigate();
  const { searchProgress, vaults, collateralTypes } = useAppContext();
  
  const ref = useRef<HTMLDivElement|null>(null);
  useClickOutside(ref, () => setIsSearchFocused(vaults.length > 0));
  
  useEffect(() => {
    if (onChange) onChange(searchedValue, selectedCollateralTypes);
  }, [selectedCollateralTypes, searchedValue]);
  
  return (
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
  )
}

export default AdvancedSearch;