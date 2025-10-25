export interface IDailyProgressState {
  DateRangeModal: boolean;
  UHID: string;
  totalPage: string;
  firstName: string;
  lastName: string;
  currentStatus: string;
  patientProfilePic: string;
  admissionDate: string;
  AssignedDoctor: string;
  AssignedTherapist: string;
  center: string;
  roomNumber: string;
  illnessType: string;
  TestReportFile: string;
  TestReportName: string;
  historyId: string;
  gender: string;
  age: string;
}

export interface IUsages {
  frequency: string;
  quantity: number;
  when: string;
  dosage: string;
}

export interface IMedicinesInfo {
  customDuration?: string;
  durationFrequency?: string;
  prescribedWhen?: string;
  instructions?: string;
  usages: IUsages[];
  medicine?: { name?: string; dosage?: string[] };
}

interface IPermission {
  resource: string;
  actions: string[];
}

interface IRoles {
  _id?: string;
  name?: string;
  permissions?: IPermission[];
}

export interface IDailyProgress {
  _id?: string;
  createdAt?: string;
  noteDateTime?: string;
  bp?: string;
  therapistId?: {
    _id?: string;
    firstName?: string;
    gender?: string;
    lastName?: string;
    roleId?: IRoles;
  };
  doctorId?: {
    _id?: string;
    firstName?: string;
    gender?: string;
    lastName?: string;
    roleId?: IRoles;
  };
  pulse?: string;
  temperature?: string;
  spo2?: string;
  weight?: string;
  rbs?: string;
  height?: string;
  note?: string;
  docType?: string;
  file?: { url: string; fileName: string };
  sessionType?: [];
  score?: string;
  subSessionType?: string;

  medicinesInfo?: IMedicinesInfo[];
}
