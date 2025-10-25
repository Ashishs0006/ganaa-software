export const colorVariants = {
  default: {
    primary: "hover:bg-primary-light",
    red: "hover:bg-red-100",
    blue: "hover:bg-blue-100",
    green: "hover:bg-green-50",
    gray: "hover:bg-gray-50",
    black: "hover:bg-gray-100",
    white: "bg-white",
    disabled: "bg-black text-gray-600 grayscale"
  },
  contained: {
    primary: "bg-primary-dark text-white",
    red: "bg-red-600 text-white",
    blue: "bg-blue-600 text-white",
    green: "bg-green-600",
    gray: "bg-gray-200",
    black: "bg-black text-gray-50",
    white: "bg-white text-gray-900",
    disabled: "bg-gray-200 text-gray-600 grayscale"
  },
  outlined: {
    primary: "border-2 border-primary-dark text-primary-dark bg-transparents",
    red: "border-2 border-red-600 bg-transparents text-red-600",
    blue: "border-2 border-blue-600 bg-transparents text-blue-600",
    green: "border-2 border-green-600 bg-transparents",
    gray: "border-2 border-gray-200 text-white bg-transparents",
    black: "border-2 border-gray-700 bg-transparents",
    white: "border-2 border-white bg-transparents",
    disabled: "bg-gray-200 text-gray-600 grayscale"
  },
  filled: {
    primary: "bg-primary text-primary-dark",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    gray: "bg-gray-200 text-gray-600",
    black: "bg-gray-100 text-gray-700",
    white: "bg-white text-gray-900",
    disabled: "bg-gray-200 text-gray-600 grayscale"
  }
};

export const sizeVariants = {
  base: "px-4 py-2.5 text-base",
  md: "px-6 py-3 text-base"
};
