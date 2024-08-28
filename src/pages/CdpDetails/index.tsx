import {FC, JSX, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Button, CDPSummary, Loader} from "../../components";
import {formatAddress} from "../../utils";
import {useAppContext, useWeb3Wallet} from "../../hooks";
import {ButtonClassTypes} from "../../types/enum";
import {CDPDetailedInfo} from "../../types";
import {ZERO_ADDRESS} from "../../const";

const CdpDetails: FC = (): JSX.Element => {
  const { cdpId } = useParams();
  const { isConnected, signMessage } = useWeb3Wallet();
  const { isLoading, fetchCdpDetailedInfoById } = useAppContext();
  
  const [ signedMessage, setSignedMessage ] = useState<string>();
  const [ cdp, setCdp ] = useState<CDPDetailedInfo>()
  
  useEffect(() => {
    if (cdpId) getCdpById(cdpId);
  }, [cdpId]);
  
  const getCdpById = async (cdpId: string) => setCdp(
    await fetchCdpDetailedInfoById(cdpId)
  );
  
  const handleMessageSign = async () => setSignedMessage(
    await signMessage('Ovo je moj CDP')
  );
  
  return (
    <Loader isLoading={isLoading}>
      <div className="bg-surface container pt-12 mx-auto">
        {
          cdp?.owner === ZERO_ADDRESS
            ?
            <div className="w-full flex flex-col md:flex-row justify-between items-center bg-white rounded-md shadow-md p-8">
              <div className="text-center md:text-start">
                <h2 className="font-bold text-2xl mb">
                  CDP #{cdp?.id} does not exist, go back to <a className="text-primary" href="/">home page</a>
                </h2>
              </div>
            </div>
            :
            <>
              <div className="w-full flex flex-col md:flex-row justify-between items-center bg-white rounded-md shadow-md p-8">
                <div className="text-center md:text-start">
                  <h2 className="font-bold text-2xl mb">Position owner: {formatAddress(cdp?.owner)}</h2>
                  { !isConnected && <p className="text-sm">Please connect your wallet in order to sing.</p>}
                </div>
                {
                  !signedMessage
                  &&
                    <Button className="px-14 py-3 mt-5 md:mt-0"
                            onClick={handleMessageSign}
                            disabled={!isConnected}
                            classType={ButtonClassTypes.decorative}>
                        Ovo je moj CDP
                    </Button>
                }
              </div>
              <CDPSummary cdp={cdp} />
            </>
        }
      </div>
    </Loader>
  )
}

export default CdpDetails;