import mongoose, { ObjectId } from 'mongoose';
import { IUser } from '../../../models/user.model';
import { IActivityName } from './i.group.activity';

export interface IGroupTab extends mongoose.Document {
  activityDateTime: Date;
  centerId: ObjectId;
  tabInfo: [
    {
      name: IActivityName;
      note?: string;
      createdAt: Date;
    },
  ];
  createdBy?: ObjectId | IUser;
  createdAt: Date;
}
