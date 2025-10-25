import mongoose, { ObjectId } from 'mongoose';
import {
  IAdmissionChecklist,
  IPatientAdmissionHistory,
  IPatientReport,
  IStatus,
} from './i.patient.admission.history';
import { IPatient } from './i.patient';
import { ICenter } from '../resources/i.center';
import { IUser } from '../../../models/user.model';
import { IRoomType } from '../resources/i.room.type';
import { IPatientFeedback } from './i.patient.feedback';
import { IRoomNumber } from '../resources/i.room.number';
import { IPatientDischarge } from './i.patient.discharge';
import { ILockerNumber } from '../resources/i.locker.number';
import { IPatientCaseHistory } from './i.patient.case.history';
import { IAdmissionType, IIllnessType, IInvoluntaryAdmissionType } from '../i.familiar';

export interface IResourceAllocation {
  center: ICenter;
  roomType: IRoomType;
  roomNumber: IRoomNumber;
  lockerNumber: ILockerNumber;
  belongingsInLocker: string;
  assignedDoctor: IUser;
  assignedTherapist: IUser;
  nurse: string;
  careStaff: string;
  updatedAt: Date;
}

export interface IPatientAdmissionHistoryRevision extends mongoose.Document {
  originalId: ObjectId | IPatientAdmissionHistory;
  revision: number;

  patientId: ObjectId | IPatient;

  dateOfAdmission?: Date;

  caseHistoryId?: ObjectId | IPatientCaseHistory;

  dischargeId?: ObjectId | IPatientDischarge;

  feedbackId?: ObjectId | IPatientFeedback;

  // Diagnosis
  illnessType?: IIllnessType;

  // Admission Type
  admissionType?: IAdmissionType;
  involuntaryAdmissionType?: IInvoluntaryAdmissionType;

  // Patient Status
  currentStatus?: IStatus;

  // Admission CheckList
  admissionChecklist: IAdmissionChecklist;

  // Resource Allocation
  resourceAllocation?: IResourceAllocation;

  // Patient Report
  patientReport?: IPatientReport;

  updatedBy?: IUser;
  createdBy?: IUser;

  createdAt?: Date;
}
