import mongoose from 'mongoose';

export interface IRelationship extends mongoose.Document {
  shortName: string;
  fullName: string;
  isDeleted: boolean;
  createdAt: Date;
}
