import { useEffect, useRef, useState } from "react";
import { IoIosArrowForward } from "react-icons/io";

interface DropdownItem {
  name: string;
  subMenu?: string[];
}

interface MultiSelectDropdownProps {
  options: DropdownItem[];
  selectedValues: { sessionType: string; subSessionType?: string }[];
  onChange: (_selected: { sessionType: string; subSessionType?: string }[]) => void;
  placeholder?: string;
  className?: string;
  menuClassName?: string;
}

const MultiSelectDropdown = ({
  options,
  selectedValues,
  onChange,
  placeholder = "Select",
  className = "",
  menuClassName = ""
}: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSelected = (item: { sessionType: string; subSessionType?: string }) =>
    selectedValues.some(
      (v) =>
        v.sessionType === item.sessionType &&
        (v.subSessionType || "") === (item.subSessionType || "")
    );
  const handleItemToggle = (item: { sessionType: string; subSessionType?: string }) => {
    const isAssessment = item.sessionType === "A - Assessment";
    const selected = isSelected(item);

    let updated: typeof selectedValues = [];

    if (selected) {
      // Remove if already selected
      updated = selectedValues.filter(
        (v) =>
          !(
            v.sessionType === item.sessionType &&
            (v.subSessionType || "") === (item.subSessionType || "")
          )
      );
    } else {
      if (item.subSessionType) {
        if (isAssessment) {
          // Remove other submenus of Assessment, add new one
          updated = [...selectedValues.filter((v) => v.sessionType !== "A - Assessment"), item];
        } else {
          // Add normally
          updated = [...selectedValues, item];
        }
      } else {
        updated = [...selectedValues, item];
      }
    }

    onChange(updated.filter((v) => v.sessionType && v.sessionType.trim()));
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left w-[230px] ${className}`}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="border px-4 py-2 rounded-sm cursor-pointer bg-white whitespace-nowrap overflow-hidden text-ellipsis"
        title={
          selectedValues.length > 0
            ? selectedValues
                .filter((v) => v.sessionType && v.sessionType.trim())
                .map((v) =>
                  v.subSessionType ? `${v.sessionType} - ${v.subSessionType}` : v.sessionType
                )
                .join(", ")
            : placeholder
        }
      >
        {selectedValues.length > 0
          ? selectedValues
              .filter((v) => v.sessionType && v.sessionType.trim()) // ⛔️ filter out invalid ones
              .map((v) =>
                v.subSessionType ? `${v.sessionType} - ${v.subSessionType}` : v.sessionType
              )
              .join(", ")
          : placeholder}
      </div>

      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md w-full z-10 ${menuClassName}`}
        >
          <ul className="py-2 flex flex-col justify-center">
            {options.map((value, index) => {
              const isMainSelected = selectedValues.some(
                (v) => v.sessionType === value.name && !v.subSessionType
              );
              const hasSelectedSubSession = selectedValues.some(
                (v) => v.sessionType === value.name && !!v.subSessionType
              );

              return (
                <div className="group relative border-b w-full cursor-pointer bg-white" key={index}>
                  <li
                    className={`p-3 w-full flex items-center justify-between text-wrap text-sm font-semibold ${
                      isMainSelected || hasSelectedSubSession
                        ? "bg-[#F8E2BF]"
                        : "hover:bg-[#FDF4E5]"
                    }`}
                    onClick={() =>
                      value.subMenu?.length ? null : handleItemToggle({ sessionType: value.name })
                    }
                  >
                    {value.name}
                    {value.subMenu && value.subMenu.length > 0 && <IoIosArrowForward />}
                  </li>

                  {value.subMenu && value.subMenu.length > 0 && (
                    <ul
                      className={`py-2 group-hover:flex absolute left-full border ${
                        options.length - 1 > index + 2 ? "top-0" : "bottom-0"
                      } hidden flex-col justify-center bg-white shadow rounded`}
                    >
                      {value.subMenu.map((sub, idx) => {
                        const isSubSelected = isSelected({
                          sessionType: value.name,
                          subSessionType: sub
                        });

                        return (
                          <div
                            key={idx}
                            onClick={() =>
                              handleItemToggle({
                                sessionType: value.name,
                                subSessionType: sub
                              })
                            }
                            className={`px-4 py-2 border-b text-sm font-medium ${
                              isSubSelected ? "bg-[#F8E2BF]" : "hover:bg-[#FDF4E5]"
                            }`}
                          >
                            {sub}
                          </div>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
