export interface IGenderCounts {
  male: number;
  female: number;
  other: number;
}

export interface IMetadata {
  startDateTime: Date;
  endDateTime: Date;
}

export interface ICenterMetrics {
  totalAdmission: number;
  gender: IGenderCounts;
  age: number[];
  repeatRate: number[];
  involuntary: number;
  addiction: number;
  addictionAndMentalDisorder: number;
  mentalDisorder: number;
  onlineReferralSource: number;
  dischargeTotal: number;
  lama: number;
  absconding: number;
  reffered: number;
  routineDischarge: number;
  onRequestDischarge: number;
  partialImprovement: number;
  improvement: number;
  statusQuo: number;
  shiftedToAnotherCenter: number;
  averageStayDuration: number[];
  occupiedBedDays: number;
  totalAvailableBedDays: number;
  singleTotalAvailableBedDays: number;
  singleTotalOccupiedBedDays: number;
  singleTotalOccupiedBedDaysRate: number;
  doubleTotalAvailableBedDays: number;
  doubleTotalOccupiedBedDays: number;
  doubleTotalOccupiedBedDaysRate: number;
  tripleTotalAvailableBedDays: number;
  tripleTotalOccupiedBedDays: number;
  tripleTotalOccupiedBedDaysRate: number;
  quadTotalAvailableBedDays: number;
  quadTotalOccupiedBedDays: number;
  quadTotalOccupiedBedDaysRate: number;
  acuteTotalAvailableBedDays: number;
  acuteTotalOccupiedBedDays: number;
  acuteTotalOccupiedBedDaysRate: number;
}

export interface ICenterInfo {
  id: string;
  centerName: string;
  metadata: IMetadata;
  metric: ICenterMetrics;
}
