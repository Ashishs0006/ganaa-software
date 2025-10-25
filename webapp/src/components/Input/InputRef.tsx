import { ChangeEvent, forwardRef, useEffect, useRef } from "react";
import classNames from "classnames";
import { InputInterface } from "@/components/Input/types";
import { colorVariants } from "@/components/Input/utils";

const InputRef = forwardRef<HTMLInputElement, InputInterface>(
  (
    {
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
    },
    ref
  ) => {
    if (!color) throw new Error("color is required");
    if (!colorVariants[color]) throw new Error("No variant for this color");

    const internalRef = useRef<HTMLInputElement>(null);
    const combinedRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef;

    useEffect(() => {
      const inputElement = combinedRef.current;
      if (!inputElement) return;
      if (inputElement.type !== "number") return;

      const handleWheel = (e: WheelEvent) => {
        if (document.activeElement === inputElement) {
          e.preventDefault();
        }
      };

      inputElement.addEventListener("wheel", handleWheel, { passive: false });

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
      <div className={classNames("w-full", containerClass)}>
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
          ref={combinedRef}
          disabled={disabled}
          className={`p-3 text-gray-900 rounded-sm ${
            disabled === true ? "bg-[#F4F2F0]!" : ""
          } outline-0 border-2 border-gray-300 block w-full placeholder:text-gray-400  ${
            colorVariants[color]
          } ${className}`}
          onChange={handleChange}
          maxLength={maxLength ?? 75}
          {...props}
        />
        {errors && <p className="text-red-600">{errors}</p>}
      </div>
    );
  }
);

export default InputRef;
