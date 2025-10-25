// Global Import
import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { IMedicine } from '../../interfaces/model/dropdown/i.medicine';

const medicineSchema = new mongoose.Schema<IMedicine>({
  name: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  genericName: {
    type: String,
    trim: true,
  },
  dosage: [
    {
      type: String,
      trim: true,
    },
  ],
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

medicineSchema.pre(/^find/, function (next) {
  const query = this as mongoose.Query<any, any>;
  query.select({ __v: 0, isDeleted: 0 });
  next();
});

const Medicine = mongoose.model<IMedicine>(Collections.medicine.name, medicineSchema);

export default Medicine;
