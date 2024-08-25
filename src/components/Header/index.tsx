import {FC, JSX} from "react";
import {Button} from "../index.tsx";
import {ButtonClassTypes} from "../Button";

const Header: FC = (): JSX.Element => {
  return (
    <div className="header px-6 py-3 flex flex-row justify-between border-b-2">
      <a href="/" className="logo font-bold text-2xl">
        MakerDAO CDPs Explorer
      </a>
      <Button classType={ButtonClassTypes.decorative}>Connect wallet</Button>
    </div>
  )
}

export default Header;