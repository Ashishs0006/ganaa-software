export interface ISelectOption {
  label: string | number;
  subLabel?: string | number;
  value: string | number;
  disabled?: boolean;
}
export interface SelectProps {
  className?: string;
  short?: boolean;
  optionClassName?: string;
  subLabelClassName?: string;
  containerClass?: string;
  options: ISelectOption[];
  disable?: boolean;
  label?: string; // Array of options
  placeholder?: string; // Placeholder text (optional)
  onChange?: (_key: string, _value: ISelectOption) => void;
  value: ISelectOption | ISelectOption[];
  name: string;
  labelClassName?: string;
  errors?: string | undefined;
}

export interface SearchMedicinesProps extends SelectProps {
  apiCall?: boolean; // Enable API call
  required?: boolean; // Required field
  fetchOptions?: (_query: string) => Promise<ISelectOption[]>; // API function
}
