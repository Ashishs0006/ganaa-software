import mongoose from 'mongoose';

type IFileType = 'WEEKLY_REPORT';

export interface ICommonFiles extends mongoose.Document {
  fileName?: string;
  filePath: string;
  fileType: IFileType;
  createdAt: Date;
  updatedAt: Date;
}
