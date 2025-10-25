import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { IPrescription } from '../../interfaces/model/daily-progress/i.prescription';

const prescriptionSchema = new mongoose.Schema<IPrescription>({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.user.name,
    required: [true, 'Doctor ID is Mandatory'],
  },
  medicinesInfo: [
    {
      medicine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Collections.medicine.name,
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

prescriptionSchema.pre('find', async function (next) {
  const shouldSkip = this.getOptions().skipMedicine ?? false;

  this.populate('doctorId', '_id firstName lastName gender roleId');
  if (!shouldSkip) this.populate('medicinesInfo.medicine');

  next();
});

prescriptionSchema.pre('findOne', async function (next) {
  const shouldSkip = this.getOptions().skipMedicine ?? false;

  this.populate('doctorId', '_id firstName lastName gender roleId');
  if (!shouldSkip) this.populate('medicinesInfo.medicine');

  next();
});

prescriptionSchema.pre('findOneAndUpdate', async function (next) {
  const shouldSkip = this.getOptions().skipMedicine ?? false;

  this.populate('doctorId', '_id firstName lastName gender roleId');
  if (!shouldSkip) this.populate('medicinesInfo.medicine');

  next();
});

const Prescription = mongoose.model<IPrescription>(
  Collections.prescription.name,
  prescriptionSchema
);

export default Prescription;
