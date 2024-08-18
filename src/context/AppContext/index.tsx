import {Context, createContext, JSX, PropsWithChildren} from "react";
import {Web3} from "web3";

interface AppContextValue {}

export const AppContext: Context<AppContextValue> = createContext({} as AppContextValue);

type AppProviderProps = PropsWithChildren & {}

export default function AppProvider({ children }: AppProviderProps): JSX.Element {
  
  const web3 = new Web3(Web3.givenProvider || `wss://mainnet.infura.io/ws/v3/${import.meta.env.VITE_INFURA_API_KEY}`);
  
  const contextValue: AppContextValue = {};
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}
