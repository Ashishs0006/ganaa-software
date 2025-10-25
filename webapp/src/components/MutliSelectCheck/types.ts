export interface ISelectOption {
  label: string | number;
  value: string | number;
  disabled?: boolean;
}
export interface SelectProps {
  className?: string;
  short?: boolean;
  optionClassName?: string;
  containerClass?: string;
  options: ISelectOption[];
  disable?: boolean;
  label?: string; // Array of options
  placeholder?: string; // Placeholder text (optional)
  onChange?: (_key: string, _value: ISelectOption) => void;
  value: ISelectOption;
  name: string;
}
