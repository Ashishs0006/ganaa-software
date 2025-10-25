import { useState, useEffect, useRef, MouseEvent } from "react";

import { CustomTimePickerProps } from "@/components/CustomTimePicker/types";

const CustomTimePicker = ({ onChange, value, children }: CustomTimePickerProps) => {
  const [hours, setHours] = useState<number>(
    Number(String(new Date().getHours()).padStart(2, "0"))
  );

  const [open, setOpen] = useState(false);

  const [minutes, setMinutes] = useState<number>(
    Number(String(new Date().getMinutes()).padStart(2, "0"))
  );

  const [formate, setFormate] = useState<string>("AM");

  const timeRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: MouseEvent<Document>) => {
    if (timeRef.current && !timeRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
    };
  }, []);

  const extractTimeValues = (timeString: string) => {
    // Regular expression to match the format "HH:MM" (24-hour format)
    const regex = /(\d{1,2}):(\d{2})/;
    const match = timeString.match(regex);

    if (match) {
      // Extract hour and minute from the matched string
      let hour = parseInt(match[1]);
      const minute = match[2];

      // Determine AM or PM and convert hour to 12-hour format
      let period = "AM";
      if (hour >= 12) {
        period = "PM";
        if (hour > 12) {
          hour -= 12; // Convert hour from 24-hour format to 12-hour format
        }
      }
      if (hour === 0) {
        hour = 12; // Special case for 00:00 (midnight)
      }
      setHours(hour);
      setMinutes(+minute);
      setFormate(period);
      // return [hour, minute, period];
    }
  };

  useEffect(() => {
    extractTimeValues(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateTime = () => {
    setOpen(false)
    const formattedTime = `${
      formate === "AM" && hours === 12
        ? "00"
        : formate === "AM"
        ? hours.toString().padStart(2, "0")
        : hours === 12
        ? "12"
        : 12 + +hours.toString().padStart(2, "0")
    }:${minutes.toString().padStart(2, "0")}`;
    onChange(formattedTime);
  };

  useEffect(() => {
    updateTime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hours, minutes, formate]);

  const handleHourClick = (hour: number) => {
    setHours(hour);
  };

  const handleMinuteClick = (minute: number) => {
    setMinutes(minute);
  };

  const handleFormateClick = (value: string) => {
    setFormate(value);
  };

  return (
    <div ref={timeRef} id="customTimePicker" className="calendar-container w-full">
      <div onClick={() => setOpen(!open)} className="w-fit relative flex items-center">
        {children}
      </div>
      {open && (
        <div className="absolute z-10 mt-1">
          <div className="flex bg-white shadow-lg border rounded-lg overflow-hidden">
            <div className="time-section w-fit p-1 h-44 overflow-y-auto scrollbar-hidden px-1 border-r border-gray-300">
              {Array.from({ length: 13 }, (_, index) => (
                <div
                  key={index}
                  className={`time-item p-2 text-center mt-1  cursor-pointer rounded-md hover:bg-blue-500 hover:text-white ${
                    hours === index ? "bg-blue-500 text-white" : ""
                  }`}
                  onClick={() => handleHourClick(index)} // Handle hour click
                >
                  {index.toString().padStart(2, "0")}
                </div>
              ))}
            </div>

            <div className="time-section w-fit p-1 h-44 overflow-y-auto scrollbar-hidden px-1 border-r border-gray-300">
              {Array.from({ length: 60 }, (_, index) => (
                <div
                  key={index}
                  className={`time-item p-2 text-center rounded-md mt-1 cursor-pointer hover:bg-blue-500 hover:text-white ${
                    minutes === index ? "bg-blue-500 text-white" : ""
                  }`}
                  onClick={() => handleMinuteClick(index)} // Handle minute click
                >
                  {index.toString().padStart(2, "0")}
                </div>
              ))}
            </div>

            <div className="time-section w-fit p-1 h-44 overflow-y-auto  px-1 border-gray-300">
              {["AM", "PM"].map((data: string) => (
                <div
                  key={data}
                  className={`time-item p-2 text-center cursor-pointer mt-1 rounded-md hover:bg-blue-500 hover:text-white ${
                    formate === data ? "bg-blue-500 text-white" : ""
                  }`}
                  onClick={() => handleFormateClick(data)} // Handle minute click
                >
                  {data}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;
