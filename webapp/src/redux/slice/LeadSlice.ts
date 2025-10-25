import { IPagination } from "@/redux/slice/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ISelectOption } from "@/components/Select/types";
import moment from "moment";

export interface ILead {
  referralTypeId?: ISelectOption;
  illnessType?: ISelectOption;
  referralDetails?: string;
  leadSelect?: string;
  leadType?: string;
  leadDate?: string;
  leadTime?: string;
  progressStatus?: ISelectOption;

  firstName?: string;
  lastName?: string;
  dob?: string;
  age?: number;
  email?: string;
  phoneNumber?: string;
  phoneNumberCountryCode?: ISelectOption;
  alternativephoneNumberCountryCode?: ISelectOption;
  alternativeMobileNumber?: string;
  gender?: string;
  guardianName?: string;
  guardianNameRelationshipId?: ISelectOption;
  isNewLead?: boolean;
  country?: ISelectOption;
  fullAddress?: string;
  // state?: string;
  chiefComplaints?: string;
  admissionType?: string;
  involuntaryAdmissionType?: ISelectOption;
  centerId?: ISelectOption;
  firstPersonContactedAtGanaa?: string;
  assignedTo?: ISelectOption;
  nextFollowUpDate?: string;
  centerVisitDateTime?: string;
}

export interface IQualifiedLead {
  data: [];
  status: string;
  pagination: IPagination;
}

export interface IDisQualifiedLead {
  data: [];
  status: string;
  pagination: IPagination;
}

const initialLead: ILead = {
  referralTypeId: { label: "", value: "" },
  referralDetails: "",
  leadSelect: "",
  leadType: "",
  isNewLead: undefined,
  leadDate: moment().format("YYYY-MM-DD"),
  leadTime: moment().format("HH:mm"),
  progressStatus: { label: "", value: "" },

  firstName: "",
  lastName: "",
  dob: "",
  age: 0,
  email: "",
  phoneNumber: "",
  phoneNumberCountryCode: { label: "+91", value: "+91" },
  alternativephoneNumberCountryCode: { label: "+91", value: "+91" },
  alternativeMobileNumber: "",
  gender: "",
  guardianName: "",
  guardianNameRelationshipId: { label: "", value: "" },

  country: { label: "", value: "" },
  fullAddress: "",
  chiefComplaints: "",
  admissionType: "",
  involuntaryAdmissionType: { label: "", value: "" },
  centerId: { label: "", value: "" },
  firstPersonContactedAtGanaa: "",
  assignedTo: { label: "", value: "" },
  nextFollowUpDate: "",
  centerVisitDateTime: ""
};

const initialQualifiedLead: IQualifiedLead = {
  data: [],
  status: "",
  pagination: {
    page: 1,
    limit: 20,
    totalDocuments: 0,
    totalPages: 0
  }
};

const initialDisQualifiedLead: IDisQualifiedLead = {
  data: [],
  status: "",
  pagination: {
    page: 1,
    limit: 20,
    totalDocuments: 0,
    totalPages: 0
  }
};

const initialState = {
  qualifiedLead: initialQualifiedLead,
  lead: initialLead,
  disQualifiedLead: initialDisQualifiedLead
};

const leadSlice = createSlice({
  name: "lead",
  initialState,
  reducers: {
    setLead(state, action: PayloadAction<ILead>) {
      state.lead = action.payload;
    },
    setQualifiedLead(state, action: PayloadAction<IQualifiedLead>) {
      state.qualifiedLead = action.payload;
    },
    setDisQualifiedLead(state, action: PayloadAction<IDisQualifiedLead>) {
      state.disQualifiedLead = action.payload;
    },
    resetLead(state) {
      state.lead = initialLead;
    }
  }
});

export const { setQualifiedLead, setLead, resetLead, setDisQualifiedLead } = leadSlice.actions;
export default leadSlice.reducer;
