import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { IPatientRevision } from '../../interfaces/model/patient/i.patient.revision';

const patientRevisionSchema = new mongoose.Schema<IPatientRevision>({
  originalId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.patient.name,
    required: [true, 'Patient ID is Mandatory Field'],
  },
  revision: {
    type: Number,
    required: [true, 'Revision is Mandatory Field'],
    default: 0,
  },

  uhid: {
    type: Number,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  dob: {
    type: Date,
  },
  age: {
    type: Number,
  },
  email: {
    type: String,
    trim: true,
  },
  phoneNumberCountryCode: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  alternativephoneNumberCountryCode: {
    type: String,
  },
  alternativeMobileNumber: {
    type: String,
  },
  gender: {
    type: String,
  },
  country: {
    type: String,
  },
  fullAddress: {
    type: String,
  },
  patientPic: {
    type: String,
  },
  patientPicFileName: {
    type: String,
  },

  // Reference
  referredTypeId: {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
  },
  referralDetails: {
    type: String,
  },

  // Demographics
  education: {
    type: String,
  },
  area: {
    type: String,
  },
  familyIncome: {
    type: String,
  },
  religion: {
    type: String,
  },
  language: {
    type: String,
  },
  isMarried: {
    type: Boolean,
    default: undefined,
  },
  numberOfChildren: {
    type: Number,
    default: undefined,
  },
  occupation: {
    type: String,
  },
  personalIncome: {
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

const PatientRevision = mongoose.model<IPatientRevision>(
  Collections.patientRevision.name,
  patientRevisionSchema
);

export default PatientRevision;
