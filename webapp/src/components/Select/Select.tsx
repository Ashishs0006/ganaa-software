import { useState, useRef, useEffect } from "react";
import { FaAngleDown, FaAngleUp, FaCheck, FaSearch } from "react-icons/fa";

import classNames from "classnames";

import { ISelectOption, SearchMedicinesProps } from "@/components/Select/types";

const Select = ({
  containerClass,
  className,
  required,
  optionClassName,
  subLabelClassName,
  label,
  short,
  disable = false,
  placeholder = "Select",
  onChange,
  value,
  labelClassName,
  name,
  errors,
  options = [],
  apiCall = false,
  fetchOptions
}: SearchMedicinesProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredOptions, setFilteredOptions] = useState<ISelectOption[]>(options);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (apiCall && fetchOptions) {
      if (searchTerm.length < 3 && searchTerm.length !== 0) {
        setFilteredOptions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const delay = setTimeout(async () => {
        try {
          const result = await fetchOptions(searchTerm);
          setFilteredOptions(result);
        } catch (err) {
          console.error("Error fetching options:", err);
          setError("Failed to fetch options");
        } finally {
          setLoading(false);
        }
      }, 500); // Debounce delay of 500ms

      return () => clearTimeout(delay);
    } else {
      setFilteredOptions(
        options.filter((option) =>
          option.label?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, apiCall, fetchOptions, options]);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option: ISelectOption) => {
    setIsOpen(false);
    setSearchTerm("");
    if (onChange) onChange(name, option);
  };

  return (
    <div
      id="select"
      className={`flex  ${
        disable ? "cursor-not-allowed" : "cursor-pointer"
      } flex-col w-full  ${containerClass} items-start justify-start`}
      ref={dropdownRef}
    >
      {label && (
        <label
          className={`${labelClassName} block mb-1.5 ml-0.5 text-sm font-medium`}
          htmlFor={label}
        >
          {label}
          {required && <span>*</span>}
        </label>
      )}
      <div className="relative text-nowrap whitespace-nowrap w-full inline-block">
        {/* Dropdown button */}
        <div
          title={Array.isArray(value) ? "" : value?.label?.toString()}
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setIsOpen((prev) => !prev);
          }}
          tabIndex={0}
          className={classNames(
            `w-full max-w-80 h-[44px] px-2  py-[24px] text-nowrap whitespace-nowrap justify-between flex ${
              !Array.isArray(value) && value?.value
                ? "font-bold text-black"
                : "font-normal text-gray-400"
            } items-center text-md text-left ${
              !disable ? "bg-transparent " : "bg-[#F4F2F0]! border-[#DEDEDE]!"
            } bg-transparent border-2  border-gray-300 rounded-[7px]  ${
              isOpen && !disable
                ? "border-black! outline-black! focus:ring-black! focus:border-black!"
                : "border-gray-300 outline-black!"
            }`,
            className
          )}
        >
          <div className="truncate max-w-60">
            {short
              ? !Array.isArray(value) && value?.value
                ? value?.label?.toString().split("(")[1]?.split(")")[0]
                : placeholder
              : !Array.isArray(value) && value?.value
              ? value?.label
              : placeholder}
          </div>
          {isOpen && !disable ? <FaAngleUp /> : <FaAngleDown />}
        </div>

        {/* Dropdown menu */}
        {isOpen && !disable && (
          <div
            className={classNames(
              "absolute top-[98%] z-10 w-full  mt-1 max-h-[200px]  overflow-y-auto bg-white border rounded-sm overflow-hidden border-gray-300 shadow-lg",
              optionClassName
            )}
          >
            {/* Search input */}
            {(options.length > 15 || apiCall) && (
              <div className="flex items-center px-3 py-2">
                <input
                  type="text"
                  autoComplete="off"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full p-2 text-sm border-none focus:border-none focus:outline-none bg-transparent"
                />
                <FaSearch className="text-gray-400 mr-2" />
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-2">
                <span className="text-gray-500 text-sm">Loading...</span>
              </div>
            ) : error ? (
              <div className="text-center text-sm text-red-500 py-2">{error}</div>
            ) : filteredOptions.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-2">No options found</div>
            ) : (
              filteredOptions.map((option, index) => (
                <div title={option?.label?.toString()} key={index}>
                  <div
                    className={`hover:bg-[#FDF4E5] flex items-center justify-between text-sm font-normal ${
                      !Array.isArray(value) && value?.value === option?.value
                        ? "bg-[#FDF4E5] font-semibold"
                        : null
                    } px-4 py-2 cursor-pointer`}
                    onClick={() => handleSelect(option)}
                  >
                    <div className="flex items-center gap-2">
                      <div>{option.label}</div>
                      <div className={`${subLabelClassName} `}>{option.subLabel}</div>
                    </div>
                    {!Array.isArray(value) && value?.value === option?.value && (
                      <FaCheck className="font-normal text-sm text-gray-400" />
                    )}
                  </div>
                  <hr />
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {errors && <p className="text-red-600">{errors}</p>}
    </div>
  );
};

export default Select;
