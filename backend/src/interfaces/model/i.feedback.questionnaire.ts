import mongoose, { ObjectId } from 'mongoose';
import { IUser } from '../../models/user.model';

export type IQuestionnaireType = 'rating' | 'text';

export interface IFeedbackQuestionnaire extends mongoose.Document {
  question: string;
  type: IQuestionnaireType;
  order: number;
  createdBy: ObjectId | IUser;
  createdAt: Date;
}
