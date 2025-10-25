import React from "react";

export interface ModalProps {
  children: React.ReactNode;
  button?: React.ReactNode;
  crossIcon?: boolean;
  toggleModal?: () => void;
  isOpen?: boolean;
}
