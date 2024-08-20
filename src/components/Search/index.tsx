import {ChangeEvent, FC, JSX, useMemo} from "react";
import classNames from "classnames";
import {debounce} from "../../utils";
import { systemKeyCodes } from "../../const";

type SearchProps = {
  placeholder?: string
  className?: string
  onChange?: Function
  allow: RegExp
}

const Search: FC = ({ placeholder, className, onChange, allow }: SearchProps): JSX.Element => {
  const handleChange = useMemo(() => debounce((ev: ChangeEvent) => {
    console.log('change triggered')
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
           onKeyDown={handleKeyDown}
           onChange={handleChange}
           className={classNames('w-full py-4 px-3 text-slate-700 tracking-wider outline-0 bg-slate-100 rounded-3xl text-xl border-2 border-transparent focus:border-primary', className)}
           placeholder={placeholder} />
  )
}

export default Search;