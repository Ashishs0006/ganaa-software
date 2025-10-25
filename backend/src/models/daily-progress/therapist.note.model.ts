import mongoose from 'mongoose';
import Constants from '../../constant/index';
import Collections from '../../constant/collections';
import { getSignedUrlByKey } from '../../utils/s3Helper';
import { ITherapistNote } from '../../interfaces/model/daily-progress/i.therapist.note';

const therapistNoteSchema = new mongoose.Schema<ITherapistNote>({
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

therapistNoteSchema.pre('find', async function (next) {
  const shouldSkip = this.getOptions().skipTherapistPopulation ?? false;

  if (!shouldSkip) this.populate('therapistId', '_id firstName lastName roleId');
  next();
});

therapistNoteSchema.pre('findOne', async function (next) {
  const shouldSkip = this.getOptions().skipTherapistPopulation ?? false;

  if (!shouldSkip) this.populate('therapistId', '_id firstName lastName gender roleId');
  next();
});

therapistNoteSchema.pre('findOneAndUpdate', async function (next) {
  const shouldSkip = this.getOptions().skipTherapistPopulation ?? false;

  if (!shouldSkip) this.populate('therapistId', '_id firstName lastName gender roleId');
  next();
});

// Post Middleware
therapistNoteSchema.post('findOne', function (doc) {
  const shouldSkip = this.getOptions().skipUrlGeneration ?? false;

  if (shouldSkip) return;
  if (doc) generateSignedUrl(doc);
});

therapistNoteSchema.post('find', function (docs) {
  const shouldSkip = this.getOptions().skipUrlGeneration ?? false;

  if (shouldSkip) return;
  if (docs?.length > 0) {
    docs.forEach((doc: any) => generateSignedUrl(doc));
  }
});

therapistNoteSchema.post('findOneAndUpdate', function (doc) {
  const shouldSkip = this.getOptions().skipUrlGeneration ?? false;

  if (shouldSkip) return;
  if (doc) generateSignedUrl(doc);
});

const TherapistNote = mongoose.model<ITherapistNote>(
  Collections.therapistNote.name,
  therapistNoteSchema
);

export default TherapistNote;
