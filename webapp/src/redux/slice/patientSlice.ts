import { ISelectOption } from "@/components/Select/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IPagination } from "@/redux/slice/types";
import { INurseNoteState } from "@/pages/Admin/PatientData/NurseNotes/types";
import moment from "moment";

interface IInjuryDetails {
  injuryName: string;
  files: { filePath: string; fileUrl: string; fileName?: string }[];
}
export interface IPatientDetails {
  _id?: string;
  uhid?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  age?: number;
  email?: string;
  phoneNumberCountryCode?: ISelectOption;
  phoneNumber?: string;
  alternativephoneNumberCountryCode?: ISelectOption;
  alternativeMobileNumber?: string;
  gender?: "Male" | "Female" | "Other" | "";
  identificationMark?: string;
  country?: ISelectOption;
  fullAddress?: string;
  area?: string;
  patientPic?: string;
  patientFileName?: string;
  patientIdProofName?:string[];
  idProof?: string[];
  referredTypeId?: ISelectOption;
  referralDetails?: string;
  patientidProofUrl?: string;
  education?: string;
  familyIncome?: string;
  religion?: string;
  language?: string;
  isMarried?: boolean | null;
  numberOfChildren?: ISelectOption;
  occupation?: string;
  diagnosis?: ISelectOption;
  // file: null;
  injuryDetails?: IInjuryDetails[];
  diabeticStatus?: string;
  allergyArray?: ISelectOption[];
  allergiesFilesLink?: { filePath: string; fileUrl: string; fileName?: string }[];
  heartDisease?: string;
  heartDiseaseDescription?: string;
  levelOfRiskDescription?: string;
  levelOfRisk?: string;
  hyperTension?: string;
  previousTreatmentRecordLink?: { filePath: string; fileUrl: string; fileName?: string }[];
  injuries?: string[];
   // Add these missing fields:
  center?: string;
  patientName: string;
  contact?: string;
  address?: string;
  admissionType?: string;
  involuntaryAdmissionType?: string;
  doctor?: string;
  therapist?: string;
  dischargeDate?: string;
  dischargeStatus?: string;
  nominatedRepresentative?: string;
  currentStatus?: string;
  stayDuration?: string;
  dischargePlan?:string;
  psychologist?:string;
  followupDate?:string;
  urge?:string;
  adherence?:string;
  prayer?:string;
  literature?:string;
  meeting?:string;
  daycareAtGanaa?:string;
  sponsor?:string;
  stepProgram?:string;
  reviewWithGanaaDoctor?:string;
  feedbackFromFamily?:string;
  UHID: string;
    therapistName: string;
}
export interface IPatientAdmissionHistory {
  _id?: string;
  patientId?: string;
  dateOfAdmission?: string;
  time?: string;
  admissionType?: "Voluntary" | "Involuntary" | "";
  involuntaryAdmissionType?: ISelectOption;

  orientationOfFamily?: boolean | string;
  orientationOfPatient?: boolean | string;
  isInsured?: string | boolean;
  insuredDetail?: string;
  insuredFile?: null | File | string[];
  isapplicationForAdmission?: boolean;
  isvoluntaryAdmissionForm?: boolean;
  isinVoluntaryAdmissionForm?: boolean;
  isminorAdmissionForm?: boolean;
  isform90?: boolean;
  isfamilyDeclaration?: boolean;
  issection94?: boolean;
  iscapacityAssessment?: boolean;
  ishospitalGuidelineForm?: boolean;
  isfinacialCounselling?: boolean;
  isadmissionAssessment?: boolean;

