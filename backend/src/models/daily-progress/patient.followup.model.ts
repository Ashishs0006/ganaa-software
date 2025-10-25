import mongoose from 'mongoose';
import Constants from '../../constant/index';
import Collections from '../../constant/collections';
import { getSignedUrlByKey } from '../../utils/s3Helper';
import { IPatientFollowup } from '../../interfaces/model/daily-progress/i.patient.followup';

const patientFollowupSchema = new mongoose.Schema<IPatientFollowup>({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.patient.name,
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
  note: {
    type: String,
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.user.name,
    required: [true, 'Therapist ID is Mandatory'],
  },
  sessionType: {
    type: [String],
    trim: true,
    default: [],
    enum: [...Constants.sessionType.map((e) => e.name)],
  },
  subSessionType: {
    type: String,
    trim: true,
    default: '',
    enum: [...Constants.sessionType.flatMap((e) => e.subMenu), ''],
  },
  score: {
    type: Number,
  },
  file: {
    fileName: String,
    filePath: String,
  },

    // New fields for patient followup
  // center: {
  //   type: String,
  //   trim: true,
  // },
  // patientName: {
  //   type: String,
  //   trim: true,
  // },
  // UHID: {
  //   type: String,
  //   trim: true,
  // },
  // age: {
  //   type: String,
  //   trim: true,
  // },
  // gender: {
  //   type: String,
  //   trim: true,
  //   enum: ['Male', 'Female', 'Other', ''],
  // },
  // contact: {
  //   type: String,
  //   trim: true,
  // },
  // dischargeDate: {
  //   type: Date,
  // },
  // stayDuration: {
  //   type: String,
  //   trim: true,
  // },
  // psychologist: {
  //   type: String,
  //   trim: true,
  // },
  // dischargePlan: {
  //   type: String,
  //   trim: true,
  // },
  // dischargePlanShared: {
  //   type: String,
  //   trim: true,
  // },
  followupDate: {
    type: Date,
  },
  // therapist: {
  //   type: String,
  //   trim: true,
  // },
  urge: {
    type: String,
    trim: true,
    enum: ['Yes', 'No', ''],
  },
  urgeOther: {
    type: String,
    trim: true,
  },
  adherence: {
    type: String,
    trim: true,
    enum: ['Yes', 'No', 'Sometimes', ''],
  },
  prayer: {
    type: String,
    trim: true,
    enum: ['Yes', 'No', ''],
  },
  literature: {
    type: String,
    trim: true,
    enum: ['Yes', 'No', ''],
  },
  meeting: {
    type: String,
    trim: true,
    enum: ['At Ganaa', 'Outside Ganaa', 'At Ganaa & Outside', 'No', ''],
  },
  daycareAtGanaa: {
    type: String,
    trim: true,
    enum: ['Yes', 'No', ''],
  },
  sponsor: {
    type: String,
    trim: true,
    enum: ['Yes', 'No', ''],
  },
  stepProgram: {
    type: String,
    trim: true,
    enum: ['Yes', 'No', ''],
  },
  reviewWithGanaaDoctor: {
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
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.user.name,
    required: [true, 'Created By ID is Mandatory'],
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

const generateSignedUrl = async (doc: any) => {
  let file = doc.file;
  if (!file) return;
  if (!file?.filePath) return;

  const signedUrl = await getSignedUrlByKey(file?.filePath);
  delete doc.file.filePath;

  if (doc.hasOwnProperty('_doc')) {
    delete doc._doc.file.filePath;
    doc._doc.file.filePath = signedUrl;
  } else {
    delete doc.file.filePath;
    doc.file.filePath = signedUrl;
  }
};

patientFollowupSchema.pre('find', async function (next) {
  const shouldSkip = this.getOptions().skipTherapistPopulation ?? false;

  if (!shouldSkip) this.populate('therapistId', '_id firstName lastName roleId');
  next();
});

patientFollowupSchema.pre('findOne', async function (next) {
  const shouldSkip = this.getOptions().skipTherapistPopulation ?? false;

  if (!shouldSkip) this.populate('therapistId', '_id firstName lastName gender roleId');
  next();
});

patientFollowupSchema.pre('findOneAndUpdate', async function (next) {
  const shouldSkip = this.getOptions().skipTherapistPopulation ?? false;

  if (!shouldSkip) this.populate('therapistId', '_id firstName lastName gender roleId');
  next();
});

// Post Middleware
patientFollowupSchema.post('findOne', function (doc) {
  const shouldSkip = this.getOptions().skipUrlGeneration ?? false;

  if (shouldSkip) return;
  if (doc) generateSignedUrl(doc);
});

patientFollowupSchema.post('find', function (docs) {
  const shouldSkip = this.getOptions().skipUrlGeneration ?? false;

  if (shouldSkip) return;
  if (docs?.length > 0) {
    docs.forEach((doc: any) => generateSignedUrl(doc));
  }
});

patientFollowupSchema.post('findOneAndUpdate', function (doc) {
  const shouldSkip = this.getOptions().skipUrlGeneration ?? false;

  if (shouldSkip) return;
  if (doc) generateSignedUrl(doc);
});

const PatientFollowup = mongoose.model<IPatientFollowup>(
  Collections.patientFollowup.name,
  patientFollowupSchema
);

export default PatientFollowup;
