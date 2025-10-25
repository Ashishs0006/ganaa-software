import mongoose, { ObjectId } from 'mongoose';
import { IPatient } from './i.patient';
import { IPatientAdmissionHistory } from './i.patient.admission.history';

export type IStatus = 'Created' | 'Completed';

export interface IPatientFeedback extends mongoose.Document {
  patientId?: ObjectId | IPatient;
  patientAdmissionHistoryId?: ObjectId | IPatientAdmissionHistory;

  status: IStatus;

  questionAnswer?: [
    {
      question: string;
      answer: string;
    },
  ];

  createdAt: Date;
}
