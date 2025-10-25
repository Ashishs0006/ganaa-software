export interface IPatient {
  _id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  uhid: number | string;
  patientPicUrl: string;
  gender?: string;
  resourceAllocation?: { centerId: string; nurse: string };
}

interface ICenter {
  _id: string;
  centerName: string;
  googleMapLink: string;
  centerUID: string;
  isDeleted: boolean;
  createdAt: string;
}

interface IRole {
  _id: string;
  name: string;
}

interface IUser {
  _id: string;
  roleId: string | IRole;
  firstName: string;
  lastName: string;
  centerId: string | ICenter;
}

interface ITherapistNotes {
  _id: string;
  patientId: string;
  patientAdmissionHistoryId: string;
  noteDateTime: string;
  note: string;
  therapistId: string | IUser;
  sessionType: string;
  score: string;
  subSessionType: string;
  file: { fileName: string; filePath: string };
  createdBy: string;
  createdAt: string;
}

interface IDoctorNotes {
  _id: string;
  patientId: string;
  patientAdmissionHistoryId: string;
  noteDateTime: string;
  note: string;
  sessionType: string[];
  doctorId: string | IUser;
  createdBy: string;
  createdAt: string;
}

interface INurseNotes {
  _id: string;
  patientId: string;
  patientAdmissionHistoryId: string;
  bp: string;
  pulse: string;
  temperature: string;
  spo2: string;
  weight: string;
  rbs: string;
  height: string;
  note: string;
  noteDateTime: string;
  createdAt: string;
}

interface IActivity {
  _id: string;
  name: string;
  isSelected: boolean;
  note: string;
  createdAt: string;
}

interface IGroupActivity {
  _id: string;
  patientId: string;
  activityDateTime: string;
  activity: IActivity[];
  createdAt: string;
}

interface ILOA {
  _id: string;
  patientId: string;
  patientAdmissionHistoryId: string;
  loa: boolean;
  createdBy: string;
  createdAt: string;
  noteDateTime: string;
}

export interface IData {
  patients: IPatient[];
  therapistNotes: ITherapistNotes[];
  doctorNotes: IDoctorNotes[];
  nurseNotes: INurseNotes[];
  groupActivityNotes: IGroupActivity[];
  loa: ILOA[];
}

export interface IModalData {
  therapistNotes: ITherapistNotes[];
  doctorNotes: IDoctorNotes[];
  nurseNotes: INurseNotes[];
  groupActivityNotes: IGroupActivity[];
}
