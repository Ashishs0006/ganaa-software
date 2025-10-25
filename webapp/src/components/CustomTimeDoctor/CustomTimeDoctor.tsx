import { useState, useEffect, useRef, MouseEvent } from "react";
import { CustomTimePickerProps } from "@/components/CustomTimePicker/types";

const CustomTimeDoctor = ({ onChange, value, children }: CustomTimePickerProps) => {
  const [hours, setHours] = useState<number>(new Date().getHours());
  const [minutes, setMinutes] = useState<number>(new Date().getMinutes());
  const [seconds, setSeconds] = useState<number>(new Date().getSeconds());
  const [formate, setFormate] = useState<string>("AM");
  const [open, setOpen] = useState(false);

  const timeRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
    const regex = /(\d{1,2}):(\d{2})(?::(\d{2}))?/;
    const match = timeString.match(regex);

    if (match) {
      let hour = parseInt(match[1]);
      const minute = parseInt(match[2]);
      const second = match[3] ? parseInt(match[3]) : 0;

      let period = "AM";
      if (hour >= 12) {
        period = "PM";
        if (hour > 12) hour -= 12;
      }
      if (hour === 0) hour = 12;

      setHours(hour);
      setMinutes(minute);
      setSeconds(second);
      setFormate(period);
    }
  };

  useEffect(() => {
    extractTimeValues(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateTime = () => {
    const formattedHours =
      formate === "AM" && hours === 12
        ? "00"
        : formate === "AM"
        ? hours.toString().padStart(2, "0")
        : hours === 12
        ? "12"
        : (12 + hours).toString().padStart(2, "0");

    const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    onChange(formattedTime);
  };

  useEffect(() => {
    updateTime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hours, minutes, seconds, formate]);

  // ⏱️ Live seconds ticking logic
  useEffect(() => {
    if (open) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 59) {
            setMinutes((prevMinutes) => {
              if (prevMinutes === 59) {
                setHours((prevHours) => {
                  const nextHour = prevHours === 12 ? 1 : prevHours + 1;
                  if (prevHours === 11) {
                    setFormate((prevFormate) => (prevFormate === "AM" ? "PM" : "AM"));
                  }
                  return nextHour;
                });
                return 0;
              }
              return prevMinutes + 1;
            });
            return 0;
          }
          return prevSeconds + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [open]);

  return (
    <div ref={timeRef} id="customTimePicker" className="calendar-container w-full">
      <div onClick={() => setOpen(!open)} className="w-fit relative flex items-center">
        {children}
      </div>

      {open && (
        <div className="absolute z-10 mt-1">
          <div className="flex bg-white shadow-lg border rounded-lg overflow-hidden">
            {/* Hours */}
            <div className="time-section w-fit p-1 h-44 overflow-y-auto scrollbar-hidden px-1 border-r border-gray-300">
              {Array.from({ length: 13 }, (_, index) => (
                <div
                  key={`hour-${index}`}
                  className={`time-item p-2 text-center mt-1 cursor-pointer rounded-md hover:bg-blue-500 hover:text-white ${
                    hours === index ? "bg-blue-500 text-white" : ""
                  }`}
                  onClick={() => {
                    setOpen(false);
                    setHours(index);
                  }}
                >
                  {index.toString().padStart(2, "0")}
                </div>
              ))}
            </div>

            {/* Minutes */}
            <div className="time-section w-fit p-1 h-44 overflow-y-auto scrollbar-hidden px-1 border-r border-gray-300">
              {Array.from({ length: 60 }, (_, index) => (
                <div
                  key={`minute-${index}`}
                  className={`time-item p-2 text-center mt-1 cursor-pointer rounded-md hover:bg-blue-500 hover:text-white ${
                    minutes === index ? "bg-blue-500 text-white" : ""
                  }`}
                  onClick={() => {
                    setOpen(false);
                    setMinutes(index);
                  }}
                >
                  {index.toString().padStart(2, "0")}
                </div>
              ))}
            </div>

            {/* AM/PM */}
            <div className="time-section w-fit p-1 h-44 overflow-y-auto px-1 border-gray-300">
              {["AM", "PM"].map((data) => (
                <div
                  key={`formate-${data}`}
                  className={`time-item p-2 text-center mt-1 cursor-pointer rounded-md hover:bg-blue-500 hover:text-white ${
                    formate === data ? "bg-blue-500 text-white" : ""
                  }`}
                  onClick={() => {
                    setOpen(false);
                    setFormate(data);
                  }}
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

export default CustomTimeDoctor;
