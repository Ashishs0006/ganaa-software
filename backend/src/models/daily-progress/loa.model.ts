import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { ILoa } from '../../interfaces/model/daily-progress/i.loa';

const loaSchema = new mongoose.Schema<ILoa>({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.user.name,
    required: [true, 'Patient ID is Mandatory'],
  },
  patientAdmissionHistoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.patientAdmissionHistory.name,
    required: [true, 'Patient Admission History ID is Mandatory'],
  },
  loa: {
    type: Boolean,
    default: false,
    required: true,
  },
  // Loa Date Time: Label is same as other daily-progress model for sorting
  noteDateTime: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.user.name,
    required: [true, 'Created By User ID is Mandatory'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

loaSchema.index({ patientAdmissionHistoryId: 1, noteDateTime: 1 }, { unique: true });

loaSchema.pre('validate', function (next) {
  const doc = this as ILoa;
  if (!doc.noteDateTime) {
    const date = new Date(doc.createdAt || Date.now());
    doc.noteDateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // Midnight
  }
  next();
});

const Loa = mongoose.model<ILoa>(Collections.loa.name, loaSchema);

export default Loa;
