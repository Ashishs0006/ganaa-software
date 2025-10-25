import { SyntheticEvent } from "react";

export interface DiscardModalProps {
  handleClickSaveAndContinue: (_e: SyntheticEvent, _btnType?: "SAVE" | "SAVE_AND_NEXT") => void;
  resource?: string;
  action?: string;
}
