import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { IPrescriptionRevision } from '../../interfaces/model/daily-progress/i.prescription.revision';

const prescriptionRevisionSchema = new mongoose.Schema<IPrescriptionRevision>({
  originalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.prescription.name,
    required: [true, 'Prescription ID is Mandatory'],
  },
  revision: {
    type: Number,
    required: [true, 'Revision is Mandatory Field'],
    default: 0,
  },

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
  doctorId: {
    _id: mongoose.Schema.Types.ObjectId,
    roleId: {
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
    },
    firstName: String,
    lastName: String,
    gender: String,
  },
  medicinesInfo: [
    {
      medicine: {
        name: String,
        genericName: String,
        dosage: [String],
      },
      durationFrequency: String,
      customDuration: String,
      prescribedWhen: String,
      instructions: String,
      usages: [
        {
          frequency: String,
          quantity: Number,
          when: String,
          dosage: String,
        },
      ],
    },
  ],
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId,
    roleId: {
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
    },
    firstName: String,
    lastName: String,
    gender: String,
  },
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId,
    roleId: {
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
    },
    firstName: String,
    lastName: String,
    gender: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PrescriptionRevision = mongoose.model<IPrescriptionRevision>(
  Collections.prescriptionRevision.name,
  prescriptionRevisionSchema
);

export default PrescriptionRevision;
