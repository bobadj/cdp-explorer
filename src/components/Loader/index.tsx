import {FC, PropsWithChildren, ReactNode, useEffect, useState} from "react";

type LoaderProps = PropsWithChildren & {
  isLoading: boolean
};

const Loader: FC = ({ children, isLoading }: LoaderProps): ReactNode => {
  const [ showLoader, setShowLoader ] = useState<boolean>(false);
  
  useEffect(() => {
    setShowLoader(isLoading);
  }, [isLoading]);
  
  if (!showLoader) return children;
  return (
    <div className="flex flex-col gap-5 h-full w-full items-center justify-center">
      <div className="inline-block h-[150px] w-[150px] animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
           role="status">
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]" />
      </div>
    </div>
  )
}

export default Loader;