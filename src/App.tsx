import {RouterProvider} from "react-router-dom";
import {AppProvider} from "./context";
import {router} from "./router";

function App() {
  return (
    <AppProvider>
      <RouterProvider router={router()} />
    </AppProvider>
  )
}

export default App
