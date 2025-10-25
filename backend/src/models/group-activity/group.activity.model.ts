import mongoose from 'mongoose';
import Constants from '../../constant/index';
import Collections from '../../constant/collections';
import { IGroupActivity } from '../../interfaces/model/group-activity/i.group.activity';

const groupActivitySchema = new mongoose.Schema<IGroupActivity>({
  patientId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.patient.name,
  },
  activityDateTime: {
    type: Date,
    required: [true, 'Activity Datetime is Mandatory'],
  },
  activity: [
    {
      name: {
        type: String,
        enum: Constants.groupActivityTabs,
        required: true,
        trim: true,
      },
      isSelected: {
        type: Boolean,
        default: false,
        required: true,
      },
      note: {
        type: String,
        require: true,
        trim: true,
      },
      notes: [
        {
          centerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Center', // assuming you have a Center model
            required: true,
          },
          text: {
            type: String,
            trim: true,
            default: '',
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

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

const GroupActivity = mongoose.model<IGroupActivity>(
  Collections.groupActivity.name,
  groupActivitySchema
);

export default GroupActivity;
