import mongoose, { ObjectId } from 'mongoose';
import { IPatient } from '../patient/i.patient';
import { IUser } from '../../../models/user.model';
import { IPatientAdmissionHistory } from '../patient/i.patient.admission.history';

export interface IDoctorNote extends mongoose.Schema {
  patientId?: ObjectId | IPatient;
  patientAdmissionHistoryId?: ObjectId | IPatientAdmissionHistory;
  noteDateTime?: Date;
  doctorId: ObjectId | IUser;
  note?: string;
  sessionType?: string[];
  createdBy?: ObjectId | IUser;
  updatedBy?: ObjectId | IUser;
  createdAt?: Date;
}
