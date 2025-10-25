import mongoose, { ObjectId } from 'mongoose';
import { IPatient } from './i.patient';
import { IUser } from '../../../models/user.model';
import { IPatientAdmissionHistory } from './i.patient.admission.history';
import { IPrescriptionMedicine } from '../daily-progress/i.prescription.medicine';

export type IConditionAtTheTimeOfDischarge = 'Status Quo' | 'Partially Improved' | 'Improved';

export interface IPatientDischarge extends mongoose.Document {
  patientId?: ObjectId | IPatient;
  patientAdmissionHistoryId?: ObjectId | IPatientAdmissionHistory;

  date?: string;
  status?: 'LAMA' | 'Routine Discharge' | 'Reffered' | 'Absconding' | 'Discharge on Request';
  reason?: string;
  conditionAtTheTimeOfDischarge?: IConditionAtTheTimeOfDischarge;
  shouldSendfeedbackNotification?: boolean;

  chiefComplaints?: string;
  historyOfPresentIllness?: string;
  physicalExaminationAtAdmission?: string;
  mentalStatusExamination?: string;
  hospitalisationSummary?: string;
  investigation?: string;

  prescriptionDateTime?: Date;
  prescriptionMedicine?: IPrescriptionMedicine[];

  referBackTo?: string;
  adviseAndPlan?: string;

  createdBy?: ObjectId | IUser;
  createdAt: Date;
}
