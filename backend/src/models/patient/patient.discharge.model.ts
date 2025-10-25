import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { IPatientDischarge } from '../../interfaces/model/patient/i.patient.discharge';

const patientDischargeSchema = new mongoose.Schema<IPatientDischarge>({
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

  date: Date,
  status: {
    type: String,
    enum: ['LAMA', 'Routine Discharge', 'Reffered', 'Absconding', 'Discharge on Request'],
  },
  reason: String,
  conditionAtTheTimeOfDischarge: {
    type: String,
    enum: ['Status Quo', 'Partially Improved', 'Improved', ''],
  },
  shouldSendfeedbackNotification: Boolean,

  chiefComplaints: String,
  historyOfPresentIllness: String,
  physicalExaminationAtAdmission: String,
  mentalStatusExamination: String,
  hospitalisationSummary: String,
  investigation: String,

  prescriptionDateTime: {
    type: Date,
  },
  prescriptionMedicine: [
    {
      medicine: {
        type: mongoose.Schema.ObjectId,
        ref: Collections.medicine.name,
        index: true,
      },
      durationFrequency: String,
      customDuration: String,
      prescribedWhen: String,
      instructions: String,
      usages: [{ frequency: String, quantity: Number, when: String, dosage: String }],
    },
  ],

  referBackTo: String,
  adviseAndPlan: String,

  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.user.name,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

patientDischargeSchema.pre('findOne', async function (next) {
  const skipMedicine = this.getOptions().skipMedicine ?? false;
  const skipUserInfo = this.getOptions().skipUserInfo ?? false;

  if (!skipMedicine) this.populate('prescriptionMedicine.medicine');

  if (!skipUserInfo) this.populate('createdBy', '_id roleId firstName lastName');
  next();
});

patientDischargeSchema.pre('find', async function (next) {
  const skipMedicine = this.getOptions().skipMedicine ?? false;
  const skipUserInfo = this.getOptions().skipUserInfo ?? false;

  if (!skipMedicine) this.populate('prescriptionMedicine.medicine');

  if (!skipUserInfo) this.populate('createdBy', '_id roleId firstName lastName');
  next();
});

patientDischargeSchema.pre('findOneAndUpdate', async function (next) {
  const skipMedicine = this.getOptions().skipMedicine ?? false;
  const skipUserInfo = this.getOptions().skipUserInfo ?? false;

  if (!skipMedicine) this.populate('prescriptionMedicine.medicine');

  if (!skipUserInfo) this.populate('createdBy', '_id roleId firstName lastName');
  next();
});

const PatientDischarge = mongoose.model<IPatientDischarge>(
  Collections.patientDischarge.name,
  patientDischargeSchema
);

export default PatientDischarge;
