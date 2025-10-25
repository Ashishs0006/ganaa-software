import { DateTime } from "@/components";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const DateRange = ({ children, minDate }: { children: React.ReactNode; minDate?: Date }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection"
    }
  ]);

  const updateQueryParams = (startDate: Date, endDate: Date) => {
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Convert to ISO format with time reset to midnight
    searchParams.set("startDate", startOfDay.toISOString());
    searchParams.set("endDate", endOfDay.toISOString());

    // Update the URL query params
    setSearchParams(searchParams);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelect = (ranges: any) => {
    // const { startDate, endDate } = ranges.selection;
    setDateRange([ranges.selection]);
  };

  useEffect(() => {
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (startDate && endDate) {
      setDateRange([
        {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          key: "selection"
        }
      ]);
    }
  }, [searchParams]);

  const handleClick = (_e?: SyntheticEvent, _bool?: boolean, cancel?: boolean) => {
    const { startDate, endDate } = dateRange[0];
    if (cancel) {
      searchParams.delete("startDate");
      searchParams.delete("endDate");
      setSearchParams(searchParams);
      setDateRange([
        {
          startDate: new Date(),
          endDate: new Date(),
          key: "selection"
        }
      ]);
    } else {
      if (startDate && endDate) updateQueryParams(startDate, endDate);
    }
  };

  return (
    <div>
      <DateTime
        buttonDisable={!searchParams.get("startDate") || !searchParams.get("endDate")}
        onClick={handleClick}
        ranges={dateRange}
        minDate={minDate} // Example min date, adjust as needed
        onChange={handleSelect}
        maxDate={new Date()}
        children={children}
      />
    </div>
  );
};

export default DateRange;
