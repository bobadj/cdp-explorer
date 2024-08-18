import {FC, JSX} from "react";
import classNames from "classnames";

type SearchProps = {
  placeholder?: string,
  className?: string
}

const Search: FC = ({ placeholder, className }: SearchProps): JSX.Element => {
  return (
    <input type="text"
           className={classNames('w-full py-4 px-3 text-slate-700 tracking-wider outline-0 bg-slate-100 rounded-3xl text-xl border-2 border-transparent focus:border-primary', className)}
           placeholder={placeholder} />
  )
}

export default Search;