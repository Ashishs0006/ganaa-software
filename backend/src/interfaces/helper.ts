export interface IValidateIdsParms {
  patientId?: string;
  assignedDoctorId?: string;
  admissionHistoryId?: string;
  assignedTherapistId?: string;
  centerId?: string;
  roomTypeId?: string;
  roomNumberId?: string;
  lockerNumberId?: string;
}

export type IMonthRange = {
  startDateTime: Date;
  endDateTime: Date;
};
