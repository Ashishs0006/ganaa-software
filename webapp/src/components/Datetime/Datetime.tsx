import { MouseEvent, SyntheticEvent, useEffect, useRef, useState } from "react";
import { DateRangePicker } from "react-date-range";

import { DateInterface, DateTimeInterface } from "@/components/Datetime/types";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import { Button } from "@/components";

const DateTime = ({
  ranges,
  onChange,
  onClick,
  children,
  isopen,
  minDate,
  maxDate,
  buttonDisable
}: DateTimeInterface) => {
  const [open, setOpen] = useState<boolean>(false);

  const [horizontalPosition, setHorizontalPosition] = useState<"left" | "right">("left");
  const [position, setPosition] = useState<"top" | "bottom">("bottom");

  const [_date, setDate] = useState<DateInterface>({
    startDate: undefined,
    endDate: undefined
  });

  const calenderRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: MouseEvent<Document>) => {
    if (
      calenderRef.current &&
      !calenderRef.current.contains(event.target as Node) &&
      triggerRef.current &&
      !triggerRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
    };
  }, []);

  useEffect(() => {
    if (isopen !== undefined) setOpen(isopen);
    if (!ranges) return;

    const startDate = ranges[0].startDate;
    const endDate = ranges[0].endDate;
    setDate((prev) => ({ ...prev, startDate, endDate }));
  }, [ranges, isopen]);

  // Detect available space and adjust position
  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = window.innerWidth - rect.left;
      const spaceLeft = rect.right;

      // Vertical position
      if (spaceBelow < 300 && spaceAbove > spaceBelow) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }

      // Horizontal position
      if (spaceRight < 350 && spaceLeft > spaceRight) {
        setHorizontalPosition("right");
      } else {
        setHorizontalPosition("left");
      }
    }
  }, [open]);

  const handleClick = (_e: SyntheticEvent) => {
    setOpen(!open);
  };

  return (
    <div className="relative w-fit  cursor-pointer" ref={calenderRef}>
      <div onClick={handleClick} ref={triggerRef}>
        {children}
      </div>
      {open && (
        <Picker
          ranges={ranges}
          onChange={onChange}
          buttonDisable={buttonDisable}
          onClick={onClick}
          maxDate={maxDate}
          minDate={minDate}
          position={position}
          setOpen={setOpen}
          horizontalPosition={horizontalPosition}
        />
      )}
    </div>
  );
};

export default DateTime;

const Picker = ({
  ranges,
  onChange,
  minDate,
  maxDate,
  buttonDisable,
  onClick,
  setOpen,
  position,
  horizontalPosition
}: DateTimeInterface & { position: "top" | "bottom" }) => {
  function handleClickCloseListener() {
    if (buttonDisable) return;
    if (!onClick) return;
    onClick(undefined, false, true);
    if (!setOpen) return;
    setOpen(false);
  }

  function handleConfirmCloseListener(e: SyntheticEvent) {
    if (!onClick) return;
    onClick(e, false, false);
    if (!setOpen) return;
    setOpen(false);
  }

  return (
    <div
      className={`absolute  mt-2 
           ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"}
    ${horizontalPosition === "right" ? "right-0" : "left-0"} shadow-lg z-50 bg-white`}
    >
      {/* <DateRangePicker ranges={ranges} onChange={onChange} maxDate={maxDate} /> */}
      <DateRangePicker minDate={minDate} maxDate={maxDate} ranges={ranges} onChange={onChange} />

      <div className="action-btns flex items-center justify-end gap-2 pb-2 pr-2">
        <Button
          variant="filled"
          id="test"
          color="gray"
          className={`${buttonDisable ? "opacity-50! cursor-not-allowed!" : ""}`}
          size="base"
          onClick={handleClickCloseListener}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          id="sdf"
          color="primary"
          size="base"
          onClick={handleConfirmCloseListener}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
};
