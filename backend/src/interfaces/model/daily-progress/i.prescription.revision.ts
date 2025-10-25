import { ObjectId } from 'mongoose';
import { IPatient } from '../patient/i.patient';
import { IPrescription } from './i.prescription';
import { IUser } from '../../../models/user.model';
import { IPatientAdmissionHistory } from '../patient/i.patient.admission.history';

export interface IPrescriptionRevisionMedicine {
  medicine?: {
    name: string;
    genericName?: string;
    dosage?: string[];
  };
  durationFrequency?: string;
  customDuration?: string;
  prescribedWhen?: string;
  instructions?: string;
  usages?: IMedicineUsagesRevision[];
}

export interface IMedicineUsagesRevision {
  frequency?: string;
  quantity?: number;
  when?: string;
  dosage?: string;
}

export interface IPrescriptionRevision {
  originalId: ObjectId | IPrescription;
  revision: number;

  patientId?: ObjectId | IPatient;
  patientAdmissionHistoryId?: ObjectId | IPatientAdmissionHistory;
  noteDateTime?: Date;
  doctorId: ObjectId | IUser;

  medicinesInfo?: IPrescriptionRevisionMedicine[];

  createdBy?: ObjectId | IUser;
  updatedBy?: ObjectId | IUser;
  createdAt?: Date;
}
