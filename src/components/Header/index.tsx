import {FC, JSX} from "react";
import {Button} from "../index.tsx";
import {useWeb3Wallet} from "../../hooks";
import {formatAddress} from "../../utils";
import {ButtonClassTypes} from "../../types/enum";

const Header: FC = (): JSX.Element => {
  const { isConnected, accounts, connectWallet } = useWeb3Wallet();
  
  return (
    <div className="header px-6 py-3 flex flex-row justify-between border-b-2">
      <a href="/" className="logo font-bold text-2xl">
        MakerDAO CDPs Explorer
      </a>
      <Button classType={ButtonClassTypes.decorative} onClick={connectWallet}>
        {isConnected ? formatAddress(accounts[0]) : 'Connect wallet'}
      </Button>
    </div>
  )
}

export default Header;