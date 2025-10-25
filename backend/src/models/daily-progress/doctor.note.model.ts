import mongoose from 'mongoose';
import Constants from '../../constant/index';
import Collections from '../../constant/collections';
import { IDoctorNote } from '../../interfaces/model/daily-progress/i.doctor.note';

const doctorNoteSchema = new mongoose.Schema<IDoctorNote>({
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
  noteDateTime: {
    type: Date,
  },
  sessionType: {
    type: [String],
    trim: true,
    default: [],
    enum: Constants.doctorSessionType,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.user.name,
    required: [true, 'Doctor ID is Mandatory'],
  },
  note: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.user.name,
    required: [true, 'Created By User ID is Mandatory'],
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.user.name,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

doctorNoteSchema.pre('find', async function (next) {
  const shouldSkip = this.getOptions().skipTherapistPopulation ?? false;

  if (!shouldSkip) this.populate('doctorId', '_id firstName lastName gender roleId');
  next();
});

doctorNoteSchema.pre('findOne', async function (next) {
  const shouldSkip = this.getOptions().skipTherapistPopulation ?? false;

  if (!shouldSkip) this.populate('doctorId', '_id firstName lastName gender roleId');
  next();
});

doctorNoteSchema.pre('findOneAndUpdate', async function (next) {
  const shouldSkip = this.getOptions().skipTherapistPopulation ?? false;

  if (!shouldSkip) this.populate('doctorId', '_id firstName lastName gender roleId');
  next();
});

const DoctorNote = mongoose.model<IDoctorNote>(Collections.doctorNote.name, doctorNoteSchema);

export default DoctorNote;
