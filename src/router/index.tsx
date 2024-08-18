import { createBrowserRouter } from "react-router-dom";
import { Explorer } from "../pages";
import PageLayout from "../layout/PageLayout";

export const EXPLORER_PATH: string = '/';

export const router = () => {
  return createBrowserRouter([
    {
      element: <PageLayout />,
      errorElement: <PageLayout />,
      children: [
        {
          path: EXPLORER_PATH,
          element: <Explorer />
        }
      ]
    }
  ]);
};
