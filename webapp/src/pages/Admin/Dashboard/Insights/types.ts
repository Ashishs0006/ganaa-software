interface ICenterMetric {
  totalAdmission: number;
  gender: {
    male: number;
    female: number;
    other: number;
  };
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
  onRequestDischarge: number;
  partialImprovement: number;
  improvement: number;
  statusQuo: number;
  routineDischarge: number;
  reffered: number;
  financialContraints: number;
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

export interface IInsightData {
  [key: string]: Array<{
    id: string | number;
    centerName: string;
    metadata: {
      startDateTime: string; // ISO string
      endDateTime: string; // ISO string
    };
    metric: ICenterMetric;
  }>;
}
