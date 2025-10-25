// Global Import
import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { ILockerNumber } from '../../interfaces/model/resources/i.locker.number';

const lockerNumberSchema = new mongoose.Schema<ILockerNumber>({
  name: {
    type: String,
    trim: true,
    index: true,
  },
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.center.name,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

lockerNumberSchema.index({ centerId: 1, name: 1 }, { unique: true });

const LockerNumber = mongoose.model<ILockerNumber>(
  Collections.lockerNumber.name,
  lockerNumberSchema
);

export default LockerNumber;
