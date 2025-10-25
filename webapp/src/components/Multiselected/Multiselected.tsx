import { useState, useRef, useEffect } from "react";
import { FaAngleDown, FaAngleUp, FaCheck } from "react-icons/fa";

interface ISelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: ISelectOption[];
  disable?: boolean;
  value: string[]; // array of selected values
  onChange?: (_values: string[]) => void;
  placeholder?: string;
  label?: string;
}

const Multiselected = ({
  options,
  value,
  disable,
  onChange,
  placeholder = "Select",
  label
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleOption = (val: string) => {
    if (disable) return;
    if (!onChange) return;
    if (!val.trim()) return;
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && (
        <label htmlFor={label} className="block mb-1.5 ml-0.5 text-sm font-medium">
          {label}
        </label>
      )}

      {/* Button */}
      <div className="relative">
        <div
          title={value.join(",")}
          className={` flex py-[24px] items-center h-[44px]  max-w-80 justify-between w-full border-2 rounded-[7px] border-gray-300 px-3 ${
            disable ? "cursor-not-allowed bg-[#F4F2F0]" : "cursor-pointer bg-transparent"
          }`}
          onClick={() => {
            if (disable) return;
            setIsOpen((prev) => !prev);
          }}
        >
          <span className="truncate max-w-60">
            {value.length > 0
              ? options
                  .filter((o) => value.includes(o.value))
                  .map((o) => o.label)
                  .join(", ")
              : placeholder}
          </span>
          {isOpen ? <FaAngleUp /> : <FaAngleDown />}
          {/* Dropdown */}
        </div>
        {isOpen && (
          <div className=" absolute top-[98%] left-0 z-10 mt-1 max-h-[200px] border rounded shadow w-full bg-white overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#FDF4E5] ${
                  value.includes(option.value) ? "bg-[#FDF4E5] font-semibold" : ""
                }`}
                onClick={() => toggleOption(option.value)}
              >
                <span>{option.label}</span>
                {value.includes(option.value) && <FaCheck className="text-gray-500" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Multiselected;
