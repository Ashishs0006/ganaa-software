import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { IPatientFamilyDetailsRevision } from '../../interfaces/model/patient/i.patient.family.details.revision';

const patientFamilyDetailsSchemaRevision = new mongoose.Schema<IPatientFamilyDetailsRevision>({
  patientId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.patient.name,
  },
  originalId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.patientFamilyDetails.name,
    required: [true, 'Original ID is required'],
  },
  infoType: {
    type: [String],
    required: true,
  },
  relationshipId: {
    _id: mongoose.Schema.ObjectId,
    shortName: String,
    fullName: String,
  },
  name: {
    type: String,
    trim: true,
  },
  phoneNumberCountryCode: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  age: {
    type: Number,
  },
  address: {
    type: String,
  },
  idProffType: {
    type: String,
  },
  idProffNumber: {
    type: String,
  },
  idProof: {
    type: String,
  },

  createdBy: {
    _id: mongoose.Schema.Types.ObjectId,
    roleId: {
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
    },
    firstName: String,
    lastName: String,
  },
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId,
    roleId: {
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
    },
    firstName: String,
    lastName: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PatientFamilyDetailsRevision = mongoose.model<IPatientFamilyDetailsRevision>(
  Collections.patientFamilyDetailsRevision.name,
  patientFamilyDetailsSchemaRevision
);

export default PatientFamilyDetailsRevision;
