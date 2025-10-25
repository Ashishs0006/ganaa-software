import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { IPatientFeedback } from '../../interfaces/model/patient/i.patient.feedback';

const patientFeedbackSchema = new mongoose.Schema<IPatientFeedback>({
  patientId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.patient.name,
    index: true,
    required: [true, 'Patient ID is Mandatory Field'],
  },
  patientAdmissionHistoryId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.patientAdmissionHistory.name,
    index: true,
    unique: true,
    required: [true, 'Patient Admission HistoryId ID is Mandatory Field'],
  },
  status: {
    type: String,
    enum: ['Created', 'Completed'],
    require: true,
    default: 'Created',
  },

  questionAnswer: [
    {
      question: String,
      answer: String,
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PatientFeedback = mongoose.model<IPatientFeedback>(
  Collections.patientFeedback.name,
  patientFeedbackSchema
);

export default PatientFeedback;
