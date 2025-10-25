import mongoose from "mongoose";

export interface IReferredType extends mongoose.Document {
  name: string;
  order: number;
  createdAt: Date;
}