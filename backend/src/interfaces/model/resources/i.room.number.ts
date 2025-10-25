import mongoose, { ObjectId } from 'mongoose';
import { IRoomType } from './i.room.type';

export interface IRoomNumber extends mongoose.Document {
  name?: string;
  roomTypeId?: ObjectId | IRoomType;
  totalBeds?: number;
  isDeleted: boolean;
  createdAt: Date;
}
