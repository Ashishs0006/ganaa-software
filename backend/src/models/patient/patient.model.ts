// Global Import
import mongoose from 'mongoose';
import validator from 'validator';
// Local Import
import Counter from '../counter';
import AppError from '../../utils/appError';
import Collections from '../../constant/collections';
import { getSignedUrlByKey } from '../../utils/s3Helper';
import { IPatient } from '../../interfaces/model/patient/i.patient';

const patientSchema = new mongoose.Schema<IPatient>({
  uhid: {
    type: Number,
    unique: true,
  },
  firstName: {
    type: String,
    trim: true,
    index: true,
  },
  lastName: {
    type: String,
    trim: true,
    index: true,
  },
  dob: {
    type: Date,
    index: true,
  },
  age: {
    type: Number,
    index: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate(value: string) {
      if (value === null || value === undefined || value.length === 0) return;

      if (!validator.isEmail(value)) {
        throw new AppError('Please provide Valid Email Address.', 400);
      }
    },
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
    enum: ['Male', 'Female', 'Other'],
  },
  identificationMark: {
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
  idProof: {
    type: [String], // Array of file paths
    default: [],
  },
  patientIdProofName: {
    type: [String], // <-- Change from String to [String]
    default: [],
  },

  center: {
    type: String,
    trim: true,
  },
  patientName: {
    type: String,
    trim: true,
  },
  contact: {
    type: String,
    trim: true,
  },
  dischargeDate: {
    type: Date,
  },
  stayDuration: {
    type: String,
    trim: true,
  },
  psychologist: {
    type: String,
    trim: true,
  },
  dischargePlan: {
    type: String,
    trim: true,
  },
  dischargePlanShared: {
    type: String,
    trim: true,
  },
  followupDate: {
    type: Date,
  },
  therapistFollowUp: {
    type: String,
    trim: true,
  },
  urge: {
    type: String,
    trim: true,
    enum: ['Yes', 'No', ''],
  },
  urgeOther: {
    type: String,
    trim: true,
  },
  medicationAdherence: {
    type: String,
    trim: true,
    enum: ['Deteriorating', 'Static', 'Improving', ''],
  },
  doingPrayer: {
    type: String,
    trim: true,
    enum: ['Yes', 'No', ''],
  },
  readingAALiterature: {
    type: String,
    trim: true,
    enum: ['Yes', 'No', ''],
  },
  attendingMeeting: {
    type: String,
    trim: true,
    enum: ['At Ganaa', 'Outside', ''],
  },
  attendingDaycareAtGanaa: {
    type: String,
    trim: true,
    enum: ['Yes', 'No', ''],
  },
  makingASponsor: {
    type: String,
    trim: true,
    enum: ['Yes', 'No', ''],
  },
  doing12StepProgram: {
    type: String,
    trim: true,
    enum: ['Yes', 'No', ''],
  },
  doingReviewWithGanaaDoctor: {
    type: String,
    trim: true,
    enum: ['Yes', 'No', ''],
  },
  feedbackFromFamily: {
    type: String,
    trim: true,
  },
  currentStatus: {
    type: String,
    trim: true,
    enum: ['Sober', 'Relapsed', 'Struggling', 'Vanished', ''],
  },
  totalDurationOfIllness: {
    type: String,
    trim: true,
  },

  // Reference
  referredTypeId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.referredType.name,
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
    enum: ['Urban', 'Rural'],
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
  const patientPicKey = doc?.patientPic;
  if (patientPicKey?.length > 0) {
    const signedUrl = await getSignedUrlByKey(patientPicKey);
    if (doc._doc) {
      delete doc._doc.patientPic;
      doc._doc.patientPicUrl = signedUrl;
    } else {
      delete doc.patientPic;
      doc.patientPicUrl = signedUrl;
    }
  }

  // For idProof (array)
  const idProofKeys = doc?.idProof;
  if (Array.isArray(idProofKeys) && idProofKeys.length > 0) {
    const signedUrls = await Promise.all(idProofKeys.map((key: string) => getSignedUrlByKey(key)));
    if (doc._doc) {
      delete doc._doc.idProof;
      doc._doc.patientIdProofUrls = signedUrls;
    } else {
      delete doc.idProof;
      doc.patientIdProofUrls = signedUrls;
    }
  }
};

// Pre-save hook to generate and assign UHID automatically
patientSchema.pre<IPatient>('save', async function (next) {
  const patient = this;

  // Don't overwrite existing UHID (e.g. on update)
  if (patient.isNew && !patient.uhid) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'patient' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      patient.uhid = counter.seq;
    } catch (err: any) {
      next(err);
    }
  }

  next();
});

patientSchema.pre('findOne', async function (next) {
  const shouldSkip = this.getOptions().skipResAllPopulate ?? false;

  if (!shouldSkip) {
    this.populate('referredTypeId');

    this.populate('createdBy', '_id roleId firstName lastName');
    this.populate('updatedBy', '_id roleId firstName lastName');
  }

  next();
});

patientSchema.pre('find', async function (next) {
  const shouldSkip = this.getOptions().skipResAllPopulate ?? false;

  if (!shouldSkip) {
    this.populate('referredTypeId');

    this.populate('createdBy', '_id roleId firstName lastName');
    this.populate('updatedBy', '_id roleId firstName lastName');
  }

  next();
});

patientSchema.pre('findOneAndUpdate', async function (next) {
  const shouldSkip = this.getOptions().skipResAllPopulate ?? false;

  if (!shouldSkip) {
    this.populate('referredTypeId');

    this.populate('createdBy', '_id roleId firstName lastName');
    this.populate('updatedBy', '_id roleId firstName lastName');
  }

  next();
});

patientSchema.post('findOne', async function (doc) {
  if (doc) await generateSignedUrl(doc);
});

patientSchema.post('find', async function (docs) {
  if (docs?.length > 0) {
    await Promise.all(docs.map(async (doc: any) => generateSignedUrl(doc)));
  }
});

patientSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) await generateSignedUrl(doc);
});

const Patient = mongoose.model<IPatient>(Collections.patient.name, patientSchema);

export default Patient;
