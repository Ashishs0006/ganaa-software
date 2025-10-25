import mongoose, { ObjectId } from 'mongoose';
import { IUser } from '../../../models/user.model';
import { IRelationship } from '../dropdown/i.relationship';

type IInfoType = 'Guardian' | 'Emergency Contact' | 'Nominated Representative' | 'Payer';

export interface IPatientFamilyDetails extends mongoose.Document {
  patientId: ObjectId;

  infoType: IInfoType[];
  relationshipId: ObjectId | IRelationship;
  name: string;
  phoneNumberCountryCode?: string;
  phoneNumber?: string;
  age: number;
  address: string;
  idProffType:
    | 'Aadhar Card'
    | 'Pan Card'
    | 'Passport'
    | 'Driving License'
    | 'Voter Id'
    | 'Other'
    | '';
  idProffNumber: string;
  idProof: string;

  createdBy?: ObjectId | IUser;
  updatedBy?: ObjectId | IUser;

  createdAt: Date;
}
