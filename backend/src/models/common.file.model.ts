import mongoose from 'mongoose';
import Collections from '../constant/collections';
import { getSignedUrlByKey } from '../utils/s3Helper';
import { ICommonFiles } from '../interfaces/i.common.files';

const commonFileSchema = new mongoose.Schema<ICommonFiles>({
  fileName: {
    type: String,
    trim: true,
    required: true,
  },
  filePath: {
    type: String,
    trim: true,
    required: true,
  },
  fileType: {
    type: String,
    enum: ['WEEKLY_REPORT'],
    require: true,
  },
  updatedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const generateSignedUrl = async (doc: any) => {
  let path = doc.filePath;
  if (!path) return;

  const signedUrl = await getSignedUrlByKey(path);
  delete doc.filePath;

  if (doc.hasOwnProperty('_doc')) {
    delete doc._doc.filePath;
    doc._doc.filePath = signedUrl;
  } else {
    delete doc.filePath;
    doc.filePath = signedUrl;
  }
};

// Post Middleware
commonFileSchema.post('findOne', function (doc) {
  const shouldSkip = this.getOptions().skipUrlGeneration ?? false;

  if (shouldSkip) return;
  if (doc) generateSignedUrl(doc);
});

commonFileSchema.post('find', function (docs) {
  const shouldSkip = this.getOptions().skipUrlGeneration ?? false;

  if (shouldSkip) return;
  if (docs?.length > 0) {
    docs.forEach((doc: any) => generateSignedUrl(doc));
  }
});

commonFileSchema.post('findOneAndUpdate', function (doc) {
  const shouldSkip = this.getOptions().skipUrlGeneration ?? false;

  if (shouldSkip) return;
  if (doc) generateSignedUrl(doc);
});

const CommonFile = mongoose.model<ICommonFiles>(Collections.commonFile.name, commonFileSchema);

export default CommonFile;
