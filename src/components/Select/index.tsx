import {FC, JSX, useRef, useState} from "react";
import {useClickOutside} from "../../hooks";
import classNames from "classnames";

type SelectProps = {
  className?: string,
  label?: string
  valueKey: string
  labelKey: string
  options: []
}

const Select: FC = ({ className, label, valueKey, labelKey, options }: SelectProps): JSX.Element => {
  const [ visible, setVisible ] = useState<boolean>(false);
  const [ selectedOptions, setSelectedOptions ] = useState<any[]>([]);
  
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setVisible(false));
  
  const addOption = (option: any) => {
    if (isSelected(option)) {
      setSelectedOptions(selectedOptions.filter((_, i) => i !== selectedOptions.indexOf(option)))
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };
  const getSelectText = () => {
    if (selectedOptions.length > 0) {
      if (selectedOptions.length >= 4) return selectedOptions.length + ' selected'
      return selectedOptions
        .map( opt => opt[labelKey] )
        .map( value => value.substring(0, 5))
        .slice(0, 3).join(', ');
    }
    return 'All';
  }
  const isSelected = (option: any) => selectedOptions.indexOf(option) >= 0;
  
  return (
    <div className={classNames('flex flex-row gap-3 mb-4 items-center relative', className)}>
      {label && <span className="text-md">{label}</span>}
      <div
        ref={ref}
        className="relative bg-surface pe-4 ps-2 text-start border-2 border-slate-300 rounded cursor-pointer min-w-[250px]"
        onClick={() => setVisible(true)}
      >
        <span className="text-start">{getSelectText()}</span>
        <div className={classNames('absolute bg-surface w-full left-0 top-7 shadow-md max-h-[250px] overflow-auto', {
          'hidden': !visible
        })}>
          {
            (options || [])
              .map( (opt, i) => (
                <span key={`select_option_${i}`}
                      onClick={() => addOption(opt)}
                      className={classNames('px-2 hover:bg-slate-200 w-full block', {
                        'bg-slate-200': isSelected(opt)
                      })}>
                  {opt[labelKey]}
                </span>
              ))
          }
        </div>
      </div>
    </div>
  )
}

export default Select;