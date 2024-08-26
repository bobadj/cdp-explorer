import {FC, JSX} from "react";
import {Loader, Hero, AdvancedSearch} from "../../components";
import {useAppContext} from "../../hooks";

const Explorer: FC = (): JSX.Element => {
  const { isLoading, searchForCdps } = useAppContext();
  
  return (
    <Loader isLoading={isLoading}>
      <div className="bg-surface relative w-full md:w-[70%] m-auto pt-20">
        <Hero />
        <AdvancedSearch onChange={searchForCdps} />
      </div>
    </Loader>
  )
}

export default Explorer;