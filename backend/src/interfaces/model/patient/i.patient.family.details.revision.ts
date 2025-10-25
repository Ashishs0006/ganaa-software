import mongoose, { ObjectId } from 'mongoose';
import { IUser } from '../../../models/user.model';
import { IRelationship } from '../dropdown/i.relationship';
import { IPatientFamilyDetails } from './i.patient.family.details';

export interface IPatientFamilyDetailsRevision extends mongoose.Document {
  patientId: ObjectId;
  originalId?: ObjectId | IPatientFamilyDetails;
  revisionNumber?: number;
  revisionId?: string;

  infoType?: string[];
  relationshipId?: ObjectId | IRelationship;
  name?: string;
  phoneNumberCountryCode?: string;
  phoneNumber?: string;
  age?: number;
  address?: string;
  idProffType?: string;
  idProffNumber: string;
  idProof: string;

  createdBy?: ObjectId | IUser;
  updatedBy?: ObjectId | IUser;

  createdAt?: Date;
}
