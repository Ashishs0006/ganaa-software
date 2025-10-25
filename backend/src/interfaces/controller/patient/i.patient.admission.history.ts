export type IAuditLogFields = {
  dateOfAdmission: Date | string | undefined;
  center: string;
  roomType: string;
  roomTypeId: string;
  roomNumber: string;
  assignedDoctor: string;
  assignedTherapist: string;
  createdAt: Date | string | undefined;
};

export type IRoomStaySummary = {
  key: string;
  roomNumber: string;
  center: string;
  roomType: string;
  roomTypeId: string;
  totalNumberOfDaysSpent: number;
  startDate: string;
  endDate: string;
};

export type IExtendedRoomStaySummary = IRoomStaySummary & {
  pricePerDayPerBed: number;
  discountPercentage?: number;
};
