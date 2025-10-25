import { ObjectId } from 'mongoose';
import { IBasicFile } from '../../generics';
import { IPatient } from '../patient/i.patient';
import { IUser } from '../../../models/user.model';
import { IPatientAdmissionHistory } from '../patient/i.patient.admission.history';

export type ISessionType =
  | 'R - Regular 15 min'
  | 'T - 45-60 min Therapy'
  | 'NF- Neurofeedback'
  | 'HT - History'
  | 'FS - Family Session'
  | 'FM - Family Meeting'
  | 'A - Assessment'
  | 'P - PostCare'
  | 'D - DayCare';

export type ISubSessionType =
  | 'HAM A'
  | 'HAM D'
  | 'BDI'
  | 'BAI'
  | 'YMRS'
  | 'BPRS'
  | 'PANSS'
  | 'MMSE'
  | 'MOCA'
  | 'Others';

export interface IPatientFollowup {
  patientId: ObjectId | IPatient;
  patientAdmissionHistoryId: ObjectId | IPatientAdmissionHistory;
  noteDateTime?: Date;
  note: string;
  therapistId: ObjectId | IUser;
  sessionType?: ISessionType[];
  score?: number;
  file?: IBasicFile;
  subSessionType?: ISubSessionType;
  createdBy: ObjectId | IUser;
  updatedBy: ObjectId | IUser;
  createdAt: Date;

   // New fields for patient followup
  // center?: string;
  // patientName?: string;
  // UHID?: string;
  // age?: string;
  // gender?: string;
  // contact?: string;
  // dischargeDate?: Date;
  // stayDuration?: string;
  // psychologist?: string;
  // dischargePlan?: string;
  // dischargePlanShared?: string;
  followupDate?: Date;
  // therapist?: string;
  urge?: string;
  urgeOther?: string;
  adherence?: string;
  prayer?: string;
  literature?: string;
  meeting?: string;
  daycareAtGanaa?: string;
  sponsor?: string;
  stepProgram?: string;
  reviewWithGanaaDoctor?: string;
  feedbackFromFamily?: string;
  currentStatus?: string;
  totalDurationOfIllness?: string;
}
