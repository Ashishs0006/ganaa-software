import mongoose from 'mongoose';

export interface ICounter extends mongoose.Document {
  _id: string;
  seq: number;
}
