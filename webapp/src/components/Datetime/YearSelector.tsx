import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaRegCalendarAlt } from "react-icons/fa";
import Button from "../Button/Button";

interface YearSelectProps {
  maxSelectableYears?: number;
  startYear?: number;
  endYear?: number;
}

export const YearSelector = ({
  maxSelectableYears = 1,
  startYear = new Date().getFullYear() - 20,
  endYear = new Date().getFullYear()
}: YearSelectProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const toggleYear = (year: number) => {
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter((y) => y !== year));
    } else if (selectedYears.length < maxSelectableYears) {
      setSelectedYears([...selectedYears, year]);
    }
  };

  const handleApply = () => {
    if (selectedYears.length === maxSelectableYears) {
      searchParams.set("Year", selectedYears.join(","));
      setSearchParams(searchParams);
      setShowPicker(false);
    }
  };

  const handleClear = () => {
    setSelectedYears([]);
    searchParams.delete("Year");
    setSearchParams(searchParams);
    setShowPicker(false);
  };

  useEffect(() => {
    const yearsParam = searchParams.get("Year");
    if (yearsParam) {
      const items = yearsParam
        .split(",")
        .map((y) => parseInt(y.trim(), 10))
        .filter((y) => !isNaN(y));
      setSelectedYears(items.slice(0, maxSelectableYears));
    }
  }, [searchParams, maxSelectableYears]);

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

  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

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
        {selectedYears.length === maxSelectableYears
          ? selectedYears.join(", ")
          : `Select ${maxSelectableYears} Year${maxSelectableYears > 1 ? "s" : ""}`}
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
          {/* Year Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
              maxHeight: "200px",
              overflowY: "auto"
            }}
          >
            {years.map((year) => {
              const selected = selectedYears.includes(year);
              return (
                <div
                  key={year}
                  onClick={() => toggleYear(year)}
                  style={{
                    padding: "8px",
                    backgroundColor: selected ? "#cce4ff" : "#f1f1f1",
                    border: selected ? "2px solid #007bff" : "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    userSelect: "none",
                    textAlign: "center"
                  }}
                >
                  {year}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="w-full flex items-center justify-between mt-3">
            <Button
              disabled={selectedYears.length !== maxSelectableYears}
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
