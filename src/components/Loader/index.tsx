import {FC, PropsWithChildren, ReactNode, useEffect, useState} from "react";
import classNames from "classnames";

type LoaderProps = PropsWithChildren & {
  isLoading: boolean
};

const Loader: FC<LoaderProps> = ({ children, isLoading }): ReactNode => {
  const [ showLoader, setShowLoader ] = useState<boolean>(false);
  
  useEffect(() => {
    setShowLoader(isLoading);
  }, [isLoading]);
  
  return (
    <>
      <div className={classNames('gap-5 h-[90%] w-full items-center justify-center', {
        'hidden': !showLoader,
        'flex flex-col': showLoader
      })}>
        <div className="inline-block h-[150px] w-[150px] animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
             role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]" />
        </div>
      </div>
      <div className={classNames({ 'hidden': showLoader, 'block': !showLoader })}>
        {children}
      </div>
    </>
  )
}

export default Loader;