import mongoose, { ObjectId } from 'mongoose';
import IGender from '../../i_gender';
import { IPatient } from './i.patient';
import { IUser } from '../../../models/user.model';
import { IReferredType } from '../dropdown/i.referredType';

export interface IPatientRevision extends mongoose.Document {
  originalId: ObjectId | IPatient;
  revision: number;

  // Patient Details
  uhid: number;
  firstName?: string;
  lastName?: string;
  dob?: Date;
  age?: number;
  email?: string;
  phoneNumberCountryCode?: string;
  phoneNumber?: string;
  alternativephoneNumberCountryCode?: string;
  alternativeMobileNumber?: string;
  gender?: IGender;
  country?: string;
  fullAddress?: string;
  patientPic?: string;
  patientPicFileName: string;

  // Reference
  referredTypeId?: ObjectId | IReferredType;
  referralDetails?: string;

  // Demographics
  education?: string;
  area?: string;
  familyIncome?: string;
  religion?: string;
  language?: string;
  isMarried?: boolean;
  numberOfChildren?: number;
  occupation?: string;
  personalIncome?: string;

  createdBy?: ObjectId | IUser;
  updatedBy?: ObjectId | IUser;

  createdAt?: Date;
}
