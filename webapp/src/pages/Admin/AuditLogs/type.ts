export interface IAuditLogs {
  createdAt: string;
  center: string;
  roomType: string;
  roomNumber: string;
  assignedDoctor: string;
  assignedTherapist: string;
}

export interface ICalcuateData {
  // name?: string;
  // rent?: number;
  // noOfDays?: number;
  // discount?: number;
  // total?: number;
  key?: string;
  roomNumber?: string;
  center?: string;
  roomType?: string;
  roomTypeId?: string;
  totalNumberOfDaysSpent?: number;
  startDate?: string;
  endDate?: string;
  pricePerDayPerBed?: number;
  discountPercentage?: number;
}

export interface IState {
  firstName: string;
  lastName: string;
  currentStatus: string;
}
