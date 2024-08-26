import {ChangeEvent, FC, FocusEventHandler, JSX, useMemo} from "react";
import classNames from "classnames";
import {debounce} from "../../utils";
import {systemKeyCodes} from "../../const";

type SearchProps = {
  placeholder?: string
  className?: string
  onChange?: (value: string) => void
  onFocus?: FocusEventHandler
  allow: RegExp
  disabled?: boolean
}

const Search: FC = ({ placeholder, className, onChange, onFocus, allow, disabled = false }: SearchProps): JSX.Element => {
  const handleChange = useMemo(() => debounce((ev: ChangeEvent) => {
    const target: HTMLTextAreaElement = ev.target as HTMLTextAreaElement;
    if (onChange) onChange(target.value)
  }), [onChange]);
  
  const handleKeyDown = (ev) => {
    // ignore system keyCodes ( backspace, del, ... )
    if (systemKeyCodes.indexOf(ev.keyCode) < 0 && allow && !allow.test(ev.key)) {
      ev.preventDefault();
    }
  }
  
  return (
    <input type="text"
           disabled={disabled}
           onKeyDown={handleKeyDown}
           onChange={handleChange}
           onFocus={onFocus}
           className={classNames(
             'w-full bg-white shadow-none text-slate-700 text-xl rounded outline-0 top-5 py-3 px-3',
             {
               'cursor-not-allowed': disabled,
             },
             className
           )}
           placeholder={placeholder} />
  )
}

export default Search;