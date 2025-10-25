import { SyntheticEvent, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

import { IDropDown } from "@/components/DropDown/types";

const DropDown = ({ children, hr = true, heading, subheading, button, className,pClass, dropClass,childClass}: IDropDown) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div id="DropDown" className={`bg-white mb-2 rounded-xl shadow ${className}`}>
      <div
        className={`flex w-full ${dropClass} items-center px-6 py-4 cursor-pointer justify-between`}
        role="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <p className={`${pClass} text-sm font-semibold`}>
          {heading}
          {subheading && <span className="ml-1 font-medium opacity-90">{subheading}</span>}
        </p>
        <div className="flex gap-x-4 items-center">
          {isOpen && <div onClick={(e: SyntheticEvent) => e.stopPropagation()}>{button}</div>}
          <IoIosArrowDown
            className={`text-black h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>
      <div
        className={` transition-all duration-200 ${
          isOpen ? "max-h-full opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        {hr && <hr className="mb-6" />}
        <div className={`px-6 pb-6 ${childClass} `}>{children}</div>
      </div>
    </div>
  );
};

export default DropDown;
