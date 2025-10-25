import { ModalState } from "@/components/Header/types";

interface IPermission {
  resource: string;
  actions: string[];
}

interface IRoles {
  _id?: string;
  name?: string;
  permissions?: IPermission[];
}
export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  roleId: IRoles;
}

export interface IPatientState {
  totalPages: string | number;
  firstName: string;
  lastName: string;
  UHID: string;
  gender: string;
  patientProfilePic: string;
  assignedTherapist: string;
  patientAdmissionHistoryId: string;
  dateOfAdmission: string;
  patientId: string;
  therapistName: string;
  isTodayNoteExist: boolean;
  illnessType?: string;

  // Add these missing fields:
  // center?: string;
  // patientName: string;
  // age?: string;
  // contact?: string;
  // address?: string;
  // admissionType?: string;
  // involuntaryAdmissionType?: string;
  // doctor?: string;
  // therapist?: string;
  // dischargeDate?: string;
  // dischargeStatus?: string;
  // nominatedRepresentative?: string;
  // currentStatus?: string;
  // stayDuration?: string;
  // dischargePlan?:string;
  // psychologist?:string;
  // followupDate?:string;
  // urge?:string;
  // adherence?:string;
  // prayer?:string;
  // literature?:string;
  // meeting?:string;
  // daycareAtGanaa?:string;
  // sponsor?:string;
  // stepProgram?:string;
  // reviewWithGanaaDoctor?:string;
  // feedbackFromFamily?:string;
}

export interface IPatientFollowup {
  _id: string;
  createdAt: string;
  note: string;
  sessionType: string;
  score: string;
  subSessionType: string;
  file: { fileName: string; filePath: string };
  noteDateTime: string;
  therapistId: IUser;
  
    // Add the missing fields
  age?: string;
  contact?: string;
  phoneNumberCountryCode?: string;
  fullAddress?: string;
  admissionType?: string;
  involuntaryAdmissionType?: string;
  resourceAllocation?: {
    assignedDoctorId?: {
      firstName?: string;
      lastName?: string;
    };
    assignedTherapistId?: {
      firstName?: string;
      lastName?: string;
    };
  };
  dischargeDate?: string;
  dischargeStatus?: string;
  currentStatus?: string;
}

export interface IPatientFollowupState {
  id: string;
  patientId: string;
  patientAdmissionHistoryId: string;
  therapistId: string;
  sessionType: string[];
  score: string;
  subSessionType: string[];
  note: string;
  file: File | null | string;
  fileName: string;
  noteDate: string;
  noteTime: string;
  // Add these missing fields:
  // center?: string;
  // patientName: string;
  // age?: string;
  // contact?: string;
  // address?: string;
  // admissionType?: string;
  // involuntaryAdmissionType?: string;
  // doctor?: string;
  // therapist?: string;
  dischargeDate?: string;
  dischargeStatus?: string;
  nominatedRepresentative?: string;
  currentStatus?: string;
  stayDuration?: string;
  dischargePlan?: string;
  psychologist?: string;
  followupDate?: string;
  urge?: string;
  adherence?: string;
  prayer?: string;
  literature?: string;
  meeting?: string;
  daycareAtGanaa?: string;
  sponsor?: string;
  stepProgram?: string;
  reviewWithGanaaDoctor?: string;
  feedbackFromFamily?: string;
  UHID: string;
  therapistName: string;
  gender: string;
}

export interface IPatientFollowupDropDownsState {
  displayAddForm: boolean;
  displaySessionTypeDropdown: boolean;
  isModalOpen: ModalState;
  displayDropdown: boolean;
  openMenuId: string | null;
}
