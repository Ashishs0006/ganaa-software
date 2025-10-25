import mongoose from 'mongoose';

interface IRoomTypeWithCount {
  name: string;
  order: number;
  totalRooms: number;
}

export interface ICenterWithRoomTypes {
  centerName: string;
  roomType: IRoomTypeWithCount[];
}

export interface ICenter extends mongoose.Document {
  centerName?: string;
  googleMapLink?: String;
  isDeleted: boolean;

  createdAt: Date;
}
