import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { getSignedUrlByKey } from '../../utils/s3Helper';
import { IPatientFamilyDetails } from '../../interfaces/model/patient/i.patient.family.details';

const patientFamilyDetailsSchema = new mongoose.Schema<IPatientFamilyDetails>({
  patientId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.patient.name,
  },

  infoType: {
    type: [String],
    required: true,
    enum: ['Guardian', 'Emergency Contact', 'Nominated Representative', 'Payer'],
  },
  relationshipId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.relationship.name,
  },
  name: {
    type: String,
    trim: true,
    index: true,
  },
  phoneNumberCountryCode: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  age: {
    type: Number,
    index: true,
  },
  address: {
    type: String,
  },
  idProffType: {
    type: String,
    enum: ['Aadhar Card', 'Pan Card', 'Passport', 'Driving License', 'Voter Id', 'Other', ''],
  },
  idProffNumber: {
    type: String,
  },
  idProof: {
    type: String,
  },

  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.user.name,
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.user.name,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const generateSignedUrl = async (doc: any) => {
  const idProofKey = doc?.idProof;
  if (idProofKey?.length > 0) {
    const signedUrl = await getSignedUrlByKey(idProofKey);
    if (doc._doc) {
      delete doc._doc.idProof;
      doc._doc.idProofUrl = signedUrl;
    } else {
      delete doc.idProof;
      doc.idProofUrl = signedUrl;
    }
  }
};

patientFamilyDetailsSchema.pre('findOne', async function (next) {
  this.populate('relationshipId');

  next();
});

patientFamilyDetailsSchema.pre('find', async function (next) {
  this.populate('relationshipId');
  this.populate('createdBy', '_id roleId firstName lastName');
  this.populate('updatedBy', '_id roleId firstName lastName');

  next();
});

patientFamilyDetailsSchema.pre('findOneAndUpdate', async function (next) {
  this.populate('relationshipId');

  next();
});

patientFamilyDetailsSchema.post('findOne', async function (doc) {
  if (doc) await generateSignedUrl(doc);
});

patientFamilyDetailsSchema.post('find', async function (docs) {
  if (docs?.length > 0) {
    await Promise.all(docs.map(async (doc: any) => generateSignedUrl(doc)));
  }
});

patientFamilyDetailsSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) await generateSignedUrl(doc);
});

const PatientFamilyDetails = mongoose.model<IPatientFamilyDetails>(
  Collections.patientFamilyDetails.name,
  patientFamilyDetailsSchema
);

export default PatientFamilyDetails;
