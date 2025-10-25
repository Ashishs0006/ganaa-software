// DeviceContext.tsx
import React from "react";

export const DeviceContext = React.createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>]
>([false, () => {}]);
