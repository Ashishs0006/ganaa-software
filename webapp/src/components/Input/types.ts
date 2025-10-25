import { InputHTMLAttributes } from "react";

type color = "primary" | "red" | "blue" | "green" | "gray" | "black" | "disabled";

export interface InputInterface extends InputHTMLAttributes<HTMLInputElement> {
  color?: color;
  label?: string;
  sublabel?:string;
  containerClass?: string;
  labelClassName?: string;
  errors?: string | undefined;
}