  voluntaryAdmissionFormLink?: { filePath: string; fileUrl: string; fileName?: string }[];
  applicationForAdmissionLink?: { filePath: string; fileUrl: string; fileName?: string }[];
  inVoluntaryAdmissionFormLink?: { filePath: string; fileUrl: string; fileName?: string }[];
  minorAdmissionFormLink?: { filePath: string; fileUrl: string; fileName?: string }[];
  form90Link?: { filePath: string; fileUrl: string; fileName?: string }[];
  familyDeclarationLink?: { filePath: string; fileUrl: string; fileName?: string }[];
  section94Link?: { filePath: string; fileUrl: string; fileName?: string }[];
  capacityAssessmentLink?: { filePath: string; fileUrl: string; fileName?: string }[];
  hospitalGuidelineFormLink?: { filePath: string; fileUrl: string; fileName?: string }[];
  finacialCounsellingLink?: { filePath: string; fileUrl: string; fileName?: string }[];
  insuredFileLink?: { filePath: string; fileUrl: string; fileName?: string }[];
  admissionAssessmentLink?: { filePath: string; fileUrl: string; fileName?: string }[];
admissionAssessment?:{ filePath: string; fileUrl: string; fileName?: string }[];
  patientChecklist?: string[];
  patientIdProof?: string;
  patientIdProofNumber?: string;
  nominatedRelationWithPatientId?: ISelectOption;
  nominatedFullName?: string;
  nominatedGender?: "Male" | "Female" | "Other" | "";
  nominatedAge?: number;
  nominatedIdProof?: string;
  nominatedIdProofNumber?: string;
  payerRelationWithPatientId?: ISelectOption;
  payerFullName?: string;
  payerGender?: "Male" | "Female" | "Other" | "";
  payerAge?: number;
  payerIdProof?: string;
  payerIdProofNumber?: string;
  patientCheck?: string;
  advanceExplained?: string[];

  reportName?: string;
  reportFile?: File | null | string;
  reportFileName?: string;
  patientAssessment?: string[];
  centerId?: ISelectOption;
  roomTypeId?: ISelectOption;
  roomNumberId?: ISelectOption;
  lockerNumberId?: ISelectOption;
  belongingsInLocker?: string;
  assignedDoctorId?: ISelectOption;
  assignedTherapistId?: ISelectOption;
  nurse?: string;
  careStaff?: string;
}

const initialPatientDetails: IPatientDetails = {
  _id: "",
  firstName: "",
  lastName: "",
  uhid: "",
  dob: "",
  age: 0,
  email: "",
  patientFileName: "",
  patientIdProofName: [],
  phoneNumberCountryCode: { label: "", value: "" },
  phoneNumber: "",
  alternativephoneNumberCountryCode: { label: "", value: "" },
  alternativeMobileNumber: "",
  gender: "",
  identificationMark: "",
  country: { label: "", value: "" },
  fullAddress: "",
  area: "",
  patientPic: "",
  idProof: [],
  referredTypeId: { label: "", value: "" },
  referralDetails: "",

  education: "",
  familyIncome: "",
  religion: "",
  language: "",
  isMarried: null,
  numberOfChildren: { value: 0, label: 0 },
  occupation: "",
  diagnosis: { label: "", value: "" },

  injuryDetails: [
    {
      injuryName: "",
      files: []
    }
  ],
  allergiesFilesLink: [],
  allergyArray: [],
  diabeticStatus: "",
  hyperTension: "",
  heartDisease: "",
  heartDiseaseDescription: "",
  levelOfRisk: "",
  levelOfRiskDescription: "",
  previousTreatmentRecordLink: [],
   // Add these missing fields with default values:
    center: "",
    patientName: "",
    contact: "",
    address: "",
    admissionType: "",
    involuntaryAdmissionType: "",
    doctor: "",
    therapist: "",
    dischargeDate: "",
    dischargeStatus: "",
    nominatedRepresentative: "",
    currentStatus: "",
    stayDuration: "",
    dischargePlan: "",
    psychologist: "",
    followupDate: "",
    urge: "",
    adherence: "",
    prayer: "",
    literature: "",
    meeting: "",
    daycareAtGanaa: "",
    sponsor: "",
    stepProgram: "",
    reviewWithGanaaDoctor: "",
    feedbackFromFamily: "",
    UHID: "",
    therapistName: "",
};

