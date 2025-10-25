import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export interface ITherapistNote {
  noteDate?: string;
  noteTime?: string;
  note?: string;
  file?: File | null | string;
  sessionType?: string[];
  score?: string;
  subSessionType?: string[];
  therapistId?: string;
}

export interface IPatientFollowup {
  noteDate?: string;
  noteTime?: string;
  note?: string;
  file?: File | null | string;
  sessionType?: string[];
  score?: string;
  subSessionType?: string[];
  therapistId?: string;
  // New fields for patient followup
  age?: string;
  address?: string;
  admissionType?: string;
  involuntaryAdmissionType?: string;
  doctor?: string;
  therapist?: string;
  dischargeStatus?: string;
  nominatedRepresentative?: string;
  adherence?: string;
  prayer?: string;
  literature?: string;
  meeting?: string;
  daycareAtGanaa?: string;
  sponsor?: string;
  stepProgram?: string;
  reviewWithGanaaDoctor?: string;
  UHID?: string;
  therapistName?: string;
  gender?: string;
  center?: string;
  patientName?: string;
  contact?: string;
  dischargeDate?: Date;
  stayDuration?: string;
  psychologist?: string;
  dischargePlan?: string;
  dischargePlanShared?: string;
  followupDate?: Date;
  therapistFollowUp?: string;
  urge?: string;
  urgeOther?: string;
  medicationAdherence?: string;
  doingPrayer?: string;
  readingAALiterature?: string;
  attendingMeeting?: string;
  attendingDaycareAtGanaa?: string;
  makingASponsor?: string;
  doing12StepProgram?: string;
  doingReviewWithGanaaDoctor?: string;
  feedbackFromFamily?: string;
  currentStatus?: string;
  totalDurationOfIllness?: string;
}

export interface INurseNote {
  patientId?: string;
  patientAdmissionHistoryId?: string;
  vitalsDate?: string;
  vitalsTime?: string;
  bp?: string;
  pulse?: string;
  temperature?: string;
  spo2?: string;
  rbs?: string;
  height?: string;
  weight?: string;
  note?: string;
}

interface IDoctorNote {
  noteDate?: string;
  noteTime?: string;
  note: string;
  doctorId: string;
}

const initialTherapistNote: ITherapistNote = {
  noteDate: "",
  noteTime: "",
  note: "",
  file: null,
  score: "",
  sessionType: [],
  subSessionType: [],
  therapistId: ""
};

const initialNurseNote: INurseNote = {
  vitalsDate: "",
  vitalsTime: "",
  bp: "",
  pulse: "",
  temperature: "",
  spo2: "",
  rbs: "",
  height: "",
  weight: "",
  note: ""
};

const initialDoctorNote: IDoctorNote = {
  noteDate: "",
  noteTime: "",
  note: "",
  doctorId: ""
};

const initialPatientFollowup: IPatientFollowup = {
  noteDate: "",
  noteTime: "",
  note: "",
  file: null,
  score: "",
  sessionType: [],
  subSessionType: [],
  therapistId: "",
  // Add all the missing fields with proper default values
  center: "",
  patientName: "",
  age: "",
  contact: "",
  address: "",
  admissionType: "",
  involuntaryAdmissionType: "",
  doctor: "",
  therapist: "",
  dischargeDate: new Date(),
  dischargeStatus: "",
  nominatedRepresentative: "",
  currentStatus: "", // Set to empty string, not "Discharged"
  stayDuration: "",
  dischargePlan: "",
  psychologist: "",
  followupDate: new Date(),
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
  gender: ""
};

const initialState = {
  therapistNote: initialTherapistNote,
  nurseNote: initialNurseNote,
  doctorNote: initialDoctorNote,
  patientFollowup: initialPatientFollowup
};

const noteSlice = createSlice({
  name: "note",
  initialState,
  reducers: {
    setTherapistNote(state, action: PayloadAction<ITherapistNote>) {
      state.therapistNote = action.payload;
    },
    setPatientFollowup(state, action: PayloadAction<IPatientFollowup>) {
      state.patientFollowup = action.payload;
    },
    setNurseNote(state, action: PayloadAction<INurseNote>) {
      state.nurseNote = action.payload;
    },
    setDoctorNote(state, action: PayloadAction<IDoctorNote>) {
      state.doctorNote = action.payload;
    },
    resetTherapistNote(state) {
      state.therapistNote = initialTherapistNote;
    },
    resetPatientFollowup(state) {
      state.patientFollowup = initialPatientFollowup;
    },
    resetNurseNote(state) {
      state.nurseNote = initialNurseNote;
    }
  }
});

export const {
  setTherapistNote,
  setPatientFollowup,
  setNurseNote,
  setDoctorNote,
  resetTherapistNote,
  resetPatientFollowup,
  resetNurseNote
} = noteSlice.actions;

export default noteSlice.reducer;
