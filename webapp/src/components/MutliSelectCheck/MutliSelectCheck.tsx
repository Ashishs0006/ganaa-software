import { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import { FaAngleDown, FaAngleUp, FaSearch } from "react-icons/fa";
import { ISelectOption, SelectProps } from "@/components/Select/types";
import Input from "../Input/Input";

interface IMultiSelectOption extends ISelectOption {
  checked: boolean;
}
interface ISearchMedicinesProps extends SelectProps {
  apiCall?: boolean; // Enable API call
  fetchOptions?: (_query: string) => Promise<IMultiSelectOption[]>; // API function
}

const MutliSelectCheck = ({
  containerClass,
  className,
  optionClassName,
  label,
  short,
  disable = false,
  placeholder = "Select",
  onChange,
  value,
  name,
  apiCall = false,
  fetchOptions
}: ISearchMedicinesProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredOptions, setFilteredOptions] = useState<IMultiSelectOption[]>([]);
  const [checkedOptions, setCheckedOptions] = useState<Array<string | number>>([]);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!Array.isArray(value)) return;
    setCheckedOptions((prev) => [...new Set(value.map((v) => v.value).concat(prev))]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (apiCall && fetchOptions) {
      if (searchTerm.length < 3 && searchTerm.length !== 0) {
        setFilteredOptions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const timeout = setTimeout(async () => {
        try {
          const result = await fetchOptions(searchTerm);
          const formattedData = result
            .map((ele) => {
              if (checkedOptions.includes(ele.value)) ele.checked = true;
              else ele.checked = false;
              return ele;
            })
            .sort((a, b) => {
              if (a.checked !== b.checked) {
                return a.checked ? -1 : 1; // Move checked items to the top
              }

              const labelA: string = a.label.toString();
              const labelB: string = b.label.toString();
              return labelA.localeCompare(labelB); // Sort alphabetically
            });
          setFilteredOptions(formattedData);
        } catch (err) {
          console.error("Error fetching options:", err);
          setError("Failed to fetch options");
        } finally {
          setLoading(false);
        }
      }, 500);

      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    const values = Array.isArray(value) ? [...new Set(value.map((v) => v.value))] : [];

    setFilteredOptions((prev) => {
      return prev
        .map((ele) => {
          if (checkedOptions.includes(ele.value)) ele.checked = true;
          else if (values.includes(ele.value)) ele.checked = true;
          else ele.checked = false;
          return ele;
        })
        .sort((a, b) => {
          if (a.checked !== b.checked) {
            return a.checked ? -1 : 1; // Move checked items to the top
          }

          const labelA: string = a.label.toString();
          const labelB: string = b.label.toString();
          return labelA.localeCompare(labelB); // Sort alphabetically
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
    if (onChange) onChange(name, option);
    setCheckedOptions((prev) => {
      const optionsSet = new Set([...prev]);

      if (optionsSet.has(option.value)) {
        optionsSet.delete(option.value);
        return [...optionsSet];
      }

      optionsSet.add(option.value);
      return [...optionsSet];
    });

    setFilteredOptions((prev) =>
      prev.map((item) => {
        if (item.value === option.value) {
          return { ...item, checked: !item.checked };
        }
        return item;
      })
    );
  };

  return (
    <div
      id="select"
      className={classNames(
        "flex cursor-pointer flex-col w-full items-start justify-start",
        containerClass
      )}
      ref={dropdownRef}
    >
      {label && (
        <label className="block mb-1.5 ml-0.5 text-sm font-medium" htmlFor={label}>
          {label}
        </label>
      )}
      <div className="relative text-nowrap whitespace-nowrap w-full inline-block">
        {/* Dropdown button */}
        <div
          onClick={() => setIsOpen(true)}
          title={
            short
              ? !Array.isArray(value) && value.value
                ? value?.label?.toString().split("(")[1]?.split(")")[0]?.toString() || undefined
                : (Array.isArray(value) &&
                    value
                      .map((item) => item.label)
                      .join(", ")
                      .toString()) ||
                  undefined
              : !Array.isArray(value) && value.value
              ? value?.label?.toString() || placeholder
              : (Array.isArray(value) &&
                  value
                    .map((item) => item.label)
                    .join(", ")
                    .toString()) ||
                placeholder
          }
          tabIndex={0}
          className={classNames(
            `w-full h-[44px] px-2  py-[24px] text-nowrap whitespace-nowrap justify-between flex ${
              !Array.isArray(value) && value.value
                ? "font-bold text-black"
                : "font-normal text-gray-400"
            } items-center text-md text-left ${
              !disable ? "bg-transparent " : "bg-[#F4F2F0]! border-[#DEDEDE]!"
            } bg-transparent border-2  border-gray-300 rounded-[7px] focus:ring-black focus:border-black ${
              isOpen ? "border-black" : ""
            }`,
            className
          )}
        >
          <FaSearch className="text-gray-400 mr-2" />

          <input
            type="text"
            readOnly={!isOpen} // instead of disabled
            onFocus={() => setIsOpen(true)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              short
                ? !Array.isArray(value) && value.value
                  ? value?.label?.toString().split("(")[1]?.split(")")[0]?.toString() || undefined
                  : (Array.isArray(value) &&
                      value
                        .map((item) => item.label)
                        .join(", ")
                        .toString()) ||
                    undefined
                : !Array.isArray(value) && value.value
                ? value?.label?.toString() || placeholder
                : (Array.isArray(value) &&
                    value
                      .map((item) => item.label)
                      .join(", ")
                      .toString()) ||
                  placeholder
            }
            className="w-full p-2 text-sm border-none focus:outline-none placeholder:text-gray-600! bg-transparent"
          />
          {isOpen && !disable ? (
            <FaAngleUp
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation();
                  setIsOpen(false);
                }
              }}
            />
          ) : (
            <FaAngleDown
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation();
                  setIsOpen(true);
                }
              }}
            />
          )}
        </div>

        {/* Dropdown menu */}
        {isOpen && !disable && (
          <div
            className={classNames(
              "absolute top-[98%] z-10 w-full mt-1 max-h-[200px] overflow-y-auto bg-white border rounded-sm overflow-hidden border-gray-300 shadow-lg",
              optionClassName
            )}
          >
            {loading ? (
              <div className="flex justify-center items-center py-2">
                <span className="text-gray-500 text-sm">Loading...</span>
              </div>
            ) : error ? (
              <div className="text-center text-sm text-red-500 py-2">{error}</div>
            ) : filteredOptions.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-2">No options found</div>
            ) : (
              filteredOptions.map((option, index) => {
                return (
                  <div title={option?.label?.toString()} key={index}>
                    <div
                      className={` flex items-center justify-between text-sm font-normal  px-4 py-2 cursor-pointer`}
                    >
                      <div className="flex w-fit items-center justify-start gap-2">
                        <Input
                          type="checkbox"
                          name={name}
                          checked={option.checked}
                          id={option.value.toString()}
                          className="accent-[#323E2A] w-4! h-4!"
                          onChange={() => handleSelect(option)}
                        />
                        <label
                          htmlFor={option.value.toString()}
                          className="whitespace-nowrap text-[13px] font-medium"
                        >
                          {option.label?.toString()}
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MutliSelectCheck;
