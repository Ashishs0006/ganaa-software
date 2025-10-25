// Global Import
import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { IRoomNumber } from '../../interfaces/model/resources/i.room.number';

const roomNumberSchema = new mongoose.Schema<IRoomNumber>({
  name: {
    type: String,
    trim: true,
    index: true,
  },
  roomTypeId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.roomType.name,
  },
  totalBeds: {
    type: Number,
    required: true,
    default: 0,
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

const RoomNumber = mongoose.model<IRoomNumber>(Collections.roomNumber.name, roomNumberSchema);

export default RoomNumber;
