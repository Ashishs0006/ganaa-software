import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { setDiscardModal, setStepper } from "@/redux/slice/stepperSlice";
import { RootState } from "@/redux/store/store";

import { Button, Modal } from "@/components";
import { DiscardModalProps } from "@/components/DiscardModal/types";
import { RBACGuard } from "../RBACGuard/RBACGuard";

const DiscardModal = ({ handleClickSaveAndContinue, resource, action }: DiscardModalProps) => {
  const stepperData = useSelector((store: RootState) => store.stepper);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleDiscard = () => {
    const discardLocation = stepperData.discardModal.discartLocation;

    dispatch(setDiscardModal({ isFormChanged: false, isDiscardModalOpen: false }));

    setTimeout(() => {
      if (stepperData.discardModal.type === "step") {
        dispatch(setStepper({ step: stepperData.discardModal.step, tab: stepperData.stepper.tab }));
      }

      if (stepperData.discardModal.type === "tab") {
        dispatch(setStepper({ step: stepperData.stepper.step, tab: stepperData.discardModal.tab }));
      }

      if (stepperData.discardModal.type === "navigate") {
        if (discardLocation) {
          navigate(discardLocation);
        } else {
          navigate(-1);
        }
      }
    }, 500);
  };

  return (
    <Modal isOpen={stepperData.discardModal.isDiscardModalOpen}>
      <div className="w-[376px] px-6 py-5">
        <p className="text-[15px] font-bold mb-[11px]">Save Changes?</p>

        <p className="text-[13px] font-medium text-[#535353] mb-10">
          You're about to leave this page. Would you like to save your changes before leaving?
        </p>

        <div className="w-full flex gap-x-5 items-center justify-center">
          <Button
            className="w-full! text-xs! border-gray-300! shadow-sm bg-[#F6F6F6]! font-semibold py-[10px] rounded-xl"
            variant="outlined"
            size="base"
            onClick={handleDiscard}
          >
            Discard Changes
          </Button>

          {resource && action ? (
            <RBACGuard resource={resource} action={action}>
              <Button
                className="w-full! text-xs! font-semibold py-[10px] rounded-xl"
                type="submit"
                name="save"
                variant="contained"
                size="base"
                onClick={handleClickSaveAndContinue}
              >
                Save & Continue
              </Button>
            </RBACGuard>
          ) : (
            <Button
              className="w-full! text-xs! font-semibold py-[10px] rounded-xl"
              type="submit"
              name="save"
              variant="contained"
              size="base"
              onClick={handleClickSaveAndContinue}
            >
              Save & Continue
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DiscardModal;
