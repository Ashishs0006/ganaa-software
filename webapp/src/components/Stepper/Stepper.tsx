import { SyntheticEvent } from "react";
import { useDispatch, useSelector } from "react-redux";

import { FaCheck } from "react-icons/fa6";

import { RootState } from "@/redux/store/store";
import { setDiscardModal, setStepper } from "@/redux/slice/stepperSlice";
import { Istep } from "@/components/Stepper/types";

const Steps: Istep[] = [
  { id: 1, stepper: "Patient Details" },
  { id: 2, stepper: "Resource Allocation" },
  { id: 3, stepper: "Medical Summary" }
];

const Stepper = () => {
  const dispatch = useDispatch();

  const stepperData = useSelector((store: RootState) => store.stepper);

  const handleClick = (_e: SyntheticEvent, steps: Istep) => {
    if (stepperData.stepper.step > steps.id) {
      if (stepperData.discardModal.isFormChanged) {
        dispatch(setDiscardModal({ isDiscardModalOpen: true, type: "step", step: steps.id }));
        return;
      }
      dispatch(setStepper({ step: steps.id, tab: stepperData.stepper.tab }));
    }
  };

  return (
    <div id="stepper" className="flex items-center justify-center">
      {Steps.map((steps: Istep, index: number) => (
        <div
          key={steps.id}
          onClick={(e) => handleClick(e, steps)}
          className={`flex ${stepperData.stepper.step > steps.id && "cursor-pointer"} items-center`}
        >
          <div
            className={`flex items-center rounded-full border  p-[7px]  ${
              stepperData.stepper.step >= steps.id
                ? "bg-[#848D5E] border-[#575F4A]"
                : "bg-white border-gray-300"
            }`}
          >
            <div
              className={`p-2  m-0 w-6 h-6 flex items-center justify-center rounded-full  text-white
              xs:text-sm text-sm font-medium ${
                stepperData.stepper.step >= steps.id ? "bg-[#575F4A]" : "bg-[#B4B4B4]"
              }`}
            >
              {stepperData.stepper.step <= steps.id ? steps.id : <FaCheck color="white" />}
            </div>

            <div
              className={`ml-2 lg:text-xs  mr-4 ${
                stepperData.stepper.step >= steps.id
                  ? "text-white font-semibold"
                  : "text-gray-500 font-medium"
              }`}
            >
              {steps.stepper}
            </div>
          </div>

          {index < Steps.length - 1 && (
            <hr className="lg:w-20 md:w-15 w-10 bg-[#CFCFCF] border-[1px] border-[#CFCFCF]" />
          )}
        </div>
      ))}
    </div>
  );
};

export default Stepper;
