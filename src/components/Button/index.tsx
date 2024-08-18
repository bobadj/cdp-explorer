import {FC, JSX, MouseEventHandler, PropsWithChildren} from "react";
import classNames from "classnames";

export enum ButtonClassTypes {
  primary = "primary",
  secondary = "secondary",
  decorative = 'decorative'
}

type ButtonProps = PropsWithChildren & {
  className?: string,
  classType?: ButtonClassTypes,
  disabled?: boolean,
  loading?: boolean
  onClick?: MouseEventHandler
}

const Button: FC = ({ children, classType = ButtonClassTypes.secondary, className, onClick }: ButtonProps): JSX.Element => {
  return <button
    className={classNames("flex flex-row items-center font-medium leading-6 rounded-2xl px-5 w-max", className, {
      "bg-primary text-white": classType === ButtonClassTypes.primary,
      "bg-secondary text-black": classType === ButtonClassTypes.secondary,
      "bg-decorative text-white": classType === ButtonClassTypes.decorative,
    })}
    onClick={onClick}>
    {children}
  </button>
}

export default Button;