import { MouseEvent, SyntheticEvent, useEffect, useRef, useState } from "react";
import RcCalendar from "rc-calendar";
import moment, { Moment } from "moment";
import "rc-calendar/assets/index.css";
import { CustomCalendarProps } from "@/components/CustomCalendar/types";

const CustomCalendar = ({
  onChange,
  disabledDate,
  value,
  children,
  className
}: CustomCalendarProps) => {
  const [currentDate, setCurrentDate] = useState<Moment | undefined>();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<"left" | "right">("right");

  const calenderRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: MouseEvent<Document>) => {
    if (calenderRef.current && !calenderRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
    };
  }, []);

  useEffect(() => {
    if (value) {
      const parsedDate = moment(value, "YYYY-MM-DD");
      if (parsedDate.isValid()) {
        setCurrentDate(parsedDate);
      }
    }
  }, [value]);

  const handleDateChange = (date: Moment | null) => {
    if (date && date.isValid()) {
      const formatted = `${date.month() + 1}/${date.date()}/${date.year()}`;
      setCurrentDate(date);
      if (disabledDate && disabledDate(date)) {
        return;
      }
      onChange(formatted);
    } else {
      setCurrentDate(undefined);
      onChange("");
    }
  };

  const handleClear = (_e: SyntheticEvent) => {
    setCurrentDate(undefined);
    onChange("");
  };

  const handleToggle = () => {
    if (!open && calenderRef.current) {
      const rect = calenderRef.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;

      if (spaceRight < 300 && spaceLeft > 300) {
        setPosition("left");
      } else {
        setPosition("right");
      }
    }
    if (value) {
      const parsedDate = moment(value, "YYYY-MM-DD");
      if (parsedDate.isValid()) {
        setCurrentDate(parsedDate);
      }
    }
    setOpen(!open);
  };

  return (
    <div ref={calenderRef} id="customCalender" className="calendar-container relative w-full">
      <div onClick={handleToggle} className="relative flex items-center cursor-pointer w-full">
        {children}
      </div>

      {open && (
        <div
          className={`absolute z-10 mt-1 ${
            position === "left" ? "right-0" : "left-0"
          } ${className}`}
        >
          <RcCalendar
            disabledDate={disabledDate}
            format={"YYYY-MM-DD"}
            showDateInput={false}
            value={currentDate}
            onChange={handleDateChange}
            onSelect={(date) => {
    handleDateChange(date);
    setOpen(false); // ✅ Close only when a date is selected
  }}
          />
          <p
            onClick={handleClear}
            className="absolute bottom-3 text-sm left-5 cursor-pointer text-blue-400 hover:text-blue-500"
          >
            clear
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;
