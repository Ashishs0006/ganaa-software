// Global Import
import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { IDailyResourceAllocationReportSchema } from '../../interfaces/model/reports/i.daily.resource.report';

const dailyResourceAllocationReportSchema =
  new mongoose.Schema<IDailyResourceAllocationReportSchema>({
    date: {
      type: Date,
      index: true,
      unique: true,
    },
    reports: [
      {
        centerId: mongoose.Schema.ObjectId,
        centerName: String,
        roomTypes: [
          {
            roomTypeId: mongoose.Schema.ObjectId,
            name: String,
            maxOccupancy: Number,
            totalRooms: Number,
            totalOccupiedBeds: Number,
          },
        ],
        repeatAdmission: Number,
        newAdmission: Number,
        centerDischarge: Number,
        centerGenders: {
          male: Number,
          female: Number,
          other: Number,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

const DailyResourceAllocationReport = mongoose.model<IDailyResourceAllocationReportSchema>(
  Collections.dailyResourceAllocationReport.name,
  dailyResourceAllocationReportSchema
);

export default DailyResourceAllocationReport;
