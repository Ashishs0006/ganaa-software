import { SyntheticEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames";

import { FaCheck } from "react-icons/fa";

import { RootState } from "@/redux/store/store";
import { setDiscardModal, setStepper } from "@/redux/slice/stepperSlice";

import { AdmissionChecklist, BasicDetails, ProfileContacts } from "@/components";

import { tabs } from "@/pages/Admin/Registration/utils";

export const PatientDetails = () => {
  const dispatch = useDispatch();
  const stepperData = useSelector((store: RootState) => store.stepper);

  const handleTab = (_e: SyntheticEvent, tabValue: number) => {
    if (stepperData.stepper.tab > tabValue) {
      if (stepperData.discardModal.isFormChanged) {
        dispatch(setDiscardModal({ isDiscardModalOpen: true, type: "tab", tab: tabValue }));
        return;
      }
      dispatch(setStepper({ step: stepperData.stepper.step, tab: tabValue }));
    }
  };

  return (
    <div id="patient-details">
      <div className="text-[13px]  flex items-center w-full justify-center font-semibold text-[#575F4A] ">
        <div className="flex items-end justify-end gap-11 border-b font-bold border-[#DEDEDE] ">
          {tabs.map((data, index) => (
            <p
              key={index}
              onClick={(e) => handleTab(e, data.id)}
              className={classNames(
                "text-[#575F4A] pb-[18px] text-nowrap gap-1 flex items-center font-medium",
                stepperData.stepper.tab == data.id
                  ? "font-bold! text-black border-b-2 border-black"
                  : null,
                stepperData.stepper.tab >= data.id ? "cursor-pointer" : null
              )}
            >
              {stepperData.stepper.tab > data.id && <FaCheck />} {data.tabs}
            </p>
          ))}
        </div>
      </div>

      {stepperData.stepper.tab == 1 && <BasicDetails />}
      {stepperData.stepper.tab == 2 && <ProfileContacts />}
      {stepperData.stepper.tab == 3 && <AdmissionChecklist />}
    </div>
  );
};
