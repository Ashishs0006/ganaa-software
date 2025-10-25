import { JSX } from "react";

export interface IRBACGUARD {
  resource: string;
  action?: string;
  children: JSX.Element;
}
export interface IRBACGUARDARRAY {
  resource: { resource: string; action: string }[];
  children: JSX.Element;
}
