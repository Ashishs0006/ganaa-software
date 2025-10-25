import mongoose from 'mongoose';
import validator from 'validator';
import AppError from '../utils/appError';
import Collections from '../constant/collections';
import { ILead } from '../interfaces/model/i.lead';

const leadSchema = new mongoose.Schema<ILead>({
  leadDateTime: {
    type: Date,
    required: [true, 'Lead Datetime is Mandatory'],
  },

  status: {
    type: String,
    enum: ['Qualified', 'Unqualified'],
    default: 'Qualified',
    required: true,
  },
  leadType: {
    type: String,
    enum: ['Online', 'Offline'],
  },
  isNewLead: {
    type: Boolean,
  },
  leadSelect: {
    type: String,
    enum: ['IPD', 'OPD'],
  },
  progressStatus: {
    type: String,
    enum: ['Cold', 'Warm', 'Hot', 'Reject', 'Center Visit Done', 'Admit'],
  },
  referralTypeId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.referredType.name,
  },
  referralDetails: {
    type: String,
    trim: true,
  },

  firstName: {
    type: String,
    trim: true,
    required: true,
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
    required: true,
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
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
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
    required: true,
  },
  guardianNameRelationshipId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.relationship.name,
  },
  guardianName: {
    type: String,
    trim: true,
    index: true,
  },
  country: {
    type: String,
  },
  fullAddress: {
    type: String,
  },
  chiefComplaints: {
    type: String,
    trim: true,
  },
  admissionType: {
    type: String,
    enum: ['Voluntary', 'Involuntary'],
  },
  illnessType: {
    type: String,
    enum: ['Addiction', 'Mental Disorder', 'Addiction & Mental Disorder'],
  },
  involuntaryAdmissionType: {
    type: String,
    enum: ['Rescued', 'Brought by family'],
  },

  centerVisitDateTime: {
    type: Date,
  },
  centerId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.center.name,
    // required: true,
  },
  firstPersonContactedAtGanaa: {
    type: String,
    trim: true,
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.user.name,
  },
  nextFollowUpDate: {
    type: Date,
  },
  comments: [
    {
      userId: {
        type: mongoose.Schema.ObjectId,
        ref: Collections.user.name,
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  patientId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.patient.name,
  },
  patientAdmissionHistoryId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.patientAdmissionHistory.name,
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.user.name,
    select: false,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.user.name,
    select: false,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

leadSchema.pre('find', async function (next) {
  const fieldsToPopulate = _buildFieldsToPopulate(this.getOptions());

  for (const { path, skip, select, options } of fieldsToPopulate) {
    if (!skip) this.populate({ path, select, options });
  }

  next();
});

leadSchema.pre('findOneAndUpdate', async function (next) {
  const fieldsToPopulate = _buildFieldsToPopulate(this.getOptions());

  for (const { path, skip, select, options } of fieldsToPopulate) {
    if (!skip) this.populate({ path, select, options });
  }

  next();
});

leadSchema.pre('findOne', async function (next) {
  const fieldsToPopulate = _buildFieldsToPopulate(this.getOptions());

  for (const { path, skip, select, options } of fieldsToPopulate) {
    if (!skip) this.populate({ path, select, options });
  }

  next();
});

/**
 * Helper Functions
 */
const _buildFieldsToPopulate = (opts: mongoose.QueryOptions<any>) => {
  return [
    {
      path: 'referralTypeId',
      skip: opts.skipReferralTypePopulate ?? false,
      select: '_id name',
      options: undefined,
    },
    {
      path: 'guardianNameRelationshipId',
      skip: opts.skipGuardianNameRelationPopulate ?? false,
      select: '_id shortName fullName',
      options: undefined,
    },
    {
      path: 'centerId',
      skip: opts.skipCenterPopulate ?? false,
      select: '_id  centerName',
      options: undefined,
    },
    {
      path: 'assignedTo',
      skip: opts.skipAssignedToPopulate ?? false,
      select: '_id firstName lastName profilePic',
      options: { skipCenterPopulate: true },
    },
    {
      path: 'comments.userId',
      skip: opts.skipCommentsUserPopulate ?? false,
      select: '_id firstName lastName profilePic',
      options: undefined,
    },
  ];
};

const Lead = mongoose.model<ILead>(Collections.lead.name, leadSchema);

export default Lead;
