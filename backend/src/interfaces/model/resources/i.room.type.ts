import mongoose, { ObjectId } from 'mongoose';
import { ICenter } from './i.center';

export interface IRoomType extends mongoose.Document {
  name?: string;
  order?: number;
  maxOccupancy: number;
  centerId?: ObjectId | ICenter;
  pricePerDayPerBed: Number;
  isDeleted: boolean;
  createdAt: Date;
}
