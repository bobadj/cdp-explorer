import {Address, MetaMaskProvider, Web3} from "web3";
import {Context, createContext, JSX, PropsWithChildren, useEffect, useState} from "react";
import {Web3WalletContextValue} from "../../types/interfaces";

declare global {
  interface Window {
    ethereum: MetaMaskProvider<any>;
  }
}

export const Web3WalletContext: Context<Web3WalletContextValue> = createContext({} as Web3WalletContextValue);

type Web3WalletProviderProps = PropsWithChildren & {}

export default function Web3WalletProvider({ children }: Web3WalletProviderProps): JSX.Element {
  const [chainId, setChainId] = useState<string|null>(null);
  const [latestBlock, setLatestBlock] = useState<string|null>(null);
  const [accounts, setAccounts] = useState<Address[]>([]);
  
  const web3 = new Web3(
    Web3.givenProvider ||
    `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`
  );
  
  useEffect(() => {
    fetchAndSetChainId();
    getConnectedAccounts();
    fetchAndSetLatestBlockNumber();
    
    window.ethereum.on('accountsChanged', handleAccountsChange);
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChange)
    }
  }, []);
  
  const fetchAndSetChainId = async () => setChainId(
    web3 ? (await web3.eth.getChainId()).toString() : null
  );
  
  const fetchAndSetLatestBlockNumber = async () => setLatestBlock(
    web3 ? (await web3.eth.getBlockNumber()).toString() : null
  );
  
  const getConnectedAccounts = async () => setAccounts(
    await window.ethereum.request({ method: 'eth_accounts' }) as Address[]
  );
  
  const handleAccountsChange = (accounts: Address[]|string[]) => setAccounts(
    accounts
  );
  
  const requestAccounts = async () => await window.ethereum.request({ method: "eth_requestAccounts" });
  
  const signMessage = async (messageToSign: string): Promise<string> => {
    return await window.ethereum.request({
      "method": "personal_sign",
      "params": [
        web3.utils.toHex(messageToSign),
        accounts[0]
      ]
    }) as string;
  };
  
  const contextValue: Web3WalletContextValue = {
    web3: web3 as Web3,
    chainId,
    latestBlock,
    accounts,
    connectWallet: requestAccounts,
    signMessage,
    isConnected: accounts.length > 0
  };
  
  return (
    <Web3WalletContext.Provider value={contextValue}>
      {children}
    </Web3WalletContext.Provider>
  )
}
