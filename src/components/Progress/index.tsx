import {FC, JSX} from "react";
import classNames from "classnames";

type ProgressProps = {
  progress: number
};

const Progress: FC = ({ progress }: ProgressProps): JSX.Element => {
  return (
    <div className="relative">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full px-28">
        <div className="relative mb-5 h-5 rounded-full bg-gray-200">
          <div className="h-full animate-pulse transition-all rounded-full bg-blue-500" style={{ width: `${progress}%` }}>
            <span className={classNames('absolute transition-all inset-0 flex items-center justify-center text-xs font-semibold', {
              'text-black': progress < 50,
              'text-white': progress >= 50,
            })}>
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Progress;