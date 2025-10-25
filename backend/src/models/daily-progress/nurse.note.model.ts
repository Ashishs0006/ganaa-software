import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { INurseNote } from '../../interfaces/model/daily-progress/i.nurse.note';

const nurseNoteSchema = new mongoose.Schema<INurseNote>({
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
  bp: {
    type: String,
  },
  pulse: {
    type: String,
  },
  temperature: {
    type: String,
  },
  spo2: {
    type: String,
  },
  height: {
    type: String, // In Centimeter
  },
  weight: {
    type: String,
  },
  rbs: {
    type: String,
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

const NurseNote = mongoose.model<INurseNote>(Collections.nurseNote.name, nurseNoteSchema);

export default NurseNote;
