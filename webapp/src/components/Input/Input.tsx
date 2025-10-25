import { ChangeEvent, memo, useEffect, useRef } from "react";
import classNames from "classnames";

import { InputInterface } from "@/components/Input/types";
import { colorVariants } from "@/components/Input/utils";

const Input = ({
  className,
  sublabel,
  containerClass,
  labelClassName,
  color = "primary",
  label,
  disabled,
  errors,
  onChange,
  maxLength,
  ...props
}: InputInterface) => {
  if (!color) throw new Error("color is required");
  if (!colorVariants[color]) throw new Error("No variant for this color");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const inputElement = inputRef.current;
    if (!inputElement) return;
    if (inputElement.type !== "number") return;

    const handleWheel = (e: WheelEvent) => {
      if (document.activeElement === inputRef.current) {
        e.preventDefault(); // Prevent scrolling from changing the number input value
      }
    };

    // Add the event listener with passive: false
    inputElement.addEventListener("wheel", handleWheel, { passive: false });

    // Cleanup the event listener on unmount
    return () => {
      inputElement.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;

    if (props.type === "number" && isNaN(Number(e.target.value))) {
      return;
    }

    onChange(e);
  };

  return (
    <div  className={classNames("w-full", containerClass)}>
      {label && (
        <label
          htmlFor={props.id}
          className={classNames(
            "block mb-1.5 ml-0.5 text-sm font-medium text-gray-600",
            labelClassName
          )}
        >
          {label}
          {props.required && <span>*</span>}
          <span className="text-gray-400 font-normal">{sublabel}</span>
        </label>
      )}

      <input
        autoComplete="off"
        ref={inputRef}

        disabled={disabled}
        className={`p-3 custom-autofill text-gray-900 rounded-sm ${
          disabled === true ? "bg-[#F4F2F0]!" : ""
        }  outline-0 border-2 border-gray-300 block w-full placeholder:text-gray-400  ${
          colorVariants[color]
        }
         ${className}`}
        onChange={handleChange}
        maxLength={maxLength ?? 75}
        {...props}
      />
      {errors && <p className="text-red-600">{errors}</p>}
    </div>
  );
};

export default memo(Input);
