// Global Import
import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { IRoomType } from '../../interfaces/model/resources/i.room.type';

const roomTypeSchema = new mongoose.Schema<IRoomType>({
  name: {
    type: String,
    trim: true,
    index: true,
  },
  maxOccupancy: {
    type: Number,
    default: 0,
    index: true,
  },
  order: {
    type: Number,
  },
  centerId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.center.name,
  },
  pricePerDayPerBed: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const RoomType = mongoose.model<IRoomType>(Collections.roomType.name, roomTypeSchema);

export default RoomType;
