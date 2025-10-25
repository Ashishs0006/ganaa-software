export interface CustomCalendarProps {
  value?: string;
  className?: string;
  children?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  disabledDate?: (_current: any) => boolean;
  onChange: (_formattedDate: string) => void; // Callback function to return the formatted date
}
