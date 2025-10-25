import mongoose from 'mongoose';

export interface IAllergy extends mongoose.Document {
  name: string;
  isDeleted: boolean;
  createdAt: Date;
}
