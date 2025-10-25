import mongoose from 'mongoose';

export interface IMedicine extends mongoose.Document {
  name: string;
  genericName?: string;
  dosage?: string[];
  isDeleted: boolean;
  createdAt: Date;
}
