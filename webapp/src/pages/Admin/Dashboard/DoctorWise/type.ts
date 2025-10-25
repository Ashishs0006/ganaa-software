export interface IPatient {
  _id: string;
  firstName: string;
  lastName: string;
  uhid: number | string;
  patientPicUrl: string;
  gender?: string;
  centerId?: ICenter;
}

export interface IDoctor {
  _id: string;
  roleId?: IRole;
  firstName: string;
  lastName: string;
  centerId: ICenter;
}

interface IRole {
  _id: string;
  name: string;
}

interface ICenter {
  _id?: string;
  centerName?: string;
  isDeleted?: boolean;
  createdAt?: string;
}

export interface INote {
  _id: string;
  patientId: string;
  noteDateTime: string;
  doctorId: IDoctor;
  note: string;
  createdBy: string;
  sessionType: string[];
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
  doctors: IDoctor[];
  notes: INote[];
  loa: ILOA[];
}
