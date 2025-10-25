import mongoose, { ObjectId } from 'mongoose';
import { IPatient } from './i.patient';
import { IIllnessType } from '../i.familiar';
import { ICenter } from '../resources/i.center';
import { IUser } from '../../../models/user.model';
import { IRoomType } from '../resources/i.room.type';
import { IPatientFeedback } from './i.patient.feedback';
import { IRoomNumber } from '../resources/i.room.number';
import { IPatientDischarge } from './i.patient.discharge';
import { ILockerNumber } from '../resources/i.locker.number';
import { IPatientCaseHistory } from './i.patient.case.history';

export type IStatus = 'Registered' | 'Inpatient' | 'Discharge Initiated' | 'Discharged';

export interface IInjuriesDetails {
  injuryName?: string;
  fileUrls?: { fileName: string; filePath: string }[];
}
export interface IPatientReport {
  injuriesDetails?: IInjuriesDetails[];
  allergiesNames?: string[];
  allergiesFiles?: { fileName: string; filePath: string }[];
  diabeticStatus?: 'Diabetic' | 'Non Diabetic' | '';
  hyperTension?: 'Yes' | 'No';
  heartDisease?: 'Yes' | 'No';
  heartDiseaseDescription: string;
  levelOfRisk?: 'High' | 'Medium' | 'Low' | '';
  levelOfRiskDescription?: string;
  previousTreatmentRecord?: { fileName: string; filePath: string }[];
  updatedAt?: Date;
}

export interface IResourceAllocation {
  centerId?: ObjectId | ICenter;
  roomTypeId?: ObjectId | IRoomType;
  roomNumberId?: ObjectId | IRoomNumber;
  lockerNumberId?: ObjectId | ILockerNumber;
  belongingsInLocker?: string;
  assignedDoctorId?: ObjectId | IUser;
  assignedTherapistId?: ObjectId | IUser;
  nurse?: string;
  careStaff?: string;
  updatedAt?: Date;
}

export interface IAdmissionChecklist {
  applicationForAdmission: { fileName: string; filePath: string }[];
  voluntaryAdmissionForm: { fileName: string; filePath: string }[];
  form90: { fileName: string; filePath: string }[];
  inVoluntaryAdmissionForm: { fileName: string; filePath: string }[];
  minorAdmissionForm: { fileName: string; filePath: string }[];
  familyDeclaration: { fileName: string; filePath: string }[];
  section94: { fileName: string; filePath: string }[];
  capacityAssessment: { fileName: string; filePath: string }[];
  admissionAssessment: { fileName: string; filePath: string }[];
  hospitalGuidelineForm: { fileName: string; filePath: string }[];
  finacialCounselling: { fileName: string; filePath: string }[];
  orientationOfFamily: string[];
  orientationOfPatient: string[];
  isInsured: boolean;
  insuredDetail: string;
  insuredFile: { fileName: string; filePath: string }[];
}

export interface IResourceDiscount {
  key: string;
  roomNumber: string;
  center: string;
  roomType: string;
  roomTypeId: string;
  totalNumberOfDaysSpent: number;
  startDate: Date;
  endDate: Date;
  discountPercentage: number;
  pricePerDayPerBed: number;
}
export interface IPatientAdmissionHistory extends mongoose.Document {
  patientId: ObjectId | IPatient;

  dateOfAdmission?: Date;

  caseHistoryId?: ObjectId | IPatientCaseHistory;

  dischargeId?: ObjectId | IPatientDischarge;

  feedbackId?: ObjectId | IPatientFeedback;

  // Diagnosis
  illnessType?: IIllnessType;

  // Admission Type
  admissionType?: 'Voluntary' | 'Involuntary';
  involuntaryAdmissionType?: 'Rescued' | 'Brought by family';

  // Patient Status
  currentStatus?: IStatus;

  //AdmissionChecklist
  admissionChecklist?: IAdmissionChecklist;

  // Resource Allocation
  resourceAllocation?: IResourceAllocation;
  resourceDiscount?: IResourceDiscount[];

  // Patient Report
  patientReport?: IPatientReport;

  createdBy?: ObjectId | IUser;
  updatedBy?: ObjectId | IUser;

  createdAt: Date;
}
