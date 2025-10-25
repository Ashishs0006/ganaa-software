// Global Import
import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { IAllergy } from '../../interfaces/model/dropdown/i.allergy';

const allergySchema = new mongoose.Schema<IAllergy>({
  name: {
    type: String,
    trim: true,
    required: true,
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

const DDAllergy = mongoose.model<IAllergy>(Collections.allergy.name, allergySchema);

export default DDAllergy;
