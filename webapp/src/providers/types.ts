import { HTMLAttributes } from "react";

export interface IAuthProvider extends HTMLAttributes<HTMLDivElement> {
  name?: string;
}

export interface IDataProvider extends HTMLAttributes<HTMLDivElement> {
  name?: string;
}
