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

export interface ITherapistNote {
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
}
