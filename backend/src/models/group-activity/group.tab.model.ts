import mongoose from 'mongoose';
import Constants from '../../constant/index';
import Collections from '../../constant/collections';
import { IGroupTab } from '../../interfaces/model/group-activity/i.group.tab';

const groupTabSchema = new mongoose.Schema<IGroupTab>({
  activityDateTime: {
    type: Date,
    required: [true, 'Activity Datetime is Mandatory'],
  },

  // Scope tab info to a specific center so notes can be per-center
  centerId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.center?.name || 'Center',
    required: true,
  },

  tabInfo: [
    {
      name: {
        type: String,
        enum: Constants.groupActivityTabs,
        required: true,
        trim: true,
      },
      note: {
        type: String,
        require: true,
        trim: true,
      },
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

// Ensure uniqueness per date + center
groupTabSchema.index({ activityDateTime: 1, centerId: 1 }, { unique: true });

const GroupTab = mongoose.model<IGroupTab>(Collections.groupTab.name, groupTabSchema);

export default GroupTab;
