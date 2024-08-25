import { createBrowserRouter } from "react-router-dom";
import { Explorer } from "../pages";
import PageLayout from "../layout/PageLayout";
import CdpDetails from "../pages/CdpDetails";

export const EXPLORER_PATH: string = '/';

export const CDP_DETAILS_PAGE: string = '/cdp/:cdpId'

export const router = () => {
  return createBrowserRouter([
    {
      element: <PageLayout />,
      errorElement: <PageLayout />,
      children: [
        {
          path: EXPLORER_PATH,
          element: <Explorer />
        },
        {
          path: CDP_DETAILS_PAGE,
          element: <CdpDetails />
        }
      ]
    }
  ]);
};
