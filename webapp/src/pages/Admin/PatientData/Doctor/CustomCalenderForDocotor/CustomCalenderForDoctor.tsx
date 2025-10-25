import { SyntheticEvent, useEffect, useState } from "react";

import "rc-calendar/assets/index.css";

import { CustomCalendarProps } from "@/components/CustomCalendar/types";
import { DateTime } from "@/components";

const CustomCalenderForDoctor = ({ onChange, value }: CustomCalendarProps) => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection"
    }
  ]);

  useEffect(() => {
    if (!value) return;
    const [startDate, endDate] = value.split("|");

    if (startDate && endDate) {
      setDateRange([
        {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          key: "selection"
        }
      ]);
    }
  }, [value]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelect = (ranges: any) => {
    // const { startDate, endDate } = ranges.selection;
    setDateRange([ranges.selection]);
  };

  const handleClick = (_e?: SyntheticEvent, _bool?: boolean, cancel?: boolean) => {
    const { startDate, endDate } = dateRange[0];
    if (cancel) {
      setDateRange([
        {
          startDate: new Date(),
          endDate: new Date(),
          key: "selection"
        }
      ]);
    } else {
      if (startDate && endDate) onChange(`${startDate.toISOString()}|${endDate.toISOString()}`);
    }
  };

  return (
    <div>
      <DateTime
        buttonDisable={!value}
        isopen={true}
        onClick={handleClick}
        ranges={dateRange}
        onChange={handleSelect}
      />
    </div>
  );
};

export default CustomCalenderForDoctor;
