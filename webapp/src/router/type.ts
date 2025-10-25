import { JSX } from "react";

export interface RouteItem {
  path: string;
  element: JSX.Element;
  resource?: string;
  children?: RouteItem[];
  errorElement?: JSX.Element;
}

export interface Props {
  resource: string;
  action?: string;
  children: JSX.Element;
}