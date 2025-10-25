import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import Button from "../Button/Button";
import calender from "@/assets/images/calender.svg";

// Short & full month names
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fullMonthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

interface MultiMonthSelectorProps {
  selectedMonths?: string[];
  onConfirm: (months: string[]) => void;
  onCancel?: () => void;
}

const MultiMonthSelector: React.FC<MultiMonthSelectorProps> = ({
  selectedMonths = [],
  onConfirm,
  onCancel
}) => {
  const [selected, setSelected] = useState<string[]>(selectedMonths);

  const toggleMonth = (year: number, monthIndex: number) => {
    const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleConfirm = () => {
    if (selected.length > 3) {
      toast.error("You can select up to 3 months only.");
      return;
    }
    onConfirm(selected);
  };

  return (
    <div className="p-4 bg-white shadow-xl rounded-md w-[400px] max-w-full z-50">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 max-h-[400px] overflow-auto">
        {years.map((year) => (
          <div key={year}>
            <h3 className="font-semibold text-xs mb-1">{year}</h3>
            <div className="grid grid-cols-4 gap-1">
              {months.map((month, index) => {
                const key = `${year}-${String(index + 1).padStart(2, "0")}`;
                const selectedClass = selected.includes(key)
                  ? "bg-blue-600 text-xs text-white border-blue-600"
                  : "bg-white text-xs hover:bg-gray-100 border-gray-300";

                return (
                  <button
                    key={key}
                    onClick={() => toggleMonth(year, index)}
                    className={`border px-2 py-1 rounded ${selectedClass}`}
                  >
                    {month}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={handleConfirm}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

const MultiMonthCalendarWrapper: React.FC = () => {
  const [show, setShow] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const handleConfirm = (months: string[]) => {
    setSearchParams((prev) => {
      prev.set("months", months.join(","));
      return prev;
    });
    setSelectedLabels(formatMonthLabels(months));
    setShow(false);
  };

  useEffect(() => {
    const fromURL = searchParams.get("months");
    if (fromURL) {
      const monthList = fromURL.split(",");
      setSelectedLabels(formatMonthLabels(monthList));
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShow(false);
      }
    };
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show]);

  const formatMonthLabels = (keys: string[]) => {
    return keys.map((key) => {
      const [year, month] = key.split("-");
      return `${fullMonthNames[parseInt(month, 10) - 1]} ${year}`;
    });
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <Button
        onClick={() => setShow(!show)}
        variant="outlined"
        size="base"
        className="flex bg-white text-xs py-3! rounded-lg text-[#505050] gap-1"
      >
        <img src={calender} alt="calendar" />
        {selectedLabels.length > 0 ? selectedLabels.join(", ") : "Select Months"}
      </Button>

      {show && (
        <div className="absolute right-0 z-50 mt-2">
          <MultiMonthSelector
            selectedMonths={searchParams.get("months")?.split(",") || []}
            onConfirm={handleConfirm}
            onCancel={() => setShow(false)}
          />
        </div>
      )}
    </div>
  );
};

export default MultiMonthCalendarWrapper;
