import { ObjectId, Types } from 'mongoose';
import IGender from '../i_gender';
import { IRole } from './i.role.model';
import { ICenter } from './resources/i.center';
import { IPatient } from './patient/i.patient';

export interface IUserAttributes {
  _id?: string | ObjectId;
  roleId: ObjectId | IRole;
  firstName?: string;
  lastName?: string;
  dob?: Date;
  email?: string;
  password?: string;
  passwordChangedAt?: Date;
  gender?: IGender;
  phoneNumberCountryCode?: string;
  phoneNumber?: string;
  isEmailVerified: boolean;

  resendOTP?: Date;
  otp?: string;
  otpExpiresIn?: Date;
  profilePic?: string;
  isDeleted: boolean;
  centerId?: ObjectId | ICenter;
  createdAt: Date;

  patientId?: ObjectId | IPatient;
}
