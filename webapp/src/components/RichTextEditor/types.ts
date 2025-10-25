export interface RichTextEditorProps {
  placeholder?: string;
  maxLength?: number;
  value: string;
  name: string;
  label?: string;
  disable?: boolean;
  height?: string;
  countHide?: boolean;
  onChange?: (_name: string, _value: string) => void;
  className?: string;
  showToolBar?: boolean;
  required?: boolean;
}
