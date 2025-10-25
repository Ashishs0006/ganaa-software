export interface CustomTimePickerProps {
  value: string;
  children: React.ReactNode;
  onChange: (_formattedTime: string) => void; // Callback function to return the formatted time
}
