import { ButtonHTMLAttributes } from "react";

type variant = "default" | "contained" | "outlined" | "filled";
type color = "primary" | "red" | "blue" | "green" | "gray" | "black" | "white" | "disabled";
type size = "base" | "md";

export interface ButtonInterface extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: variant;
  color?: color;
  size?: size;
}
