import {RouterProvider} from "react-router-dom";
import {AppProvider, Web3WalletProvider} from "./context";
import {router} from "./router";

function App() {
  return (
    <Web3WalletProvider>
      <AppProvider>
        <RouterProvider router={router()} />
      </AppProvider>
    </Web3WalletProvider>
  )
}

export default App
