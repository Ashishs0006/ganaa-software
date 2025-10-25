import { useEffect, useRef, useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

export interface ISelectOption {
  label: string;
  value: string;
}

interface SingleSelectDropdownProps {
  options: ISelectOption[];
  selectedValue: string;
  onChange: (_selected: string) => void;
  placeholder?: string;
  className?: string;
  menuClassName?: string;
}

const SingleSelect = ({
  options,
  selectedValue = "All",
  onChange,
  placeholder = "All",
  className = "",
  menuClassName = ""
}: SingleSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((opt) => opt.value === selectedValue)?.label;

  const handleSelect = (value: string) => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block text-left min-w-[100px] max-w-[230px] ${className}`}
    >
      <div
        onClick={() => {
          if (options.length > 1) {
            setIsOpen(!isOpen);
          }
        }}
        className={`border px-2 py-2 flex items-center ${
          options.length > 1 ? "cursor-pointer" : "cursor-not-allowed"
        } justify-between rounded-lg text-xs font-bold  bg-white whitespace-nowrap overflow-hidden text-ellipsis`}
        title={selectedLabel || placeholder}
      >
        {selectedLabel || placeholder}
        {isOpen ? <FaAngleUp /> : <FaAngleDown />}
      </div>

      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md w-full z-50 ${menuClassName}`}
        >
          <ul className="py-2 flex flex-col justify-center max-h-60 overflow-y-auto">
            {options.map((option, index) => {
              const selected = option.value === selectedValue;
              return (
                <li
                  key={index}
                  onClick={() => handleSelect(option.value)}
                  className={`p-2 px-4 text-xs font-medium cursor-pointer ${
                    selected ? "bg-[#F8E2BF]" : "hover:bg-[#FDF4E5]"
                  }`}
                >
                  {option.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SingleSelect;
