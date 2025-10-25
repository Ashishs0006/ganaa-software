import mongoose, { ObjectId } from 'mongoose';
import { IPatient } from '../patient/i.patient';
import { IUser } from '../../../models/user.model';
import { IPatientAdmissionHistory } from '../patient/i.patient.admission.history';

export interface ILoa extends mongoose.Schema {
  patientId?: ObjectId | IPatient;
  patientAdmissionHistoryId?: ObjectId | IPatientAdmissionHistory;
  loa?: boolean;
  noteDateTime?: Date; // Loa Date Time
  createdBy?: ObjectId | IUser;
  createdAt?: Date;
}
