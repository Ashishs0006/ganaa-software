import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IStep {
  step: number;
  tab: number;
}
interface IDiscardModal {
  isFormChanged: boolean;
  isDiscardModalOpen: boolean;
  discartLocation: string | null;
  shouldSave: boolean;
  step: number;
  tab: number;
  type: "navigate" | "tab" | "step";
}
interface IStepperState {
  stepper: IStep;
  discardModal: IDiscardModal;
}
const initialState: IStepperState = {
  stepper: {
    step: 1,
    tab: 1
  },
  discardModal: {
    isFormChanged: false,
    isDiscardModalOpen: false,
    discartLocation: null,
    shouldSave: false,
    type: "navigate",
    step: 1,
    tab: 1
  }
};

const stepperSlice = createSlice({
  name: "dropdown",
  initialState,
  reducers: {
    setStepper(state, action: PayloadAction<{ step: number; tab: number }>) {
      state.stepper.step = action.payload.step;
      state.stepper.tab = action.payload.tab;
    },
    setDiscardModal(
      state,
      action: PayloadAction<{
        isFormChanged?: boolean;
        isDiscardModalOpen?: boolean;
        discartLocation?: string;
        shouldSave?: boolean;
        step?: number;
        tab?: number;
        type?: "navigate" | "tab" | "step";
      }>
    ) {
      if (action.payload.isFormChanged !== undefined)
        state.discardModal.isFormChanged = action.payload.isFormChanged;

      if (action.payload.isDiscardModalOpen !== undefined)
        state.discardModal.isDiscardModalOpen = action.payload.isDiscardModalOpen;

      if (action.payload.shouldSave !== undefined)
        state.discardModal.shouldSave = action.payload.shouldSave;

      if (action.payload.discartLocation !== undefined)
        state.discardModal.discartLocation = action.payload.discartLocation;

      if (action.payload.step !== undefined) state.discardModal.step = action.payload.step;
      if (action.payload.tab !== undefined) state.discardModal.tab = action.payload.tab;
      if (action.payload.type !== undefined) state.discardModal.type = action.payload.type;
    }
  }
});

export const { setStepper, setDiscardModal } = stepperSlice.actions;

export default stepperSlice.reducer;
