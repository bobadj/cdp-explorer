import {useContext} from "react";
import {Web3WalletContext} from "../context/Web3Wallet";

export default function useWeb3Wallet() {
  const context = useContext(Web3WalletContext);
  if (!context) {
    throw new Error(
      `Make sure to wrap components with Web3WalletProvider`,
    );
  }
  return context
}