const initalPatientAdmission: IPatientAdmissionHistory = {
  _id: "",
  patientId: "",
  dateOfAdmission: moment().format("YYYY-MM-DD"),
  time: moment().format("HH:mm"),
  admissionType: "",
  involuntaryAdmissionType: { label: "", value: "" },

  // AdmissionChecklist
  orientationOfFamily: "",
  orientationOfPatient: "",
  isInsured: "",
  insuredDetail: "",
  insuredFile: null,
  isapplicationForAdmission: false,
  isvoluntaryAdmissionForm: false,
  isinVoluntaryAdmissionForm: false,
  isminorAdmissionForm: false,
  isform90: false,
  isfamilyDeclaration: false,
  issection94: false,
  iscapacityAssessment: false,
  ishospitalGuidelineForm: false,
  isfinacialCounselling: false,
  isadmissionAssessment: false,

  voluntaryAdmissionFormLink: [],
  applicationForAdmissionLink: [],
  inVoluntaryAdmissionFormLink: [],
  minorAdmissionFormLink: [],
  form90Link: [],
  familyDeclarationLink: [],
  section94Link: [],
  capacityAssessmentLink: [],
  hospitalGuidelineFormLink: [],
  finacialCounsellingLink: [],
  admissionAssessmentLink: [],
  admissionAssessment: [],
  insuredFileLink: [],

  patientCheck: "",
  patientChecklist: [],
  patientIdProof: "",
  patientIdProofNumber: "",
  nominatedRelationWithPatientId: { label: "", value: "" },
  nominatedFullName: "",
  nominatedGender: "",
  nominatedAge: 0,
  nominatedIdProof: "",
  nominatedIdProofNumber: "",
  advanceExplained: [],
  payerRelationWithPatientId: { label: "", value: "" },
  payerFullName: "",
  payerGender: "",
  payerAge: 0,
  payerIdProof: "",
  payerIdProofNumber: "",

  reportName: "",
  reportFile: "",
  reportFileName: "",
  patientAssessment: [],
  centerId: { value: "", label: "" },
  roomTypeId: { value: "", label: "" },
  roomNumberId: { value: "", label: "" },
  lockerNumberId: { value: "", label: "" },
  belongingsInLocker: "",
  assignedDoctorId: { value: "", label: "" },
  assignedTherapistId: { value: "", label: "" },
  nurse: "",
  careStaff: ""
};
const initialVitals: INurseNoteState = {
  id: "",
  patientId: "",
  patientAdmissionHistoryId: "",
  bp: "",
  bp1: "",
  bp2: "",
  pulse: "",
  temperature: "",
  spo2: "",
  weight: "",
  rbs: "",
  height: "",
  note: "",
  vitalsDate: moment().format("YYYY-MM-DD"),
  vitalsTime: moment().format("HH:mm")
};

export interface IAllPatient {
  data: [];
  status: string;
  pagination: IPagination;
}

const initialallPatient: IAllPatient = {
  data: [],
  status: "",
  pagination: {
    page: 1,
    limit: 20,
    totalDocuments: 0,
    totalPages: 0
  }
};
const initialAllActivityPatient: IAllPatient = {
  data: [],
  status: "",
  pagination: {
    page: 1,
    limit: 20,
    totalDocuments: 0,
    totalPages: 0
  }
};
const initalLoa: { loa: boolean; id: string } = {
  loa: false,
  id: ""
};

const initialState = {
  patientDetails: initialPatientDetails,
  patientAdmission: initalPatientAdmission,
  vitals: initialVitals,
  allPatient: initialallPatient,
  allActivityPatient: initialAllActivityPatient,
  loa: initalLoa
};

const patientSlice = createSlice({
  name: "patient",
  initialState,
  reducers: {
    setPatientDetails(state, action: PayloadAction<IPatientDetails>) {
      state.patientDetails = action.payload;
    },
    setPatientAdmission(state, action: PayloadAction<IPatientAdmissionHistory>) {
      state.patientAdmission = action.payload;
    },
    setAllPatient(state, action: PayloadAction<IAllPatient>) {
      state.allPatient = action.payload;
    },
    setAllActivityPatient(state, action: PayloadAction<IAllPatient>) {
      state.allActivityPatient = action.payload;
    },
    setVital(state, action: PayloadAction<INurseNoteState>) {
      state.vitals = action.payload;
    },
    setloa(state, action: PayloadAction<{ loa?: boolean; id?: string }>) {
      state.loa.loa = action.payload.loa ?? false;
      state.loa.id = action.payload.id ?? "";
    },
    resetPatientDetails(state) {
      state.patientDetails = initialPatientDetails;
    },
    resetVitals(state) {
      state.vitals = initialVitals;
    },
    resetPatientAdmission(state) {
      state.patientAdmission = initalPatientAdmission;
    }
  }
});

export const {
  setPatientDetails,
  setPatientAdmission,
  setAllPatient,
  setAllActivityPatient,
  resetPatientDetails,
  resetPatientAdmission,
  setVital,
  setloa,
  resetVitals
} = patientSlice.actions;

export default patientSlice.reducer;
