import mongoose from 'mongoose';
import Collections from '../constant/collections';
import { IFeedbackQuestionnaire } from '../interfaces/model/i.feedback.questionnaire';

const feedbackQuestionnaireSchema = new mongoose.Schema<IFeedbackQuestionnaire>({
  question: {
    type: String,
    trim: true,
    required: true,
  },
  type: {
    type: String,
    enum: ['rating', 'text'],
    required: true,
  },
  order: {
    type: Number,
    unique: true,
    require: true,
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

const FeedbackQuestionnaire = mongoose.model<IFeedbackQuestionnaire>(
  Collections.feedbackQuestionnaire.name,
  feedbackQuestionnaireSchema
);

export default FeedbackQuestionnaire;
