import {FC, JSX, useRef, useState} from "react";
import {useClickOutside} from "../../hooks/useClickOutside";
import classNames from "classnames";

type SelectProps = {
  className?: string,
  label?: string
}

const Select: FC = ({ className, label }: SelectProps): JSX.Element => {
  const [ visible, setVisible ] = useState<boolean>(false);
  const [ options, setOptions ] = useState<any[]>([]);
  
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setVisible(false));
  
  const addOption = (option: string) => setOptions([...options, option]);
  const getSelectText = () => {
    if (options.length > 0) {
      if (options.length >= 3) return options.length + ' selected'
      return options.slice(0, 3).join(', ');
    }
    return 'All';
  }
  
  return (
    <div className={classNames('flex flex-row gap-3 mb-4 items-center relative', className)}>
      {label && <span className="text-md">{label}</span>}
      <div
        ref={ref}
        className="relative bg-surface pe-4 ps-2 text-start border-2 border-slate-300 rounded cursor-pointer min-w-[150px]"
        onClick={() => setVisible(true)}
      >
        <span className="text-start">{getSelectText()}</span>
        <div className={classNames('absolute bg-surface w-full left-0 top-7 shadow-md max-h-[150px] overflow-auto', {
          'hidden': !visible
        })}>
          <span onClick={() => addOption('ETH-A')}
                className="px-2 hover:bg-slate-200 w-full block">ETH-A</span>
          <span onClick={() => addOption('ETH-A')}
                className="px-2 hover:bg-slate-200 w-full block">ETH-A</span>
          <span onClick={() => addOption('ETH-A')}
                className="px-2 hover:bg-slate-200 w-full block">ETH-A</span>
          <span onClick={() => addOption('ETH-A')}
                className="px-2 hover:bg-slate-200 w-full block">ETH-A</span>
          <span onClick={() => addOption('ETH-A')}
                className="px-2 hover:bg-slate-200 w-full block">ETH-A</span>
          <span onClick={() => addOption('ETH-A')}
                className="px-2 hover:bg-slate-200 w-full block">ETH-A</span>
          <span onClick={() => addOption('ETH-A')}
                className="px-2 hover:bg-slate-200 w-full block">ETH-A</span>
          <span onClick={() => addOption('ETH-A')}
                className="px-2 hover:bg-slate-200 w-full block">ETH-A</span>
        </div>
      </div>
    </div>
  )
}

export default Select;