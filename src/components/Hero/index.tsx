import {FC, JSX} from "react";
import {numberFormatter} from "../../utils";
import {useAppContext} from "../../hooks";

const Hero: FC = (): JSX.Element => {
  const { totalVaults, totalDebt } = useAppContext();
  
  
  return (
    <h1 className="text-5xl md:text-6xl lg:mt-16 text-center font-bold tracking-wide max-w-[70%] mx-auto">
      {totalVaults.toLocaleString()} total MakerDAO vaults with ~{numberFormatter(totalDebt.toString())} in DAI
    </h1>
  )
}

export default Hero;