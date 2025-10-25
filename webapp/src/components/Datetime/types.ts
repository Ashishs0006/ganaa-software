import { SyntheticEvent } from "react";
import { DateRangePickerProps } from "react-date-range";

export interface DateTimeInterface extends DateRangePickerProps {
  children?: React.ReactNode;
  buttonDisable?: boolean;
  isopen?: boolean;
  horizontalPosition?: "left" | "right";
  onClick?: (_e?: SyntheticEvent, _bool?: boolean, _cancel?: boolean) => void;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface DateInterface {
  startDate: Date | undefined;
  endDate: Date | undefined;
  maxDate?: Date | undefined;
  key?: string;
  prevData?: {
    startDate: Date;
    endDate: Date;
  };
}
