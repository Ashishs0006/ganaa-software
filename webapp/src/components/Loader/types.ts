import { HTMLAttributes } from "react";

type color = "primary" | "red" | "blue" | "green" | "gray" | "black";
type size = "xs" | "sm" | "base" | "md" | "lg" | "xl";

export interface LoaderInterface extends HTMLAttributes<HTMLDivElement> {
  color?: color;
  size?: size;
}
