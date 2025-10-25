import mongoose, { ObjectId } from 'mongoose';

export interface ICenterGendersCount {
  male: number;
  female: number;
  other: number;
}

export interface IRoomTypeInfo {
  roomTypeId: ObjectId;
  name: string;
  maxOccupancy: number;
  totalRooms: number;
  totalOccupiedBeds: number;
}
export interface ICenterInfo {
  centerId: ObjectId;
  repeatAdmission: Number;
  newAdmission: Number;
  centerDischarge: number;
  centerName: string;
  roomTypes: IRoomTypeInfo[];
  centerGenders: ICenterGendersCount;
}

export interface IDailyResourceAllocationReportSchema extends mongoose.Document {
  date: Date;
  reports: ICenterInfo[];

  createdAt: Date;
}
