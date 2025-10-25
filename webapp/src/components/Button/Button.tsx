import { memo, useMemo } from "react";

import classNames from "classnames";

import { ButtonInterface } from "@/components/Button/types";
import { colorVariants, sizeVariants } from "@/components/Button/utils";

const Button = ({
  children,
  className,
  variant = "default",
  color = "primary",
  size = "base",
  disabled,
  ...props
}: ButtonInterface) => {
  if (!variant) throw new Error("variant is required");
  if (!color) throw new Error("color is required");
  if (!size) throw new Error("size is required");

  if (!colorVariants[variant][color]) throw new Error("No variant for this color");
  if (!sizeVariants[size]) throw new Error("No variant for this size");

  color = useMemo(() => {
    if (disabled) return "disabled";
    return color;
  }, [disabled, color]);

  return (
    <button
      className={classNames(
        "flex items-center justify-center gap-2  cursor-pointer font-semibold rounded-lg whitespace-nowrap transition-all",
        colorVariants[variant][color],
        sizeVariants[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default memo(Button);
