import mongoose, { ObjectId } from 'mongoose';

export interface ILockerNumber extends mongoose.Document {
  name?: string;
  centerId?: ObjectId;
  isDeleted: boolean;
  createdAt: Date;
}
