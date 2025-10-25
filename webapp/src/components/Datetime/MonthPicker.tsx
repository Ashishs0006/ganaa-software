import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaRegCalendarAlt } from "react-icons/fa";
import Button from "../Button/Button";

const monthsList = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

interface MonthSelectProps {
  maxSelectableMonths?: number;
}

export const MonthSelect = ({ maxSelectableMonths = 3 }: MonthSelectProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const pickerRef = useRef<HTMLDivElement>(null); // << Ref for picker

  const toggleMonth = (monthIndex: number) => {
    const monthLabel = `${monthsList[monthIndex]} ${year}`;
    if (selectedMonths.includes(monthLabel)) {
      setSelectedMonths(selectedMonths.filter((m) => m !== monthLabel));
    } else if (selectedMonths.length < maxSelectableMonths) {
      setSelectedMonths([...selectedMonths, monthLabel]);
    }
  };

  const handleApply = () => {
    if (selectedMonths.length === maxSelectableMonths) {
      searchParams.set("months", selectedMonths.join(","));
      setSearchParams(searchParams);
      setShowPicker(false);
    }
  };

  const handleClear = () => {
    setSelectedMonths([]);
    searchParams.delete("months");
    setSearchParams(searchParams);
    setShowPicker(false);
  };

  useEffect(() => {
    const monthsParam = searchParams.get("months");
    if (monthsParam) {
      const items = monthsParam.split(",").map((m) => m.trim());
      setSelectedMonths(items.slice(0, maxSelectableMonths));
    }
  }, [searchParams, maxSelectableMonths]);

  // ⛔ Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  return (
    <div style={{ position: "relative", display: "inline-block" }} ref={pickerRef}>
      <button
        onClick={() => setShowPicker((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 12px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          backgroundColor: "#f3f3f3",
          cursor: "pointer"
        }}
      >
        <FaRegCalendarAlt style={{ marginRight: "8px" }} />
        {selectedMonths.length === maxSelectableMonths
          ? selectedMonths.join(", ")
          : `Select ${maxSelectableMonths} Month${maxSelectableMonths > 1 ? "s" : ""}`}
      </button>

      {showPicker && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            right: 10,
            zIndex: 100,
            backgroundColor: "#fff",
            padding: "16px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            width: "340px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.15)"
          }}
        >
          {/* Year Navigation */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
              alignItems: "center"
            }}
          >
            <button onClick={() => setYear((y) => y - 1)}>&lt;</button>
            <strong>{year}</strong>
            <button onClick={() => setYear((y) => y + 1)}>&gt;</button>
          </div>

          {/* Month Grid */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {monthsList.map((month, i) => {
              const label = `${month} ${year}`;
              const selected = selectedMonths.includes(label);
              return (
                <div
                  key={label}
                  onClick={() => toggleMonth(i)}
                  style={{
                    padding: "8px",
                    backgroundColor: selected ? "#cce4ff" : "#f1f1f1",
                    border: selected ? "2px solid #007bff" : "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    userSelect: "none"
                  }}
                >
                  {month}
                </div>
              );
            })}
          </div>

          {/* Buttons */}
          <div className="w-full flex items-center justify-between mt-3">
            <Button
              disabled={selectedMonths.length !== maxSelectableMonths}
              onClick={handleApply}
              variant="contained"
              color="primary"
              size="base"
            >
              Apply
            </Button>
            <Button onClick={handleClear} variant="filled" color="gray" size="base">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
