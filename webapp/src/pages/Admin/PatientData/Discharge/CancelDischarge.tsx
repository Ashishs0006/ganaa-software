import { Button, Modal } from "@/components";
// import icons8 from "@/assets/images/icons8-check-48.png";
import { SyntheticEvent } from "react";

export interface CancelDischargeProps {
  handleClickCancelDischarge: (_e: SyntheticEvent) => void;
  open: boolean;
  type: string;
  toggleOpen: () => void;
}

const CancelDischarge = ({
  handleClickCancelDischarge,
  open,
  type,
  toggleOpen
}: CancelDischargeProps) => {
  return (
    <Modal isOpen={open}>
      <div className="w-[376px] px-6 py-5">
        <p className="text-[15px] font-bold mb-[11px]">Are you sure?</p>

        {type === "submit" ? (
          <div className="mb-10">
            <p className="text-[13px] font-medium text-[#535353]">
              Are you sure you want to discharge this patient? This action cannot be undone
            </p>
            <p className="text-[15px] font-bold my-1">Check list</p>

            <div className="space-y-3 flex flex-col text-sm text-[#535353] font-normal">
              {[
                "Room charges",
                "Lab charges",
                "In-house pharmacy medicine",
                // "Scan Lab Charges",
                "Outside medicines",
                "A la carte charges",
                "Referral doctor visit charges",
                "Other speciality doctor visit charges",
                // "Music Therapy charges",
                "Physiotherapy charges",
                "Psychological test charges",
                "Other personal expenses",
                "Admission time checklist was complete"
              ].map((item, index) => (
                <p key={index} className="flex items-start gap-2">
                  <span className="">{index + 1}</span>
                  {/* <img
                    src="/assets/checkmark.png"
                    alt="tick"
                    className="w-4 h-4 mt-[3px]"
                    loading="lazy"
                  /> */}
                  <span className="font-medium">{item}</span>
                </p>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-[13px] font-medium text-[#535353] mb-10">
            Are you sure you want to cancel discharge ? This action cannot be undone
          </p>
        )}

        <div className="w-full flex gap-x-5 items-center justify-center">
          <Button
            className="w-full! text-xs! border-gray-300! shadow-sm bg-[#F6F6F6]! font-semibold py-[10px] rounded-xl"
            variant="outlined"
            size="base"
            onClick={toggleOpen}
          >
            No
          </Button>

          {type === "submit" ? (
            <Button
              className="w-full! text-xs! font-semibold py-[10px] rounded-xl"
              type="submit"
              name="save"
              variant="contained"
              size="base"
              onClick={handleClickCancelDischarge}
            >
              Yes, Discharge
            </Button>
          ) : (
            <Button
              className="w-full! text-xs! font-semibold py-[10px] rounded-xl"
              type="submit"
              name="save"
              variant="contained"
              size="base"
              onClick={handleClickCancelDischarge}
            >
              Yes, Cancel
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CancelDischarge;
