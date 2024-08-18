import {FC, JSX} from "react";
import {Outlet} from "react-router-dom";
import {Header} from "../../components";

const PageLayout: FC = (): JSX.Element => {
  return (
    <div className="mx-auto h-screen bg-layout">
      <Header />
      <Outlet />
    </div>
  )
}

export default PageLayout;