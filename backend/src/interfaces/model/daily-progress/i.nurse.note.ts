import { ObjectId } from 'mongoose';
import { IPatient } from '../patient/i.patient';
import { IPatientAdmissionHistory } from '../patient/i.patient.admission.history';
import { IUser } from '../../../models/user.model';

export interface INurseNote {
  patientId?: ObjectId | IPatient;
  patientAdmissionHistoryId?: ObjectId | IPatientAdmissionHistory;
  noteDateTime?: Date;
  bp?: string;
  pulse?: string;
  temperature?: string;
  spo2?: string;
  height?: string; // In Centimeter
  weight?: string;
  rbs?: string;
  note?: string;
  createdBy?: ObjectId | IUser;
  updatedBy?: ObjectId | IUser;
  createdAt?: Date;
}
