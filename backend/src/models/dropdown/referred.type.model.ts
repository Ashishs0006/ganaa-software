// Global Import
import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { IReferredType } from '../../interfaces/model/dropdown/i.referredType';

const referredTypeSchema = new mongoose.Schema<IReferredType>({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const DDReferredType = mongoose.model<IReferredType>(
  Collections.referredType.name,
  referredTypeSchema
);

export default DDReferredType;
