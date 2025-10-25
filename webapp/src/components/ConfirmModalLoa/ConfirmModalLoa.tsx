import { SyntheticEvent } from "react";
import { Button, Modal } from "../index";

const ConfirmModalLoa = ({
  heading,
  subHeading,
  btnOneName,
  btnTwoName,
  btnTwoFunction,
  toggleOpen,
  isOpen
}: {
  heading: string;
  subHeading: string;
  btnOneName: string;
  btnTwoName: string;
  btnTwoFunction: (_e: SyntheticEvent) => void;
  toggleOpen: (_e: SyntheticEvent) => void;
  isOpen: boolean;
}) => {
  return (
    <Modal isOpen={isOpen}>
      <div className="w-[376px] px-6 py-5">
        <p className="text-[15px] font-bold mb-[11px]">{heading}</p>

        <p className="text-[13px] font-medium text-[#535353] mb-10">{subHeading}</p>

        <div className="w-full flex gap-x-5 items-center justify-center">
          <Button
            className="w-full! text-xs! border-gray-300! shadow-sm bg-[#F6F6F6]! font-semibold py-[10px] rounded-xl"
            variant="outlined"
            size="base"
            onClick={toggleOpen}
          >
            {btnOneName}
          </Button>

          <Button
            className="w-full! text-xs! font-semibold py-[10px] rounded-xl"
            type="submit"
            name="save"
            variant="contained"
            size="base"
            onClick={btnTwoFunction}
          >
            {btnTwoName}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModalLoa;
