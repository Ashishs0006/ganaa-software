import { ISelectOption } from "@/components/Select/types";

export interface IUsage {
  frequency: string;
  quantity: number;
  when: ISelectOption;
  dosage: ISelectOption;
}

interface TherapistNote {
  _id: string;
  noteDateTime: string; // ISO date string
  sessionType: string;
  subSessionType: string;
  score: number;
  createdAt: string; // ISO date string
}

export interface PatientDetails {
  gender: string;
  shouldSendfeedbackNotification?:boolean;
  patientPicUrl: string;
  firstName: string;
  feedbackId: string;
  lastName: string;
  UHID: string;
  age: string;
  phoneNumber: string;
  address: string;
  admissionType: string;
  involuntaryAdmissionType: string;
  doctor: string;
  currentStatus: string;
  therapist: string;
  admissionDate: string;
  dischargeDate: string;
  nominatedRepresntative: string;
  dischargeStatus: string;
  patientId: string;
  patientAdmissionHistoryId: string;
  therapistNotes: TherapistNote[];
}
