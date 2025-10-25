import mongoose, { ObjectId } from 'mongoose';
import IGender from '../i_gender';
import { ICenter } from './resources/i.center';
import { IPatient } from './patient/i.patient';
import { IUser } from '../../models/user.model';
import { IRelationship } from './dropdown/i.relationship';
import { IReferredType } from './dropdown/i.referredType';
import { IPatientAdmissionHistory } from './patient/i.patient.admission.history';
import { IAdmissionType, IIllnessType, IInvoluntaryAdmissionType } from './i.familiar';

export type ILeadType = 'Online' | 'Offline';
export type ILeadSelect = 'IPD' | 'OPD';
export type IProgressStatus = 'Cold' | 'Warm' | 'Hot' | 'Reject' | 'Center Visit Done' | 'Admit';
export type ILeadStatus = 'Qualified' | 'Unqualified';

export interface ILead extends mongoose.Document {
  leadDateTime: Date;

  status: ILeadStatus;
  isNewLead?: boolean;
  leadType?: ILeadType;
  leadSelect?: ILeadSelect;
  progressStatus?: IProgressStatus;
  referralTypeId?: ObjectId | IReferredType;
  referralDetails?: string;

  firstName: string;
  lastName?: string;
  dob?: Date;
  age: number;
  email?: string;
  phoneNumberCountryCode: string;
  phoneNumber: string;
  alternativephoneNumberCountryCode?: string;
  alternativeMobileNumber?: string;
  gender: IGender;
  guardianNameRelationshipId?: ObjectId | IRelationship;
  guardianName?: string;
  country?: string;
  fullAddress?: string;
  chiefComplaints?: string;
  admissionType?: IAdmissionType;
  involuntaryAdmissionType?: IInvoluntaryAdmissionType;

  illnessType?: IIllnessType;
  centerVisitDateTime?: Date;
  centerId: ObjectId | ICenter;
  firstPersonContactedAtGanaa?: string;
  assignedTo?: ObjectId | IUser;
  nextFollowUpDate?: Date;
  comments?: [
    {
      userId?: ObjectId | IUser;
      comment?: string;
      createdAt?: Date;
    },
  ];

  patientId?: ObjectId | IPatient;
  patientAdmissionHistoryId?: ObjectId | IPatientAdmissionHistory;
  updatedBy?: ObjectId | IUser;
  createdBy?: ObjectId | IUser;
  createdAt?: Date;
}
